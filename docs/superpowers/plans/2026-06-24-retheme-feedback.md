# Retema de Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recolorear el módulo de Feedback 360° (pantalla raíz + componente de encuesta) de la paleta índigo/gris/genérica de Tailwind a los tokens semánticos "Orgánico Cálido" ya definidos en `src/app/globals.css`, sin cambiar lógica de fetch/estado ni UX.

**Architecture:** Cambios puramente de `className` en 2 archivos existentes, agrupados en 2 tareas (una por archivo). Ningún archivo nuevo, ninguna firma de componente cambia.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS v4 (tokens vía `@theme inline` en `globals.css`), PrimeReact (Dropdown/Toast/Card/SelectButton/Button/ProgressBar — heredan tema global, no se tocan), lucide-react (iconos).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-06-24-retheme-feedback-design.md`
- Cambio **puramente visual** — no se toca lógica de fetch/estado: `getAuthToken`, `adaptPeerToUserData`, `loadPeers`, `handleSaveFeedback`, `handleUpdateUser` (`Screen.tsx`); `generateSurvey`, `handleSubmit`, `getEvaluationProgress`, `getNoSurveyMessage` (`FeedbackTab.tsx`).
- No se cambian firmas de componentes ni props.
- Tokens semánticos a usar (ya existen en `globals.css`, no se crean nuevos): `bg-background`, `bg-card`, `bg-muted`, `bg-primary`/`text-primary-foreground`, `text-primary`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-error`, `font-heading`.
- Verificación por tarea: `npx tsc --noEmit` (sin test suite automatizado para cambios puramente visuales, igual que en las 6 fases de retema anteriores).
- Commits: un commit por tarea, mensaje `feat: retemear <archivo> a tokens organico-calido`.

---

### Task 1: `Screen.tsx` (pantalla raíz)

**Files:**
- Modify: `src/app/screens/Feedback/Screen.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nada nuevo.

- [ ] **Step 1: Estado de carga**

Antes (líneas 186-193):
```tsx
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 text-indigo-400 animate-spin" size={48} />
          <p className="text-gray-600 text-lg">Cargando compañeros del área...</p>
        </div>
      </div>
```

Después:
```tsx
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 text-primary animate-spin" size={48} />
          <p className="text-muted-foreground text-lg">Cargando compañeros del área...</p>
        </div>
      </div>
```

- [ ] **Step 2: Estado de error**

Antes (líneas 197-210):
```tsx
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-md max-w-md">
          <User className="mx-auto mb-4 text-red-400" size={48} />
          <p className="text-red-600 font-semibold text-lg mb-4">{error ?? 'Usuario no encontrado'}</p>
          <button
            onClick={loadPeers}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
```

Después:
```tsx
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center bg-card p-8 rounded-xl shadow-md max-w-md">
          <User className="mx-auto mb-4 text-error" size={48} />
          <p className="text-error font-semibold text-lg mb-4">{error ?? 'Usuario no encontrado'}</p>
          <button
            onClick={loadPeers}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
```

- [ ] **Step 3: Fondo raíz, header y card "Tu progreso"**

Antes (líneas 213-257):
```tsx
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800 p-4 sm:p-8">
      <Toast ref={toast} />
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Sistema de Feedback 360°</h1>
          <p className="text-lg text-gray-600">
            Evaluá las habilidades blandas de tus compañeros del mismo departamento de forma anónima.
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <FeedbackTab
              currentUser={currentUser}
              usersData={allUsers}
              onSaveFeedback={handleSaveFeedback}
              onUpdateUser={handleUpdateUser}
            />
          </div>

          <div className="space-y-6">
            <Card title={
              <div className="flex items-center">
                <BarChart className="mr-2 text-indigo-500" />
                <span>Tu progreso</span>
              </div>
            }>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  Compañeros evaluables:{' '}
                  <span className="font-semibold text-indigo-600">{allUsers.length - 1}</span>
                </div>
                <div className="text-sm text-gray-500 italic">
                  Las evaluaciones son anónimas. Solo el sistema registra los conteos generales.
                </div>
                <button
                  onClick={loadPeers}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200"
                >
                  <RefreshCw size={14} />
                  Recargar compañeros
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
```

Después:
```tsx
    <div className="bg-background min-h-screen font-sans text-foreground p-4 sm:p-8">
      <Toast ref={toast} />
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-2">Sistema de Feedback 360°</h1>
          <p className="text-lg text-muted-foreground">
            Evaluá las habilidades blandas de tus compañeros del mismo departamento de forma anónima.
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <FeedbackTab
              currentUser={currentUser}
              usersData={allUsers}
              onSaveFeedback={handleSaveFeedback}
              onUpdateUser={handleUpdateUser}
            />
          </div>

          <div className="space-y-6">
            <Card title={
              <div className="flex items-center">
                <BarChart className="mr-2 text-primary" />
                <span>Tu progreso</span>
              </div>
            }>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Compañeros evaluables:{' '}
                  <span className="font-semibold text-primary">{allUsers.length - 1}</span>
                </div>
                <div className="text-sm text-muted-foreground italic">
                  Las evaluaciones son anónimas. Solo el sistema registra los conteos generales.
                </div>
                <button
                  onClick={loadPeers}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-primary/15 text-primary rounded-lg hover:bg-primary/20 transition-colors border border-primary/30"
                >
                  <RefreshCw size={14} />
                  Recargar compañeros
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `Screen.tsx`.

