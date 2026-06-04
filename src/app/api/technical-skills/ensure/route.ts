import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, profession } = body;

    if (!name) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    // Normalizar nombre (quitar espacios extra, etc)
    const normalizedName = name.trim();

    // 1. Buscar si ya existe
    let skill = await prisma.technicalSkill.findUnique({
      where: { nombre: normalizedName }
    });

    // 2. Si no existe, crearla
    if (!skill) {
      skill = await prisma.technicalSkill.create({
        data: {
          nombre: normalizedName,
          profession: profession || normalizedName,
          testType: 'ai-generated',
          description: `Validación de conocimientos técnicos para ${normalizedName}`,
          activo: true
        }
      });
      console.log(`✅ Nueva habilidad técnica creada: ${normalizedName}`);
    }

    return NextResponse.json({ success: true, skill });
  } catch (error) {
    console.error("Error en /api/technical-skills/ensure:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
