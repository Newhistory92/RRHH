# Retema de IA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recolorear el módulo de Herramientas de IA (dashboard de selección + 3 herramientas) de la paleta cian/azul/slate/gris a los tokens semánticos "Orgánico Cálido" ya definidos en `src/app/globals.css`, sin cambiar lógica de fetch/estado ni UX.

**Architecture:** Cambios puramente de `className` en 5 archivos existentes, agrupados en 5 tareas. Ningún archivo nuevo, ninguna firma de componente cambia.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS v4 (tokens vía `@theme inline` en `globals.css`), PrimeReact (`Card`/`ProgressBar` — heredan tema global, no se tocan), lucide-react (iconos).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-06-25-retheme-ia-design.md`
- Cambio **puramente visual** — no se toca lógica de fetch/estado: `fetchPredictiveAnalysis` (`Predictive.tsx`); `handleSend` (`HRChatbot.tsx`); `fetchAnalysis` (`DepartmentOptimization.tsx`).
- No se cambian firmas de componentes ni props.
- El color dinámico `bg-${dept.color}-500` en `Predictive.tsx` (viene de datos del backend) queda sin cambios.
- Tokens semánticos a usar (ya existen en `globals.css`, no se crean nuevos): `bg-background`, `bg-card`, `bg-muted`, `bg-primary`/`text-primary-foreground`, `text-primary`, `text-accent`, `text-warm-contrast`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-warning`, `bg-warning-soft`/`text-warning-soft-foreground`, `text-error`, `bg-error-soft`/`text-error-soft-foreground`, `text-success`, `bg-success-soft`/`text-success-soft-foreground`, `font-heading`.
- Verificación por tarea: `npx tsc --noEmit` (sin test suite automatizado para cambios puramente visuales, igual que en las 7 fases de retema anteriores).
- Commits: un commit por tarea, mensaje `feat: retemear <archivo(s)> a tokens organico-calido`.

---

### Task 1: `Screen.tsx` (dashboard de selección)

**Files:**
- Modify: `src/app/screens/IA/Screen.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nada nuevo.

- [ ] **Step 1: Fondo raíz, título y las 3 cards**

Antes (líneas 25-44, 50):
```tsx
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Herramientas de IA</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card onClick={() => setActiveComponent('predictive')}>
                <BrainCircuit size={40} className="text-blue-500 mb-4" />
                <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-white">Análisis Predictivo</h3>
                <p className="text-gray-600 dark:text-gray-400">Anticipa tendencias de rotación de personal y picos de productividad.</p>
              </Card>
              <Card onClick={() => setActiveComponent('chatbot')}>
                <Users size={40} className="text-green-500 mb-4" />
                <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-white">Chatbot de RRHH</h3>
                <p className="text-gray-600 dark:text-gray-400">Responde preguntas frecuentes de empleados sobre políticas y beneficios.</p>
              </Card>
              <Card onClick={() => setActiveComponent('optimization')}>
                <BarChart2 size={40} className="text-purple-500 mb-4" />
                <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-white">Optimización de Departamentos</h3>
                <p className="text-gray-600 dark:text-gray-400">Analiza la estructura de la empresa para una mayor eficiencia.</p>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6 md:p-8">
```

Después:
```tsx
          <div className="animate-fade-in">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">Herramientas de IA</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card onClick={() => setActiveComponent('predictive')}>
                <BrainCircuit size={40} className="text-primary mb-4" />
                <h3 className="font-bold text-xl mb-2 text-foreground">Análisis Predictivo</h3>
                <p className="text-muted-foreground">Anticipa tendencias de rotación de personal y picos de productividad.</p>
              </Card>
              <Card onClick={() => setActiveComponent('chatbot')}>
                <Users size={40} className="text-warm-contrast mb-4" />
                <h3 className="font-bold text-xl mb-2 text-foreground">Chatbot de RRHH</h3>
                <p className="text-muted-foreground">Responde preguntas frecuentes de empleados sobre políticas y beneficios.</p>
              </Card>
              <Card onClick={() => setActiveComponent('optimization')}>
                <BarChart2 size={40} className="text-accent mb-4" />
                <h3 className="font-bold text-xl mb-2 text-foreground">Optimización de Departamentos</h3>
                <p className="text-muted-foreground">Analiza la estructura de la empresa para una mayor eficiencia.</p>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-background min-h-screen p-4 sm:p-6 md:p-8">
