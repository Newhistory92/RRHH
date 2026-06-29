# Retema de TestConfig Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recolorear el módulo de Gestión de Tests (pantalla raíz + 2 componentes) de la paleta cian/azul/morado/verde/gris a los tokens semánticos "Orgánico Cálido" ya definidos en `src/app/globals.css`, sin cambiar lógica de fetch/estado ni UX.

**Architecture:** Cambios puramente de `className` en 3 archivos existentes, agrupados en 3 tareas (una por archivo). Ningún archivo nuevo, ninguna firma de componente cambia.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS v4 (tokens vía `@theme inline` en `globals.css`), PrimeReact (Card/Dropdown/Button/Dialog/InputText/InputTextarea/Checkbox — heredan tema global, no se tocan), lucide-react (iconos).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-06-26-retheme-testconfig-design.md`
- Cambio **puramente visual** — no se toca lógica de fetch/estado: `handleSelectedProfessionChange`, `handleAddProfession`, `handleSaveTest`, `handleDeleteTest` (`Screen.tsx`); `handleAddNewProfession`, `handleSaveTest` (`TechnicalTests.tsx`); todos los handlers de preguntas/respuestas, `handleGenerateWithAI`, `handleSubmit`, `useCaseStudyGeneration` (`CreateTestModal.tsx`).
- No se cambian firmas de componentes ni props.
- El error de tipos pre-existente sobre `argentinianDegrees`/`TechnicalTestsProps` queda sin tocar (no relacionado a color).
- El overlay del modal (`bg-black bg-opacity-50` en `CreateTestModal.tsx`) queda sin cambios — es un scrim, no un color de superficie.
- Tokens semánticos a usar (ya existen en `globals.css`, no se crean nuevos): `bg-background`, `bg-card`, `bg-muted`, `bg-primary`/`text-primary-foreground`, `text-primary`, `text-accent`, `text-warm-contrast`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-error`, `bg-error-soft`/`text-error-soft-foreground`, `font-heading`.
- Verificación por tarea: `npx tsc --noEmit` (sin test suite automatizado para cambios puramente visuales, igual que en las 9 fases de retema anteriores).
- Commits: un commit por tarea, mensaje `feat: retemear <archivo> a tokens organico-calido`.

---

### Task 1: `Screen.tsx` (pantalla raíz)

**Files:**
- Modify: `src/app/screens/TestConfig/Screen.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nada nuevo.

- [ ] **Step 1: Estado de carga**

Antes:
```tsx
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1ABCD7] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-semibold">Cargando configuración...</p>
        </div>
      </div>
```

Después:
```tsx
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="text-center bg-card p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-semibold">Cargando configuración...</p>
        </div>
      </div>
```

- [ ] **Step 2: Fondo raíz, header y tabs**

Antes:
```tsx
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Gestión de Tests
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra tests técnicos para diferentes profesiones
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab("technical")}
            className={`px-4 py-2 font-semibold transition-colors duration-200 ${
              activeTab === "technical"
                ? "border-b-2 border-[#2ecbe7] text-[#1ABCD7]  text-shadow-md"
                : "text-gray-500 hover:text-blue-500 text-shadow-md"
            }`}
          >
            🧪 Tests Técnicos
          </button>
        </div>
```

Después:
```tsx
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
            Gestión de Tests
          </h1>
          <p className="text-muted-foreground">
            Administra tests técnicos para diferentes profesiones
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab("technical")}
            className={`px-4 py-2 font-semibold transition-colors duration-200 ${
              activeTab === "technical"
                ? "border-b-2 border-primary text-primary  text-shadow-md"
                : "text-muted-foreground hover:text-primary text-shadow-md"
            }`}
          >
            🧪 Tests Técnicos
          </button>
        </div>
```

- [ ] **Step 3: Tarjetas de stats**

Antes:
```tsx
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Profesiones
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.keys(professions).length}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tests Técnicos
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.values(testsByProfession).flat().length}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <span className="text-2xl">🧪</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Habilidades Blandas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {softSkills.length}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>
        </div>
