/**
 * API Route: /api/reubicacion-analysis
 *
 * Orquesta el motor de analisis IA de reubicacion (subsistema 3):
 * 1. Marca las solicitudes Pendiente/En analisis como En analisis (backend).
 * 2. Obtiene datos de empleados/departamentos (backend, ya existente).
 * 3. Para cada solicitud: corre el motor de matching + Gemini (con fallback).
 * 4. Persiste la recomendacion de cada una (backend).
 */

import { NextRequest, NextResponse } from "next/server";
import { findBestRelocationMatch } from "@/app/lib/reubicacion-matching-engine";
import { buildRecomendacionPrompt, buildFallbackRecomendacion } from "@/app/lib/reubicacion-recomendacion-prompt";
import { GeminiService } from "@/app/lib/ai-service";
import type { OrgAnalysisEmployee, OrgAnalysisDepartment } from "@/app/Interfas/Interfaces";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

interface SolicitudAAnalizar {
  id: number;
  employeeId: number;
  employeeName: string;
  tipo: string;
  motivo: string;
  officeIdActual: number | null;
  departmentIdActual: number | null;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const backendHeaders = { "Content-Type": "application/json", Authorization: authHeader };

  try {
    // ── 1. Marcar solicitudes como "En análisis" ────────────────────────────
    const iniciarResponse = await fetch(`${BACKEND_URL}/reubicacion/analizar/iniciar`, {
      method: "POST",
      headers: backendHeaders,
    });
    if (!iniciarResponse.ok) {
      throw new Error(`Backend respondió con status ${iniciarResponse.status} al iniciar el análisis`);
    }
    const { solicitudes }: { solicitudes: SolicitudAAnalizar[] } = await iniciarResponse.json();

    if (solicitudes.length === 0) {
      return NextResponse.json({ success: true, analizadas: 0, errores: [] });
    }

    // ── 2. Obtener datos de empleados y departamentos ───────────────────────
    const dataResponse = await fetch(`${BACKEND_URL}/rrhh/org-analysis-data`, {
      method: "GET",
      headers: backendHeaders,
    });
    if (!dataResponse.ok) {
      throw new Error(`Backend respondió con status ${dataResponse.status} al obtener org-analysis-data`);
    }
    const { employees, departments }: { employees: OrgAnalysisEmployee[]; departments: OrgAnalysisDepartment[] } =
      await dataResponse.json();

    // ── 3. Analizar cada solicitud ───────────────────────────────────────────
    let analizadas = 0;
    const errores: { solicitudId: number; motivo: string }[] = [];

    for (const solicitud of solicitudes) {
      try {
        const employee = employees.find((e) => e.id === solicitud.employeeId);
        if (!employee) {
          errores.push({ solicitudId: solicitud.id, motivo: "Empleado no encontrado en org-analysis-data" });
          continue;
        }

        const match = findBestRelocationMatch(employee, employees, departments);

        let recomendacion = buildFallbackRecomendacion(match);
        try {
          const prompt = buildRecomendacionPrompt(employee, solicitud.motivo, match);
          const aiResponse = await GeminiService.generateResponse([
            { role: "system", content: "Eres un consultor de RRHH. Responde SOLO con JSON válido." },
            { role: "user", content: prompt },
          ]);
          const jsonMatch = (aiResponse.text || "").match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.explicacion && Array.isArray(parsed.beneficios) && Array.isArray(parsed.riesgos)) {
              recomendacion = parsed;
            }
          }
        } catch (aiError) {
          console.error(`IA falló para solicitud ${solicitud.id}, usando fallback:`, aiError);
        }

        const patchResponse = await fetch(`${BACKEND_URL}/reubicacion/${solicitud.id}/recomendacion`, {
          method: "PATCH",
          headers: backendHeaders,
          body: JSON.stringify({
            officeIdSugerido: match.officeIdSugerido,
            departmentIdSugerido: match.departmentIdSugerido,
            scoreCompatibilidad: match.scoreCompatibilidad,
            explicacionIA: recomendacion.explicacion,
            beneficios: recomendacion.beneficios,
            riesgos: recomendacion.riesgos,
          }),
        });
        if (!patchResponse.ok) {
          throw new Error(`Backend respondió con status ${patchResponse.status}`);
        }

        analizadas++;
      } catch (err) {
        errores.push({
          solicitudId: solicitud.id,
          motivo: err instanceof Error ? err.message : "Error desconocido",
        });
      }
    }

    return NextResponse.json({ success: true, analizadas, errores });
  } catch (error) {
    console.error("Error en análisis de reubicación:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
