import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, academicRecordId, technicalSkillId, questions, userAnswers } = body;

    if (!employeeId || (!academicRecordId && !technicalSkillId) || !questions || !userAnswers) {
      return NextResponse.json({ error: "Faltan parámetros obligatorios" }, { status: 400 });
    }

    // 1. Evaluar las respuestas (mínimo 3 de 5 correctas)
    let correctCount = 0;
    const totalQuestions = questions.length;

    questions.forEach((q: any, i: number) => {
      if (userAnswers[i] === q.correctIndex) {
        correctCount++;
      }
    });

    const correctPct = (correctCount / totalQuestions) * 100;
    const score = correctPct >= 60 ? "Aprobado" : "Reprobado";

    // 2. Guardar el TestAttempt
    const attempt = await prisma.testAttempt.create({
      data: {
        employeeId: Number(employeeId),
        academicRecordId: academicRecordId ? Number(academicRecordId) : null,
        technicalSkillId: technicalSkillId ? Number(technicalSkillId) : null,
        score,
        correctPct,
        questionsUsed: JSON.stringify(questions.map((q: any) => q.question)), // Solo guardamos la metadata de lo que se preguntó
      }
    });

    // 3. Consecuencias del examen
    if (academicRecordId) {
      // Si aplicaba a una formación académica, actualizar su badge "isVerified"
      await prisma.academicRecord.update({
        where: { id: Number(academicRecordId) },
        data: { isVerified: score === "Aprobado" }
      });
    }

    if (technicalSkillId) {
      // Intentar actualizar la relación existente
      const existingSkill = await prisma.employeeTechnicalSkill.findFirst({
        where: { 
            employeeId: Number(employeeId), 
            technicalSkillId: Number(technicalSkillId) 
        }
      });

      if (existingSkill) {
        await prisma.employeeTechnicalSkill.update({
          where: { id: existingSkill.id },
          data: { certified: score === "Aprobado", level: score === "Aprobado" ? "Alto" : "Bajo" }
        });
      } else {
        await prisma.employeeTechnicalSkill.create({
          data: {
            employeeId: Number(employeeId),
            technicalSkillId: Number(technicalSkillId),
            certified: score === "Aprobado",
            level: score === "Aprobado" ? "Alto" : "Bajo"
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      score,
      correctCount,
      totalQuestions,
      attemptId: attempt.id
    });

  } catch (error: any) {
    console.error("Error evaluando test:", error);
    return NextResponse.json({ error: "Error de servidor guardando los resultados." }, { status: 500 });
  }
}