```

Después:
```tsx
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Profesiones
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {Object.keys(professions).length}
                </p>
              </div>
              <div className="bg-primary/15 p-3 rounded-full">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tests Técnicos
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {Object.values(testsByProfession).flat().length}
                </p>
              </div>
              <div className="bg-accent/15 p-3 rounded-full">
                <span className="text-2xl">🧪</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Habilidades Blandas
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {softSkills.length}
                </p>
              </div>
              <div className="bg-warm-contrast/15 p-3 rounded-full">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>
        </div>
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `Screen.tsx`.

Run: `grep -nE "gray-|blue-|purple-|green-|#1ABCD7|#2ecbe7|dark:" src/app/screens/TestConfig/Screen.tsx`
Expected: 0 resultados.

- [ ] **Step 5: Commit**

```bash
git add src/app/screens/TestConfig/Screen.tsx
git commit -m "feat: retemear Screen.tsx de TestConfig a tokens organico-calido"
```

---

### Task 2: `TechnicalTests.tsx`

**Files:**
- Modify: `src/app/Componentes/TestComponent/TechnicalTests.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nada nuevo.

- [ ] **Step 1: Selector de profesión y título "Tests para..."**

Antes (líneas 62-113):
```tsx
            <label
              htmlFor="profession-select"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
```
```tsx
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl text-gray-700 dark:text-gray-200">
            Tests para{" "}
            <span className="text-blue-500">{selectedProfession}</span>
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentTests.length} test{currentTests.length !== 1 ? 's' : ''}
          </span>
        </div>
```

Después:
```tsx
            <label
              htmlFor="profession-select"
              className="block text-sm font-medium text-foreground mb-2"
            >
```
```tsx
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-bold text-xl text-foreground">
            Tests para{" "}
            <span className="text-primary">{selectedProfession}</span>
          </h3>
          <span className="text-sm text-muted-foreground">
            {currentTests.length} test{currentTests.length !== 1 ? 's' : ''}
          </span>
        </div>
```

- [ ] **Step 2: Estado vacío**

Antes (líneas 116-131):
```tsx
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                No hay tests para esta profesión.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                ¡Crea el primer test haciendo clic en &quot;Crear Nuevo Test&quot;!
              </p>
              <Button
                onClick={() => setIsTestModalOpen(true)}
                text
                className="text-blue-500 hover:text-blue-600"
              >
                Crear Primer Test
              </Button>
            </div>
```

Después:
```tsx
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">
                No hay tests para esta profesión.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                ¡Crea el primer test haciendo clic en &quot;Crear Nuevo Test&quot;!
              </p>
              <Button
                onClick={() => setIsTestModalOpen(true)}
                text
                className="text-primary hover:opacity-80"
              >
                Crear Primer Test
              </Button>
            </div>