Run: `grep -nE "indigo-|gray-|bg-white\b|text-red-" src/app/screens/Feedback/Screen.tsx`
Expected: 0 resultados.

- [ ] **Step 5: Commit**

```bash
git add src/app/screens/Feedback/Screen.tsx
git commit -m "feat: retemear Screen.tsx de Feedback a tokens organico-calido"
```

---

### Task 2: `FeedbackTab.tsx` (encuesta de feedback)

**Files:**
- Modify: `src/app/Componentes/Encuesta/FeedbackTab.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nada nuevo.

- [ ] **Step 1: Título de la card y "Tu Opinión es Totalmente Anónima"**

Antes (líneas 138-143, 178-180):
```tsx
  const cardTitle = (
    <div className="flex items-center">
      <MessageSquare className="mr-3 text-green-500" />
      <span className="text-2xl font-bold text-gray-800">Evaluacion del Equipo de Trabajo</span>
    </div>
  );
```
```tsx
    <Card title={cardTitle}>
      <span className=" text-base font-bold text-gray-500 sm:ml-2">
        Tu Opinión es Totalmente Anónima
      </span>
```

Después:
```tsx
  const cardTitle = (
    <div className="flex items-center">
      <MessageSquare className="mr-3 text-primary" />
      <span className="font-heading text-2xl font-bold text-foreground">Evaluacion del Equipo de Trabajo</span>
    </div>
  );
```
```tsx
    <Card title={cardTitle}>
      <span className=" text-base font-bold text-muted-foreground sm:ml-2">
        Tu Opinión es Totalmente Anónima
      </span>
```

- [ ] **Step 2: Label de progreso y texto "% completado"**

Antes (líneas 182-194):
```tsx
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-700">Progreso de Evaluaciones</span>
        </div>
        <ProgressBar 
          value={progressPercentage} 
          displayValueTemplate={() => `${progress.evaluated}/${progress.total}`} 
        />
        <div className="mt-2 mb-5 text-xs text-gray-600">
          {progress.total > 0 
            ? `${Math.round(progressPercentage)}% completado`
            : 'Sin evaluaciones disponibles'
          }
        </div>
```

Después:
```tsx
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-foreground">Progreso de Evaluaciones</span>
        </div>
        <ProgressBar 
          value={progressPercentage} 
          displayValueTemplate={() => `${progress.evaluated}/${progress.total}`} 
        />
        <div className="mt-2 mb-5 text-xs text-muted-foreground">
          {progress.total > 0 
            ? `${Math.round(progressPercentage)}% completado`
            : 'Sin evaluaciones disponibles'
          }
        </div>
```

- [ ] **Step 3: Card de la encuesta y estado "sin encuestas disponibles"**

Antes (líneas 197-241):
```tsx
      {survey ? (
        <div className="space-y-6">
          <Card className="p-1 rounded-lg border border-indigo-200 ">
            <p className="text-lg text-gray-700 mb-3">
              ¿Consideras que tu compañero/a{' '}
              <span className="font-bold text-indigo-600">{survey.evaluado}</span>{' '}
              tiene la habilidad de...
            </p>
            <div >
              <p className="text-xl font-semibold text-indigo-700">
                &quot;{survey.softSkills.nombre}&quot;
              </p>
            </div>
          </Card>
          
          <div className="flex justify-center">
            <SelectButton 
              value={selectedResponse} 
              onChange={(e) => setSelectedResponse(e.value)} 
              options={feedbackOptions}
            />
          </div>

          <Button
            label="Enviar Feedback"
            onClick={handleSubmit}
            disabled={selectedResponse === null}
            className="w-full py-3 text-lg"
          />
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <MessageSquare className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 mb-4">
              {getNoSurveyMessage()}
            </p>
            {currentUser.lastCompleteFeedback && (
              <div className="text-sm text-gray-500 bg-gray-100 p-2 rounded">
                Última evaluación completa: {new Date(currentUser.lastCompleteFeedback).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}
```

Después:
```tsx
      {survey ? (
        <div className="space-y-6">
          <Card className="p-1 rounded-lg border border-primary/30 ">
            <p className="text-lg text-foreground mb-3">
              ¿Consideras que tu compañero/a{' '}
              <span className="font-bold text-primary">{survey.evaluado}</span>{' '}
              tiene la habilidad de...
            </p>
            <div >
              <p className="text-xl font-semibold text-primary">
                &quot;{survey.softSkills.nombre}&quot;
              </p>
            </div>
          </Card>
          
          <div className="flex justify-center">
            <SelectButton 
              value={selectedResponse} 
              onChange={(e) => setSelectedResponse(e.value)} 
              options={feedbackOptions}
            />
          </div>

          <Button
            label="Enviar Feedback"
            onClick={handleSubmit}
            disabled={selectedResponse === null}
            className="w-full py-3 text-lg"
          />
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="bg-muted p-6 rounded-lg border border-border">
            <MessageSquare className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground mb-4">
              {getNoSurveyMessage()}
            </p>
            {currentUser.lastCompleteFeedback && (
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                Última evaluación completa: {new Date(currentUser.lastCompleteFeedback).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `FeedbackTab.tsx`.

Run: `grep -nE "indigo-|gray-|green-" src/app/Componentes/Encuesta/FeedbackTab.tsx`
Expected: 0 resultados.

- [ ] **Step 5: Commit**

```bash
git add src/app/Componentes/Encuesta/FeedbackTab.tsx
git commit -m "feat: retemear FeedbackTab.tsx a tokens organico-calido"
```
