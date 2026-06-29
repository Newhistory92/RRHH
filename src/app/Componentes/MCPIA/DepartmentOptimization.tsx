"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Brain,
  AlertTriangle,
  Users,
  Target,
  ArrowRightLeft,
  ShieldAlert,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FileText,
  Zap,
  TrendingUp,
} from "lucide-react";
import type {
  OrgAnalysisReport,
  RiskHeatMapEntry,
  RelocationProposal,
  SkillGapEntry,
  SPOFEntry,
} from "@/app/Interfas/Interfaces";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface DepartmentOptimizationProps {
  onBack: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const riskColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Alto:  { bg: "bg-error-soft",   text: "text-error-soft-foreground",   border: "border-error",   dot: "bg-error" },
  Medio: { bg: "bg-warning-soft", text: "text-warning-soft-foreground", border: "border-warning", dot: "bg-warning" },
  Bajo:  { bg: "bg-success-soft", text: "text-success-soft-foreground", border: "border-success", dot: "bg-success" },
};

function RiskBadge({ level }: { level: string }) {
  const c = riskColors[level] || riskColors.Bajo;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {level}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Wrapper (collapsible)
// ─────────────────────────────────────────────────────────────────────────────

function Section({
  title,
  icon,
  count,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          {count !== undefined && (
            <span className="bg-primary/15 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        {open ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
      </button>
      {open && <div className="px-6 pb-6 border-t border-border">{children}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const DepartmentOptimization = ({ onBack }: DepartmentOptimizationProps) => {
  const [report, setReport] = useState<OrgAnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{ totalEmployees: number; totalDepartments: number } | null>(null);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/org-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const result = await response.json();

      if (result.success) {
        setReport(result.data);
        setMetadata(result.metadata);
      } else {
        throw new Error(result.error || "Error desconocido");
      }
    } catch (err) {
      console.error("Error en análisis organizacional:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="text-center">
          <div className="relative">
            <Brain className="w-20 h-20 text-primary mx-auto mb-6 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full animate-ping" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Analizando Estructura Organizacional
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Procesando habilidades, brechas, riesgos y oportunidades de movilidad con IA...
          </p>
          <div className="mt-6 flex justify-center gap-1">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="animate-fade-in p-4">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={20} /> Volver
        </button>
        <div className="bg-error-soft border border-error rounded-xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4" />
          <h3 className="text-lg font-bold text-error-soft-foreground mb-2">Error en el Análisis</h3>
          <p className="text-error mb-4">{error}</p>
          <button
            onClick={fetchAnalysis}
            className="inline-flex items-center gap-2 px-4 py-2 bg-error text-error-soft-foreground rounded-lg hover:opacity-90 transition-colors"
          >
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const highRiskCount = report.riskHeatMap.filter(r => r.riskLevel === "Alto").length;

  // ── Report ──────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
        <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/15 p-2 rounded-lg">
              <Zap className="text-primary" size={28} />
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground">
              Análisis Organizacional con IA
            </h1>
          </div>
          <p className="text-muted-foreground">
            {metadata && `${metadata.totalEmployees} empleados · ${metadata.totalDepartments} departamentos · `}
            Generado el {new Date(report.analysisDate).toLocaleDateString("es-AR")}
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-center">
          <button
            onClick={fetchAnalysis}
            className="flex items-center gap-2 text-sm font-semibold border-2 border-primary text-primary px-4 py-2 rounded-lg transition-all hover:bg-primary hover:text-primary-foreground"
          >
            <RefreshCw size={16} /> Regenerar
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold border-2 border-border text-muted-foreground px-4 py-2 rounded-lg transition-all hover:bg-muted"
          >
            <ArrowLeft size={16} /> Volver
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={22} />} color="cyan" label="Empleados" value={metadata?.totalEmployees ?? 0} />
        <StatCard icon={<Target size={22} />} color="green" label="Departamentos" value={metadata?.totalDepartments ?? 0} />
        <StatCard icon={<AlertTriangle size={22} />} color="red" label="Depts en Riesgo Alto" value={highRiskCount} />
        <StatCard icon={<ArrowRightLeft size={22} />} color="purple" label="Reubicaciones Sugeridas" value={report.relocationProposals.length} />
      </div>

      {/* 1. Resumen Ejecutivo */}
      <Section title="Resumen Ejecutivo" icon={<FileText size={20} className="text-primary" />} defaultOpen={true}>
        <div className="mt-4 prose max-w-none">
          <p className="text-foreground leading-relaxed whitespace-pre-line">
            {report.executiveSummary}
          </p>
        </div>
      </Section>

      {/* 2. Mapa de Calor de Riesgos */}
      <Section
        title="Mapa de Calor de Riesgos"
        icon={<ShieldAlert size={20} className="text-warning" />}
        count={report.riskHeatMap.length}
      >
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Departamento</th>
                <th className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Riesgo</th>
                <th className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Empleados</th>
                <th className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {report.riskHeatMap.map((entry: RiskHeatMapEntry, i: number) => (
                <tr key={i} className="border-b border-border last:border-b-0 hover:bg-muted transition-colors">
                  <td className="p-3 font-medium text-foreground">{entry.department}</td>
                  <td className="p-3"><RiskBadge level={entry.riskLevel} /></td>
                  <td className="p-3 text-muted-foreground">{entry.employeeCount}</td>
                  <td className="p-3 text-sm text-muted-foreground">{entry.mainRisk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 3. Brechas de Habilidades */}
      <Section
        title="Brechas de Habilidades"
        icon={<TrendingUp size={20} className="text-error" />}
        count={report.skillGaps.length}
        defaultOpen={false}
      >
        {report.skillGaps.length === 0 ? (
          <p className="mt-4 text-muted-foreground italic">No se detectaron brechas de habilidades.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.skillGaps.map((gap: SkillGapEntry, i: number) => (
              <div key={i} className="border border-error bg-error-soft rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-foreground">{gap.department}</span>
                  <span className="text-xs bg-error-soft text-error-soft-foreground px-2 py-0.5 rounded-full">
                    Nivel: {gap.requiredLevel}
                  </span>
                </div>
                <p className="text-sm text-error font-medium">Falta: {gap.missingSkill}</p>
                <p className="text-xs text-muted-foreground mt-1">{gap.riskDescription}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 4. Propuestas de Reubicación */}
      <Section
        title="Propuestas de Reubicación"
        icon={<ArrowRightLeft size={20} className="text-warm-contrast" />}
        count={report.relocationProposals.length}
      >
        {report.relocationProposals.length === 0 ? (
          <p className="mt-4 text-muted-foreground italic">
            No se generaron propuestas de reubicación. Esto puede significar que no hay brechas que se cubran con talento existente.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Empleado</th>
                  <th className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dept. Actual</th>
                  <th className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dept. Sugerido</th>
                  <th className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Razón</th>
                </tr>
              </thead>
              <tbody>
                {report.relocationProposals.map((p: RelocationProposal, i: number) => (
                  <tr key={i} className="border-b border-border last:border-b-0 hover:bg-muted transition-colors">
                    <td className="p-3 font-medium text-foreground">{p.employeeName}</td>
                    <td className="p-3 text-muted-foreground">{p.currentDept}</td>
                    <td className="p-3">
                      <span className="bg-warm-contrast/15 text-warm-contrast text-xs font-bold px-2.5 py-1 rounded-full">
                        {p.suggestedDept}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{p.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* 5. Puntos Únicos de Fallo */}
      <Section
        title="Puntos Únicos de Fallo"
        icon={<AlertTriangle size={20} className="text-warning" />}
        count={report.singlePointsOfFailure.length}
        defaultOpen={false}
      >
        {report.singlePointsOfFailure.length === 0 ? (
          <p className="mt-4 text-muted-foreground italic">No se detectaron puntos únicos de fallo.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {report.singlePointsOfFailure.map((spof: SPOFEntry, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 border border-warning bg-warning-soft rounded-lg">
                <ShieldAlert size={18} className="text-warning mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {spof.department} — <span className="text-warning">{spof.criticalSkill}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Único poseedor: <strong>{spof.soleHolder}</strong> · {spof.risk}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 6. Plan de Acción */}
      <Section title="Plan de Acción" icon={<CheckCircle size={20} className="text-success" />} count={report.actionPlan.length}>
        <div className="mt-4 space-y-3">
          {report.actionPlan.map((step: string, i: number) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-muted rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                {i + 1}
              </div>
              <p className="text-foreground pt-1">{step}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <div className="p-5 text-center bg-card rounded-lg border border-border">
        <p className="text-xs text-muted-foreground max-w-3xl mx-auto">
          <strong>Metodología:</strong> Este análisis cruza habilidades requeridas por departamento contra competencias
          reales de empleados, detecta brechas, identifica talento subutilizado y genera propuestas de movilidad interna.
          El resumen ejecutivo y plan de acción son generados por IA (Gemini) a partir de datos reales.
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ icon, color, label, value }: { icon: React.ReactNode; color: string; label: string; value: number | string }) {
  const colorMap: Record<string, string> = {
    cyan: "bg-primary/15 text-primary",
    green: "bg-accent/15 text-accent",
    red: "bg-error-soft text-error",
    purple: "bg-warm-contrast/15 text-warm-contrast",
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 shadow-sm">
      <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