```

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `Screen.tsx`.

Run: `grep -nE "gray-|blue-|green-|purple-|dark:" src/app/screens/IA/Screen.tsx`
Expected: 0 resultados.

- [ ] **Step 3: Commit**

```bash
git add src/app/screens/IA/Screen.tsx
git commit -m "feat: retemear Screen.tsx de IA a tokens organico-calido"
```

---

### Task 2: `Predictive.tsx` + `StatCard`/`RiskBadge`/`InfoList` (`UiRRHH.tsx`)

**Files:**
- Modify: `src/app/Componentes/MCPIA/Predictive.tsx`
- Modify: `src/app/util/UiRRHH.tsx:983-1030`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: `StatCard`, `RiskBadge`, `InfoList` — mismas firmas (`StatCardProps`, `RiskBadgeProps`, `InfoListProps`), solo cambian las clases CSS. Consumidas sin cambios por `Predictive.tsx` en este mismo task.

- [ ] **Step 1: `Predictive.tsx` — loading y header**

Antes (líneas 56-91):
```tsx
      <div className="bg-slate-50 dark:bg-slate-900 flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <Brain className="w-20 h-20 text-cyan-500 animate-pulse mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">Analizando Datos con IA</h2>
          <p className="text-slate-500 dark:text-slate-400">Procesando patrones y generando predicciones...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-cyan-100 dark:bg-cyan-900/50 p-2 rounded-lg">
                <Zap className="text-[#1ABCD7]" size={28} />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Análisis Predictivo de Riesgos</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Predicción de rotación y productividad con IA para una gestión proactiva.
            </p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 text-sm font-semibold border-2 border-[#2ecbe7] text-[#1ABCD7] px-4 py-2 rounded-lg transition-all hover:bg-[#2ecbe7] hover:text-white self-start sm:self-center"
          >
```

Después:
```tsx
      <div className="bg-background flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <Brain className="w-20 h-20 text-primary animate-pulse mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Analizando Datos con IA</h2>
          <p className="text-muted-foreground">Procesando patrones y generando predicciones...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-background min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/15 p-2 rounded-lg">
                <Zap className="text-primary" size={28} />
              </div>
              <h1 className="font-heading text-3xl font-bold text-foreground">Análisis Predictivo de Riesgos</h1>
            </div>
            <p className="text-muted-foreground">
              Predicción de rotación y productividad con IA para una gestión proactiva.
            </p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 text-sm font-semibold border-2 border-primary text-primary px-4 py-2 rounded-lg transition-all hover:bg-primary hover:text-primary-foreground self-start sm:self-center"
          >
```

- [ ] **Step 2: `Predictive.tsx` — los 3 `StatCard` del resumen ejecutivo**

Antes (líneas 94-113):
```tsx
          <StatCard 
            icon={<Users size={24} className="text-cyan-500" />}
            title="Empleados Analizados"
            value={analysis.reduce((sum, d) => sum + d.employees, 0)}
            colorClass="bg-cyan-100 dark:bg-cyan-900/50"
          />
          <StatCard 
            icon={<AlertTriangle size={24} className="text-red-500" />}
            title="Departamentos en Riesgo"
            value={analysis.filter(d => d.turnoverRisk === 'Alto' || d.turnoverRisk === 'Crítico').length}
            colorClass="bg-red-100 dark:bg-red-900/50"
          />
          <StatCard 
            icon={<Target size={24} className="text-green-500" />}
            title="Productividad Promedio"
            value={`${(analysis.reduce((sum, d) => sum + d.avgProductivity, 0) / analysis.length).toFixed(1)}/10`}
            colorClass="bg-green-100 dark:bg-green-900/50"
          />
```

Después:
```tsx
          <StatCard 
            icon={<Users size={24} className="text-primary" />}
            title="Empleados Analizados"
            value={analysis.reduce((sum, d) => sum + d.employees, 0)}
            colorClass="bg-primary/15"
          />
          <StatCard 
            icon={<AlertTriangle size={24} className="text-error" />}
            title="Departamentos en Riesgo"
            value={analysis.filter(d => d.turnoverRisk === 'Alto' || d.turnoverRisk === 'Crítico').length}
            colorClass="bg-error-soft"
          />
          <StatCard 
            icon={<Target size={24} className="text-accent" />}
            title="Productividad Promedio"
            value={`${(analysis.reduce((sum, d) => sum + d.avgProductivity, 0) / analysis.length).toFixed(1)}/10`}
            colorClass="bg-accent/15"
          />
```

- [ ] **Step 3: `Predictive.tsx` — cards de departamento, brechas, `InfoList` y footer**

Antes (líneas 118-193, omitiendo la barra dinámica `bg-${dept.color}-500` que no cambia):
```tsx
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-all hover:shadow-xl hover:border-[#2ecbe7] overflow-hidden"
            >
              <div className={`h-2 w-full bg-${dept.color}-500`}></div>
              <div className="p-6">
                {/* Header de la tarjeta */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{dept.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {dept.employees} empleados
                    </p>
                  </div>
                  <RiskBadge risk={dept.turnoverRisk} score={dept.turnoverScore} />
                </div>

                {/* Métricas clave con barras de progreso */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
  <div>
    <div className="flex justify-between items-baseline mb-1">
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Productividad</span>
      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
        {dept.avgProductivity} / 10
      </span>
    </div>

    <ProgressBar
      value={dept.avgProductivity * 10} // Escalamos 1-10 -> 0-100
      showValue={false} // ocultamos el % para que no muestre "80%"
      className="h-3"
    />
  </div>

  <div>
    <div className="flex justify-between items-baseline mb-1">
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Satisfacción</span>
      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
        {dept.avgSatisfaction} / 10
      </span>
    </div>

    <ProgressBar
      value={dept.avgSatisfaction * 10}
      showValue={false}
      className="h-3"
    />
  </div>
</div>
{dept.skillsGap && dept.skillsGap.length > 0 && (
  <div className="col-span-2 mt-4 mb-3">
    <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
      Brechas de Habilidades Detectadas
    </h4>
    <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300">
      {dept.skillsGap.map((skill, idx) => (
        <li key={idx}>{skill.nombre} (nivel {skill.nivel})</li>
      ))}
    </ul>
  </div>
)}
                {/* Detalles del análisis */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-slate-200 dark:border-slate-700 pt-6">
                  {dept.riskFactors.length > 0 && <InfoList title="Factores de Riesgo" items={dept.riskFactors} icon={<ShieldAlert/>} colorClass="text-orange-500" />}
                  {dept.keyInsights.length > 0 && <InfoList title="Perspectivas Clave" items={dept.keyInsights} icon={<Lightbulb/>} colorClass="text-yellow-500" />}
                  {dept.recommendations.length > 0 && <InfoList title="Recomendaciones IA" items={dept.recommendations} icon={<CheckCircle/>} colorClass="text-cyan-500" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 p-5 text-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
```

Después:
```tsx
              className="bg-card rounded-xl shadow-md border border-border transition-all hover:shadow-xl hover:border-primary overflow-hidden"
            >
              <div className={`h-2 w-full bg-${dept.color}-500`}></div>
              <div className="p-6">
                {/* Header de la tarjeta */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">{dept.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {dept.employees} empleados
                    </p>
                  </div>
                  <RiskBadge risk={dept.turnoverRisk} score={dept.turnoverScore} />
                </div>

                {/* Métricas clave con barras de progreso */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
  <div>
    <div className="flex justify-between items-baseline mb-1">
      <span className="text-sm font-medium text-muted-foreground">Productividad</span>
      <span className="text-sm font-bold text-foreground">
        {dept.avgProductivity} / 10
      </span>
    </div>

    <ProgressBar
      value={dept.avgProductivity * 10} // Escalamos 1-10 -> 0-100
      showValue={false} // ocultamos el % para que no muestre "80%"
      className="h-3"
    />
  </div>

  <div>
    <div className="flex justify-between items-baseline mb-1">
      <span className="text-sm font-medium text-muted-foreground">Satisfacción</span>
      <span className="text-sm font-bold text-foreground">
        {dept.avgSatisfaction} / 10
      </span>
    </div>

    <ProgressBar
      value={dept.avgSatisfaction * 10}
      showValue={false}
      className="h-3"
    />
  </div>
</div>
{dept.skillsGap && dept.skillsGap.length > 0 && (
  <div className="col-span-2 mt-4 mb-3">
    <h4 className="text-sm font-semibold text-error mb-2">
      Brechas de Habilidades Detectadas
    </h4>
    <ul className="list-disc pl-5 text-sm text-foreground">
      {dept.skillsGap.map((skill, idx) => (
        <li key={idx}>{skill.nombre} (nivel {skill.nivel})</li>
      ))}
    </ul>
  </div>
)}
                {/* Detalles del análisis */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-border pt-6">
                  {dept.riskFactors.length > 0 && <InfoList title="Factores de Riesgo" items={dept.riskFactors} icon={<ShieldAlert/>} colorClass="text-warning" />}
                  {dept.keyInsights.length > 0 && <InfoList title="Perspectivas Clave" items={dept.keyInsights} icon={<Lightbulb/>} colorClass="text-warning" />}
                  {dept.recommendations.length > 0 && <InfoList title="Recomendaciones IA" items={dept.recommendations} icon={<CheckCircle/>} colorClass="text-primary" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 p-5 text-center bg-card rounded-lg border border-border">
          <p className="text-xs text-muted-foreground max-w-3xl mx-auto">
```

- [ ] **Step 4: `UiRRHH.tsx` — `StatCard`, `RiskBadge`, `InfoList` (líneas 983-1030)**

Antes:
```tsx
export const StatCard: React.FC<StatCardProps> = ({ icon, title, value, colorClass }) => (
  <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-cyan-300 transition-all">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>{icon}</div>
    </div>
  </div>
);

export const RiskBadge: React.FC<RiskBadgeProps> = ({ risk, score }) => {
  const styles: Record<RiskLevel, string> = {
    "Bajo": "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    "Medio": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    "Alto": "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    "Crítico": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  };
  const icons: Record<RiskLevel, ReactNode> = {
    "Bajo": <CheckCircle size={14} />, "Medio": <Activity size={14} />,
    "Alto": <TrendingDown size={14} />, "Crítico": <AlertTriangle size={14} />,
  };
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${styles[risk]}`}>
      {icons[risk]}
      <span>{risk}</span>
      <span className="font-mono opacity-60">({score}%)</span>
    </div>
  );
};

export const InfoList: React.FC<InfoListProps> = ({ title, items, icon, colorClass }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      {React.cloneElement(icon, { className: `w-4 h-4 ${colorClass}` })}
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h4>
    </div>
    <ul className="space-y-2 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${colorClass.replace("text-", "bg-")}`} />
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item}</p>
        </li>
      ))}
    </ul>
  </div>
);
```

Después:
```tsx
export const StatCard: React.FC<StatCardProps> = ({ icon, title, value, colorClass }) => (
  <div className="bg-card p-5 rounded-xl shadow-sm border border-border hover:shadow-md hover:border-primary/40 transition-all">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{title}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>{icon}</div>
    </div>
  </div>
);

export const RiskBadge: React.FC<RiskBadgeProps> = ({ risk, score }) => {
  const styles: Record<RiskLevel, string> = {
    "Bajo": "bg-success-soft text-success-soft-foreground",
    "Medio": "bg-warning-soft text-warning-soft-foreground",
    "Alto": "bg-warning-soft text-warning-soft-foreground",
    "Crítico": "bg-error-soft text-error-soft-foreground",
  };
  const icons: Record<RiskLevel, ReactNode> = {
    "Bajo": <CheckCircle size={14} />, "Medio": <Activity size={14} />,
    "Alto": <TrendingDown size={14} />, "Crítico": <AlertTriangle size={14} />,
  };
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${styles[risk]}`}>
      {icons[risk]}
      <span>{risk}</span>
      <span className="font-mono opacity-60">({score}%)</span>
    </div>
  );
};

export const InfoList: React.FC<InfoListProps> = ({ title, items, icon, colorClass }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      {React.cloneElement(icon, { className: `w-4 h-4 ${colorClass}` })}
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
    </div>
    <ul className="space-y-2 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${colorClass.replace("text-", "bg-")}`} />
          <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
        </li>
      ))}
    </ul>
  </div>
);
```

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `Predictive.tsx` ni en `UiRRHH.tsx`.

Run: `grep -nE "slate-|cyan-|red-|green-|orange-|yellow-|#1ABCD7|#2ecbe7|dark:" src/app/Componentes/MCPIA/Predictive.tsx`
Expected: 0 resultados (la barra dinámica `bg-${dept.color}-500` no contiene ninguno de estos literales — es una expresión, no texto estático).

- [ ] **Step 6: Commit**

```bash
git add src/app/Componentes/MCPIA/Predictive.tsx src/app/util/UiRRHH.tsx
git commit -m "feat: retemear Predictive.tsx, StatCard, RiskBadge e InfoList a tokens organico-calido"
```

---

### Task 3: `HRChatbot.tsx`

**Files:**
- Modify: `src/app/Componentes/MCPIA/HRChatbot.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nada nuevo.

- [ ] **Step 1: Botón volver, título y subtítulo**

Antes (líneas 75-80):
```tsx
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft size={20} />
        Volver
      </button>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Chatbot de RRHH</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Tu asistente virtual para consultas de Recursos Humanos.</p>
```

Después:
```tsx
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={20} />
        Volver
      </button>
      <h2 className="font-heading text-3xl font-bold text-foreground mb-2">Chatbot de RRHH</h2>
      <p className="text-muted-foreground mb-8">Tu asistente virtual para consultas de Recursos Humanos.</p>
```

- [ ] **Step 2: Caja del chat, burbujas y mensaje de error**

Antes (líneas 82-110):
```tsx
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-[500px] flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Escribiendo</span>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-start">
              <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-bl-none">
                <p className="font-bold text-sm">Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}
        </div>
```

Después:
```tsx
      <div className="bg-card rounded-lg shadow-md h-[500px] flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted text-foreground rounded-bl-none'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-muted text-foreground rounded-bl-none">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Escribiendo</span>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-start">
              <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-error-soft text-error-soft-foreground rounded-bl-none">
                <p className="font-bold text-sm">Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}
        </div>
```

- [ ] **Step 3: Input y botón enviar**

Antes (líneas 112-128):
```tsx
        <div className="p-4 border-t dark:border-gray-700 flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isLoading ? "Esperando respuesta..." : "Escribe tu pregunta..."}
            className="flex-1 bg-gray-100 dark:bg-gray-900 border-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-full py-2 px-4 outline-none disabled:opacity-50"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend} 
            className="bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <Send size={20} />
          </button>
        </div>
```

Después:
```tsx
        <div className="p-4 border-t border-border flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isLoading ? "Esperando respuesta..." : "Escribe tu pregunta..."}
            className="flex-1 bg-muted border-transparent focus:ring-2 focus:ring-primary focus:border-transparent rounded-full py-2 px-4 outline-none disabled:opacity-50"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend} 
            className="bg-primary text-primary-foreground rounded-full p-3 hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <Send size={20} />
          </button>
        </div>
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `HRChatbot.tsx`.

Run: `grep -nE "gray-|blue-|red-|dark:" src/app/Componentes/MCPIA/HRChatbot.tsx`
Expected: 0 resultados.

- [ ] **Step 5: Commit**

```bash
git add src/app/Componentes/MCPIA/HRChatbot.tsx
git commit -m "feat: retemear HRChatbot.tsx a tokens organico-calido"
```

---

### Task 4: `DepartmentOptimization.tsx` — `riskColors`, `Section`, loading y error

**Files:**
- Modify: `src/app/Componentes/MCPIA/DepartmentOptimization.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: `riskColors`, `RiskBadge` (local), `Section` (local) — mismas firmas, solo cambian las clases CSS. Consumidas sin cambios por el resto del archivo (Task 5 toca otras partes del mismo archivo).

- [ ] **Step 1: `riskColors` (objeto local)**

Antes (líneas 40-44):
```tsx
const riskColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Alto:  { bg: "bg-red-100 dark:bg-red-900/30",    text: "text-red-700 dark:text-red-300",    border: "border-red-300 dark:border-red-700",    dot: "bg-red-500" },
  Medio: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300", border: "border-yellow-300 dark:border-yellow-700", dot: "bg-yellow-500" },
  Bajo:  { bg: "bg-green-100 dark:bg-green-900/30",  text: "text-green-700 dark:text-green-300",  border: "border-green-300 dark:border-green-700",  dot: "bg-green-500" },
};
```

Después:
```tsx
const riskColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Alto:  { bg: "bg-error-soft",   text: "text-error-soft-foreground",   border: "border-error",   dot: "bg-error" },
  Medio: { bg: "bg-warning-soft", text: "text-warning-soft-foreground", border: "border-warning", dot: "bg-warning" },
  Bajo:  { bg: "bg-success-soft", text: "text-success-soft-foreground", border: "border-success", dot: "bg-success" },
};
```

- [ ] **Step 2: `Section` (componente local)**

Antes (líneas 75-93):
```tsx
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
          {count !== undefined && (
            <span className="bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        {open ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>
      {open && <div className="px-6 pb-6 border-t border-slate-100 dark:border-slate-700">{children}</div>}
    </div>
```

Después:
```tsx
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
```

- [ ] **Step 3: Loading y error**

Antes (líneas 146-189):
```tsx
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="text-center">
          <div className="relative">
            <Brain className="w-20 h-20 text-cyan-500 mx-auto mb-6 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-400 rounded-full animate-ping" />
          </div>
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">
            Analizando Estructura Organizacional
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Procesando habilidades, brechas, riesgos y oportunidades de movilidad con IA...
          </p>
          <div className="mt-6 flex justify-center gap-1">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-bounce"
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
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeft size={20} /> Volver
        </button>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-700 dark:text-red-300 mb-2">Error en el Análisis</h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchAnalysis}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      </div>
    );
  }
```

Después:
```tsx
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
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `DepartmentOptimization.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/app/Componentes/MCPIA/DepartmentOptimization.tsx
git commit -m "feat: retemear riskColors, Section, loading y error de DepartmentOptimization a tokens organico-calido"
```

---

### Task 5: `DepartmentOptimization.tsx` — header, `StatCard` local, secciones, tablas y footer

**Files:**
- Modify: `src/app/Componentes/MCPIA/DepartmentOptimization.tsx`

**Interfaces:**
- Consumes: `riskColors`, `RiskBadge`, `Section` ya retemados por Task 4 — no se vuelven a tocar sus definiciones, solo se usan tal cual.
- Produces: `StatCard` (local) — misma firma, solo cambian las clases CSS.

- [ ] **Step 1: Header (caja ícono, título, botones)**

Antes (líneas 201-231):
```tsx
        <div>
        <div className="flex items-center gap-3 mb-2">
            <div className="bg-cyan-100 dark:bg-cyan-900/50 p-2 rounded-lg">
              <Zap className="text-[#1ABCD7]" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
              Análisis Organizacional con IA
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            {metadata && `${metadata.totalEmployees} empleados · ${metadata.totalDepartments} departamentos · `}
            Generado el {new Date(report.analysisDate).toLocaleDateString("es-AR")}
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-center">
          <button
            onClick={fetchAnalysis}
            className="flex items-center gap-2 text-sm font-semibold border-2 border-cyan-500 text-cyan-600 dark:text-cyan-400 px-4 py-2 rounded-lg transition-all hover:bg-cyan-500 hover:text-white"
          >
            <RefreshCw size={16} /> Regenerar
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-lg transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <ArrowLeft size={16} /> Volver
          </button>
        </div>
      </div>
```

Después:
```tsx
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
```

- [ ] **Step 2: `StatCard` local y los 4 usos en el resumen**

Antes (líneas 234-238, 405-424):
```tsx
        <StatCard icon={<Users size={22} />} color="cyan" label="Empleados" value={metadata?.totalEmployees ?? 0} />
        <StatCard icon={<Target size={22} />} color="green" label="Departamentos" value={metadata?.totalDepartments ?? 0} />
        <StatCard icon={<AlertTriangle size={22} />} color="red" label="Depts en Riesgo Alto" value={highRiskCount} />
        <StatCard icon={<ArrowRightLeft size={22} />} color="purple" label="Reubicaciones Sugeridas" value={report.relocationProposals.length} />
```
```tsx
function StatCard({ icon, color, label, value }: { icon: React.ReactNode; color: string; label: string; value: number | string }) {
  const colorMap: Record<string, string> = {
    cyan: "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600",
    green: "bg-green-100 dark:bg-green-900/50 text-green-600",
    red: "bg-red-100 dark:bg-red-900/50 text-red-600",
    purple: "bg-purple-100 dark:bg-purple-900/50 text-purple-600",
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4 shadow-sm">
      <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}
```

Después:
```tsx
        <StatCard icon={<Users size={22} />} color="cyan" label="Empleados" value={metadata?.totalEmployees ?? 0} />
        <StatCard icon={<Target size={22} />} color="green" label="Departamentos" value={metadata?.totalDepartments ?? 0} />
        <StatCard icon={<AlertTriangle size={22} />} color="red" label="Depts en Riesgo Alto" value={highRiskCount} />
        <StatCard icon={<ArrowRightLeft size={22} />} color="purple" label="Reubicaciones Sugeridas" value={report.relocationProposals.length} />
```
```tsx
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
```

Nota: las 4 invocaciones de `StatCard` (líneas 235-238) NO cambian — sus props `color="cyan"`/`"green"`/`"red"`/`"purple"` siguen siendo las mismas claves de `colorMap`, solo el contenido de `colorMap` cambió. Solo se modifica la función `StatCard` (la segunda parte de este Step).

- [ ] **Step 3: Íconos de las 6 secciones**

Antes (líneas 242, 253, 283, 310, 350, 376):
```tsx
      <Section title="Resumen Ejecutivo" icon={<FileText size={20} className="text-cyan-500" />} defaultOpen={true}>
```
```tsx
        icon={<ShieldAlert size={20} className="text-orange-500" />}
```
```tsx
        icon={<TrendingUp size={20} className="text-red-500" />}
```
```tsx
        icon={<ArrowRightLeft size={20} className="text-purple-500" />}
```
```tsx
        icon={<AlertTriangle size={20} className="text-amber-500" />}
```
```tsx
      <Section title="Plan de Acción" icon={<CheckCircle size={20} className="text-green-500" />} count={report.actionPlan.length}>
```

Después:
```tsx
      <Section title="Resumen Ejecutivo" icon={<FileText size={20} className="text-primary" />} defaultOpen={true}>
```
```tsx
        icon={<ShieldAlert size={20} className="text-warning" />}
```
```tsx
        icon={<TrendingUp size={20} className="text-error" />}
```
```tsx
        icon={<ArrowRightLeft size={20} className="text-warm-contrast" />}
```
```tsx
        icon={<AlertTriangle size={20} className="text-warning" />}
```
```tsx
      <Section title="Plan de Acción" icon={<CheckCircle size={20} className="text-success" />} count={report.actionPlan.length}>
```

- [ ] **Step 4: Tablas (Mapa de Calor, Propuestas de Reubicación) y mensajes "sin datos"**

Antes (líneas 244-345, omitiendo `RiskBadge` que ya está retemado por Task 4):
```tsx
        <div className="mt-4 prose dark:prose-invert max-w-none">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
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
              <tr className="border-b dark:border-slate-700">
                <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Departamento</th>
                <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Riesgo</th>
                <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Empleados</th>
                <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {report.riskHeatMap.map((entry: RiskHeatMapEntry, i: number) => (
                <tr key={i} className="border-b dark:border-slate-700/50 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-3 font-medium text-slate-800 dark:text-white">{entry.department}</td>
                  <td className="p-3"><RiskBadge level={entry.riskLevel} /></td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{entry.employeeCount}</td>
                  <td className="p-3 text-sm text-slate-500 dark:text-slate-400">{entry.mainRisk}</td>
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
          <p className="mt-4 text-slate-500 dark:text-slate-400 italic">No se detectaron brechas de habilidades.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.skillGaps.map((gap: SkillGapEntry, i: number) => (
              <div key={i} className="border border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">{gap.department}</span>
                  <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 px-2 py-0.5 rounded-full">
                    Nivel: {gap.requiredLevel}
                  </span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">Falta: {gap.missingSkill}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{gap.riskDescription}</p>
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
          <p className="mt-4 text-slate-500 dark:text-slate-400 italic">
            No se generaron propuestas de reubicación. Esto puede significar que no hay brechas que se cubran con talento existente.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b dark:border-slate-700">
                  <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Empleado</th>
                  <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dept. Actual</th>
                  <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dept. Sugerido</th>
                  <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Razón</th>
                </tr>
              </thead>
              <tbody>
                {report.relocationProposals.map((p: RelocationProposal, i: number) => (
                  <tr key={i} className="border-b dark:border-slate-700/50 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-3 font-medium text-slate-800 dark:text-white">{p.employeeName}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{p.currentDept}</td>
                    <td className="p-3">
                      <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold px-2.5 py-1 rounded-full">
                        {p.suggestedDept}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-slate-500 dark:text-slate-400">{p.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
```

Después:
```tsx
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
```

- [ ] **Step 5: Puntos Únicos de Fallo, Plan de Acción y footer**

Antes (líneas 348-396):
```tsx
      <Section
        title="Puntos Únicos de Fallo"
        icon={<AlertTriangle size={20} className="text-warning" />}
        count={report.singlePointsOfFailure.length}
        defaultOpen={false}
      >
        {report.singlePointsOfFailure.length === 0 ? (
          <p className="mt-4 text-slate-500 dark:text-slate-400 italic">No se detectaron puntos únicos de fallo.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {report.singlePointsOfFailure.map((spof: SPOFEntry, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg">
                <ShieldAlert size={18} className="text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">
                    {spof.department} — <span className="text-amber-600 dark:text-amber-400">{spof.criticalSkill}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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
            <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                {i + 1}
              </div>
              <p className="text-slate-700 dark:text-slate-300 pt-1">{step}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <div className="p-5 text-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
```

Después:
```tsx
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
```

- [ ] **Step 6: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `DepartmentOptimization.tsx`.

Run: `grep -nE "slate-|cyan-|red-|green-|orange-|yellow-|amber-|purple-|#1ABCD7|dark:" src/app/Componentes/MCPIA/DepartmentOptimization.tsx`
Expected: 0 resultados.

- [ ] **Step 7: Commit**

```bash
git add src/app/Componentes/MCPIA/DepartmentOptimization.tsx
git commit -m "feat: retemear header, StatCard, secciones y tablas de DepartmentOptimization a tokens organico-calido"
```
