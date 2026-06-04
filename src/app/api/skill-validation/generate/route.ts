import { NextRequest, NextResponse } from "next/server";
import { GeminiService } from "@/app/lib/ai-service";
import prisma from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, academicRecordId, technicalSkillId } = body;

    if (!employeeId || (!academicRecordId && !technicalSkillId)) {
      return NextResponse.json({ error: "Faltan parámetros obligatorios" }, { status: 400 });
    }

    // 1. Verificar política de 90 días
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const recentTest = await prisma.testAttempt.findFirst({
      where: {
        employeeId: Number(employeeId),
        ...(academicRecordId ? { academicRecordId: Number(academicRecordId) } : {}),
        ...(technicalSkillId ? { technicalSkillId: Number(technicalSkillId) } : {}),
        takenAt: { gte: ninetyDaysAgo },
        score: "Aprobado" // Solo bloqueamos si ya reprobó? No, regla: "1 test cada 3 meses por habilidad"
      },
      orderBy: { takenAt: "desc" }
    });

    // Validar si existe un cooldown (opcional, si reprobó recientemente)
    const lastAttempt = await prisma.testAttempt.findFirst({
        where: {
            employeeId: Number(employeeId),
            ...(academicRecordId ? { academicRecordId: Number(academicRecordId) } : {}),
            ...(technicalSkillId ? { technicalSkillId: Number(technicalSkillId) } : {}),
        },
        orderBy: { takenAt: "desc" }
    });

    if (lastAttempt && lastAttempt.takenAt >= ninetyDaysAgo && lastAttempt.score === "Reprobado") {
       return NextResponse.json({ 
           error: "Te encuentras en período de Cooldown (90 días) tras desaprobar el último examen para esta formación." 
       }, { status: 403 });
    }
    
    if (lastAttempt && lastAttempt.takenAt >= ninetyDaysAgo && lastAttempt.score === "Aprobado") {
        return NextResponse.json({ 
            error: "Ya aprobaste este examen en los últimos 90 días." 
        }, { status: 403 });
     }

    // 2. Determinar el contexto/tópico del examen
    let topic = "";
    if (academicRecordId) {
      const record = await prisma.academicRecord.findUnique({ where: { id: Number(academicRecordId) }});
      if (!record) return NextResponse.json({ error: "Registro académico no encontrado" }, { status: 404 });
      topic = record.title === "Bachillerato" 
        ? "Administración Pública General, incluyendo procedimientos administrativos, atención al ciudadano y ética pública en Argentina"
        : record.title;
    } else if (technicalSkillId) {
      const skill = await prisma.technicalSkill.findUnique({ where: { id: Number(technicalSkillId) }});
      if (!skill) return NextResponse.json({ error: "Habilidad técnica no encontrada" }, { status: 404 });
      topic = skill.nombre;
    }

    // 3. Generar Examen Único vía Gemini (5 Preguntas)
    const prompt = `Eres un evaluador de talentos de Recursos Humanos en Argentina.
    Debes elaborar un examen técnico de exactamente 5 preguntas de opción múltiple orientado a validar los conocimientos en: "${topic}".
    IMPORTANTE: El examen debe estar enfocado en la Administración Pública Argentina, independientemente del título académico específico.
    Las preguntas NO deben ser demasiado teóricas ni complicadas. Deben basarse en situaciones prácticas del día a día, enfocadas en:
    - Eficiencia y eficacia.
    - Situaciones prácticas de oficina.
    - Manejo de documentación y expedientes.
    - Trato y atención al ciudadano.
    
    Solo 1 opción es correcta, y las otras 3 deben ser verosímiles pero incorrectas.

    ESTRICTAMENTE devuelve un array JSON de la siguiente forma. NI UNA SOLA PALABRA MÁS QUE EL JSON.
    [
      {
        "id": 1,
        "question": "¿Pregunta de ejemplo sobre una situación práctica en la oficina?",
        "options": ["Opción incorrecta", "Opción correcta", "Opción incorrecta", "Opción incorrecta"],
        "correctIndex": 1
      }
    ]`;

    const aiRes = await GeminiService.generateResponse([{ role: "user", content: prompt }]);
    let text = aiRes.text || "[]";
    
    console.log("DEBUG - AI Response for topic:", topic, text);

    // Limpieza de formato Markdown y extracción de JSON usando regex robusto
    try {
      // 1. Quitar bloques de código markdown
      text = text.replace(/```json/gi, "").replace(/```/gi, "").trim();
      
      // 2. Extraer solo el contenido entre los primeros y últimos corchetes [ ]
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("La IA no devolvió un formato JSON válido (no se encontraron corchetes).");
      }
      
      const cleanJson = jsonMatch[0];
      const questions = JSON.parse(cleanJson);

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("La IA devolvió un array vacío o un formato inesperado.");
      }

      return NextResponse.json({ success: true, questions });

    } catch (parseError: any) {
      console.error("Error al parsear respuesta de Gemini:", parseError);
      console.error("Texto original de la IA:", text);
      return NextResponse.json({ 
        error: "Error de formato en la generación del test. Por favor, reintenta.",
        details: parseError.message 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error crítico generando test AI:", error);
    
    // Manejo específico de errores de cuota de la API de Google
    const errorMessage = error.message || "";
    if (errorMessage.includes("quota") || errorMessage.includes("limit") || errorMessage.includes("429")) {
        return NextResponse.json({ 
            error: "El servicio de IA ha alcanzado su límite de pruebas temporales. Por favor, espera un minuto y vuelve a intentar.",
            details: "Quota exceeded" 
        }, { status: 429 });
    }

    return NextResponse.json({ 
        error: "Error interno de servidor generando el test.", 
        details: error.message 
    }, { status: 500 });
  }
}