```

- [ ] **Step 3: Card de test (fondo, hover, textos, badges, botón eliminar)**

Antes (líneas 133-177):
```tsx
            currentTests.map((test) => (
              <div
                key={test.id}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-white mb-1">
                      {test.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {test.description}
                    </p>
                    {test.type === 'multiple-choice' && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {test.questions.length} pregunta{test.questions.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${test.type === "multiple-choice"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        }`}
                    >
                      {test.type === "multiple-choice"
                        ? "Multiple Choice"
                        : "Caso de Estudio"}
                    </span>
                    {onDeleteTest && (
                      <Button
                        type="button"
                        onClick={() => onDeleteTest(test.id)}
                        className="text-red-500 hover:text-red-700"
                        text
                        size="small"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
```

Después:
```tsx
            currentTests.map((test) => (
              <div
                key={test.id}
                className="p-4 bg-muted rounded-lg hover:bg-border transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground mb-1">
                      {test.name}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {test.description}
                    </p>
                    {test.type === 'multiple-choice' && (
                      <p className="text-xs text-muted-foreground">
                        {test.questions.length} pregunta{test.questions.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${test.type === "multiple-choice"
                        ? "bg-accent/15 text-accent"
                        : "bg-warm-contrast/15 text-warm-contrast"
                        }`}
                    >
                      {test.type === "multiple-choice"
                        ? "Multiple Choice"
                        : "Caso de Estudio"}
                    </span>
                    {onDeleteTest && (
                      <Button
                        type="button"
                        onClick={() => onDeleteTest(test.id)}
                        className="text-error hover:opacity-80"
                        text
                        size="small"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
```

- [ ] **Step 4: Modal "Añadir Nueva Profesión" (label y texto de ayuda)**

Antes (líneas 204, 223-225):
```tsx
            <label htmlFor="new-profession" className="block text-sm font-medium text-gray-700 mb-2">
```
```tsx
          <p className="text-xs text-gray-500 italic">
            * Selecciona una carrera del listado oficial para mantener la consistencia con el CV de los empleados.
          </p>
```

Después:
```tsx
            <label htmlFor="new-profession" className="block text-sm font-medium text-foreground mb-2">
```
```tsx
          <p className="text-xs text-muted-foreground italic">
            * Selecciona una carrera del listado oficial para mantener la consistencia con el CV de los empleados.
          </p>
```

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `TechnicalTests.tsx` (el error pre-existente de `argentinianDegrees`/`TechnicalTestsProps` puede seguir apareciendo, no relacionado a este cambio).

Run: `grep -nE "gray-|blue-|purple-|green-|red-|dark:" src/app/Componentes/TestComponent/TechnicalTests.tsx`
Expected: 0 resultados.

- [ ] **Step 6: Commit**

```bash
git add src/app/Componentes/TestComponent/TechnicalTests.tsx
git commit -m "feat: retemear TechnicalTests.tsx a tokens organico-calido"
```

---

### Task 3: `CreateTestModal.tsx`

**Files:**
- Modify: `src/app/Componentes/TestComponent/CreateTestModal.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: nada nuevo.

- [ ] **Step 1: Caja del modal, header y botón cerrar**

Antes (líneas 220-231):
```tsx
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Crear Nuevo Test para {profession}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <CloseIcon size={24} />
          </button>
        </div>
```

Después:
```tsx
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="font-heading text-xl font-bold text-foreground">
            Crear Nuevo Test para {profession}
          </h3>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <CloseIcon size={24} />
          </button>
        </div>
```

- [ ] **Step 2: Labels "Nombre del Test"/"Tipo de Test"/"Descripción"**

Antes (líneas 239, 252, 267):
```tsx
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Test *
                </label>
```
```tsx
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Test *
                </label>
```
```tsx
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción *
              </label>
```

Después:
```tsx
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre del Test *
                </label>
```
```tsx
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tipo de Test *
                </label>
```
```tsx
              <label className="block text-sm font-medium text-foreground mb-2">
                Descripción *
              </label>
```

- [ ] **Step 3: Sección Preguntas (título, card, label, botón eliminar pregunta, label respuestas, botón eliminar respuesta, botón añadir respuesta)**

Antes (líneas 283-376):
```tsx
              <div className="space-y-6 pt-4 border-t dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Preguntas ({questions.length}/10)
                  </h4>
```
```tsx
                {questions.map((q, qIndex) => (
                  <Card key={q.id} className="p-4 border dark:border-gray-600">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="font-semibold text-gray-700 dark:text-gray-200">
                          Pregunta {qIndex + 1}
                        </label>
                        {questions.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeQuestion(qIndex)}
                            className="text-red-500 hover:text-red-700"
                            text
                            size="small"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
```
```tsx
                      <div className="pl-4 space-y-3">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Respuestas:
                        </label>
                        {q.answers.map((ans, aIndex) => (
                          <div key={ans.id} className="flex items-center gap-3">
                            <Checkbox 
                              onChange={() => handleCorrectChange(qIndex, aIndex)} 
                              checked={ans.isCorrect}
                              className="flex-shrink-0"
                            />
                            <InputText  
                              value={ans.text}
                              onChange={(e) => handleAnswerChange(qIndex, aIndex, e.target.value)} 
                              className="flex-1 input-style"
                              placeholder={`Respuesta ${aIndex + 1}`}
                              required  
                            />
                            {q.answers.length > 2 && (
                              <Button
                                type="button"
                                onClick={() => removeAnswer(qIndex, aIndex)}
                                className="text-red-500 hover:text-red-700 flex-shrink-0"
                                text
                                size="small"
                              >
                                <CloseIcon size={16} />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          onClick={() => addAnswer(qIndex)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                          text
                          size="small"
                        >
                          <Plus size={14} className="mr-1" />
                          Añadir Respuesta
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
```

Después:
```tsx
              <div className="space-y-6 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-foreground">
                    Preguntas ({questions.length}/10)
                  </h4>
```
```tsx
                {questions.map((q, qIndex) => (
                  <Card key={q.id} className="p-4 border border-border">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="font-semibold text-foreground">
                          Pregunta {qIndex + 1}
                        </label>
                        {questions.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeQuestion(qIndex)}
                            className="text-error hover:opacity-80"
                            text
                            size="small"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
```
```tsx
                      <div className="pl-4 space-y-3">
                        <label className="text-sm font-medium text-muted-foreground">
                          Respuestas:
                        </label>
                        {q.answers.map((ans, aIndex) => (
                          <div key={ans.id} className="flex items-center gap-3">
                            <Checkbox 
                              onChange={() => handleCorrectChange(qIndex, aIndex)} 
                              checked={ans.isCorrect}
                              className="flex-shrink-0"
                            />
                            <InputText  
                              value={ans.text}
                              onChange={(e) => handleAnswerChange(qIndex, aIndex, e.target.value)} 
                              className="flex-1 input-style"
                              placeholder={`Respuesta ${aIndex + 1}`}
                              required  
                            />
                            {q.answers.length > 2 && (
                              <Button
                                type="button"
                                onClick={() => removeAnswer(qIndex, aIndex)}
                                className="text-error hover:opacity-80 flex-shrink-0"
                                text
                                size="small"
                              >
                                <CloseIcon size={16} />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          onClick={() => addAnswer(qIndex)}
                          className="text-sm text-primary hover:opacity-80"
                          text
                          size="small"
                        >
                          <Plus size={14} className="mr-1" />
                          Añadir Respuesta
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
```

- [ ] **Step 4: Sección Caso de Estudio (label, caja de error, caja "Tip")**

Antes (líneas 380-433):
```tsx
              <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <label className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Escenario del Caso de Estudio
                  </label>
```
```tsx
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertCircle className="text-red-500 mr-2" size={16} />
                      <span className="text-sm text-red-700 dark:text-red-300">
                        {error}
                      </span>
                      <button
                        type="button"
                        onClick={clearError}
                        className="ml-auto text-red-500 hover:text-red-700"
                      >
                        <CloseIcon size={14} />
                      </button>
                    </div>
                  </div>
                )}
```
```tsx
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    💡 <strong>Tip:</strong> Completa la descripción del test y luego usa el botón &quot;Generar con IA&quot; 
                    para crear un caso de estudio personalizado para {profession}. La evaluación se realizará mediante IA.
                  </p>
                </div>
              </div>
            )}
```

Después:
```tsx
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <label className="text-lg font-semibold text-foreground">
                    Escenario del Caso de Estudio
                  </label>
```
```tsx
                {error && (
                  <div className="bg-error-soft border border-error rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertCircle className="text-error mr-2" size={16} />
                      <span className="text-sm text-error-soft-foreground">
                        {error}
                      </span>
                      <button
                        type="button"
                        onClick={clearError}
                        className="ml-auto text-error hover:opacity-80"
                      >
                        <CloseIcon size={14} />
                      </button>
                    </div>
                  </div>
                )}
```
```tsx
                <div className="bg-primary/15 p-3 rounded-lg">
                  <p className="text-xs text-primary">
                    💡 <strong>Tip:</strong> Completa la descripción del test y luego usa el botón &quot;Generar con IA&quot; 
                    para crear un caso de estudio personalizado para {profession}. La evaluación se realizará mediante IA.
                  </p>
                </div>
              </div>
            )}
```

- [ ] **Step 5: Footer**

Antes (líneas 438-439):
```tsx
          <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <div className="text-sm text-gray-500 dark:text-gray-400">
```

Después:
```tsx
          <div className="p-4 border-t border-border flex justify-between items-center bg-muted">
            <div className="text-sm text-muted-foreground">
```

- [ ] **Step 6: Verificar**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en `CreateTestModal.tsx`.

Run: `grep -nE "gray-|blue-|red-|dark:" src/app/Componentes/TestComponent/CreateTestModal.tsx`
Expected: 0 resultados (la única excepción permitida, no capturada por este patrón, es el overlay `bg-black bg-opacity-50`, fuera de alcance por diseño).

- [ ] **Step 7: Commit**

```bash
git add src/app/Componentes/TestComponent/CreateTestModal.tsx
git commit -m "feat: retemear CreateTestModal.tsx a tokens organico-calido"
```
