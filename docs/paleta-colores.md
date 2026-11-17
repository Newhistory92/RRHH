# Paleta de colores del sistema

Referencia de la paleta implementada en `src/app/globals.css`. Cualquier cambio de
color debe pasar por `node scripts/check-contrast.mjs` **antes** de mergearse: el
script recalcula el contraste WCAG de cada par texto/fondo del sistema y falla
(`exit 1`) si alguno queda por debajo de AA (4.5:1 para texto normal).

> **Reemplazo de paleta (2026-11-17).** Se reemplazó por completo la paleta
> "Orgánico Cálido" (charcoal/teal/oliva/sage/ámbar/rojo) por un sistema
> 60/30/10 de 3 colores. El reemplazo arrancó por el dashboard de RRHH
> (`globals.css`, que es global, más el árbol Shell → Table → modales); el
> resto de las pantallas (IA/MCPIA, Estadísticas, Reubicación, Login, etc.)
> sigue usando los mismos *tokens* — por eso hereda el cambio de color
> automáticamente — pero no fue auditado pantalla por pantalla todavía.
> El único lugar con hex *crudo* sin tokens es `pages/Login`, fuera de este
> pase.

## 1. Los 3 colores base y su rol (60/30/10)

| Color | Hex | Proporción | Rol semántico |
|---|---|---|---|
| Crema Clásica | `#F1E8D8` | 60% | Superficies / `--background`, `--card` |
| Verde Abeto | `#1B3A2B` | 30% | Texto, marca, navegación / `--foreground`, `--primary` |
| Rojo Tomate | `#EE4129` | 10% | Reservado para atención / `--destructive`, `--color-error` — **nunca fondo de sección** |

Estos son los `--brand-*` declarados en `globals.css` (`--brand-cream`,
`--brand-fir`, `--brand-tomato`), **constantes en los dos temas** — el claro y
el oscuro usan el mismo hex de marca, igual que en la paleta anterior
(el teal y el oliva tampoco cambiaban de hex entre temas). Lo que sí cambia
por tema son las variantes de texto (ver §2) y los tokens derivados
(`--primary`, `--color-success`, etc.), porque un verde muy oscuro como
fir no se puede usar como *fill* visible sobre un fondo que también es oscuro.

### La excepción documentada: `--brand-ocre`

El pedido de paleta no define un cuarto color para "advertencia" (algo
distinto de error pero que tampoco es la marca). No existe tal color dentro
de crema+fir+tomate: la regla 1 del pedido pide que el tomate se sienta
"escaso", así que usarlo también para warning lo volvería el color más común
de la pantalla. Se introdujo un ocre terroso (`#8A5A12` claro / `#E2A54A`
oscuro) que se mantiene en el mundo cálido de la paleta (ni azul ni morado) y
solo se usa en `--color-warning` y su variante `-soft`. Es la única excepción
a los 3 colores declarados, y existe porque **no inventar nada no es una
opción cuando el semáforo de licencias necesita 3 estados distintos**
(Activo=éxito, De licencia=advertencia, Parte médico=error).

`--color-info` no tiene excepción propia: se alinea con éxito (verde abeto).
No hay un cuarto color disponible sin salirse de la paleta, y el único uso
real de `info` hoy es en `Login` (fuera de este pase).

## 2. Las tres trampas de la paleta nueva

1. **Blanco sobre tomate falla AA (3.87:1), y el propio verde abeto como
   texto sobre tomate también falla (3.22:1).** Ningún texto convencional
   funciona sobre un fill sólido de `#EE4129`. La solución es `--brand-ink`
   (`#130503` claro / `#0A140F` oscuro), un casi-negro cálido que no es un
   cuarto color de marca — es tinta, igual que el blanco/negro que ya convivía
   con los 6 colores de la paleta anterior. `--destructive-foreground` y
   `--color-error-foreground` usan `--brand-ink`, nunca blanco.
2. **El rojo tomate como texto plano sobre crema tampoco alcanza AA
   (3.19:1).** Para texto/ícono (links, `-strong`, `error-soft-foreground`)
   se usa `--brand-tomato-text` (`#BA3320` claro / `#FF7A5C` oscuro, 4.82:1 /
   7.31:1), nunca el hex base a mano.
3. **`--accent` de shadcn no es el acento de marca.** Los componentes
   shadcn (`DropdownMenuItem`, botón *ghost*, `Skeleton`) usan
   `focus:bg-accent` / `hover:bg-accent` como resaltado neutro en **toda la
   app**, no como "el 10% de atención". Si `--accent` fuera tomate, cada
   hover de cada menú de toda la aplicación se pondría rojo — lo opuesto a
   "el acento debe sentirse escaso" (regla 1 del pedido). Por eso `--accent`
   quedó como un tinte neutro de crema/fir (`#DED8C8` claro / `#2A362F`
   oscuro) y el tomate vive únicamente en `--destructive` y
   `--color-error`/`-soft`, que son los lugares que ya significaban
   "atención" en este código antes del reemplazo.

Regla general: **un color de marca "crudo" (`--brand-*`) no está garantizado
como texto legible.** Si hace falta usar un color de marca como texto o como
fill con texto encima, usar su variante `-text` o el token del sistema
(`--destructive`, `--color-success-soft-foreground`, etc.), nunca el hex base
a mano.

## 3. Contrastes verificados

Tabla generada a partir de los pares de `scripts/check-contrast.mjs` (todos
cumplen AA, mínimo 4.5:1):

| Par | Fondo | Texto | Ratio |
|---|---|---|---|
| claro/foreground | `#F1E8D8` | `#1B3A2B` | 10.24:1 |
| claro/card-foreground | `#F7F2EA` | `#1B3A2B` | 11.17:1 |
| claro/muted-foreground | `#E4DECE` | `#4A6051` | 5.07:1 |
| claro/primary | `#1B3A2B` | `#FFFFFF` | 12.45:1 |
| claro/secondary | `#D7D3C3` | `#1B3A2B` | 8.30:1 |
| claro/accent | `#DED8C8` | `#1B3A2B` | 8.75:1 |
| claro/destructive | `#EE4129` | `#130503` | 5.16:1 |
| claro/warm-contrast | `#1B3A2B` | `#FFFFFF` | 12.45:1 |
| claro/success-soft | `#E4DECE` | `#1B3A2B` | 9.27:1 |
| claro/warning-soft | `#EEE4D2` | `#8A5A12` | 4.69:1 |
| claro/error-soft | `#F1E3D3` | `#BA3320` | 4.65:1 |
| claro/info-soft | `#E4DECE` | `#1B3A2B` | 9.27:1 |
| oscuro/foreground | `#171F1B` | `#EDE8DC` | 13.76:1 |
| oscuro/card-foreground | `#1E2822` | `#EDE8DC` | 12.43:1 |
| oscuro/muted-foreground | `#232D27` | `#9CA79D` | 5.71:1 |
| oscuro/primary | `#5CA87D` | `#0A140F` | 6.57:1 |
| oscuro/secondary | `#2A362F` | `#EDE8DC` | 10.30:1 |
| oscuro/accent | `#2A362F` | `#EDE8DC` | 10.30:1 |
| oscuro/destructive | `#FF7A5C` | `#0A140F` | 7.31:1 |
| oscuro/success-soft | `#1E2D25` | `#5CA87D` | 5.05:1 |
| oscuro/warning-soft | `#272A1F` | `#E2A54A` | 6.76:1 |
| oscuro/error-soft | `#2A2620` | `#FF7A5C` | 5.86:1 |
| oscuro/info-soft | `#1E2D25` | `#5CA87D` | 5.05:1 |
| login/texto-panel | `#2A2930` | `#FFFFFF` | 14.40:1 |
| login/acento-panel | `#2A2930` | `#C3D184` | 8.76:1 |
| login/texto-sobre-teal | `#1E5561` | `#FFFFFF` | 8.31:1 |
| login/error | `#2A2930` | `#F87171` | 5.21:1 |

Los cuatro pares `login/*` quedan con los hex de la paleta anterior: ese
archivo (`src/app/pages/Login`) tiene sus colores escritos a mano, no
tokens, y no fue tocado en este pase. Migrarlo es trabajo pendiente.

## 4. Tokens: valor en claro y en oscuro

| Token | Claro | Oscuro |
|---|---|---|
| `--background` | `#F1E8D8` | `#171F1B` |
| `--foreground` | `#1B3A2B` | `#EDE8DC` |
| `--card` | `#F7F2EA` | `#1E2822` |
| `--card-foreground` | `#1B3A2B` | `#EDE8DC` |
| `--popover` | `#F7F2EA` | `#1E2822` |
| `--popover-foreground` | `#1B3A2B` | `#EDE8DC` |
| `--primary` | `#1B3A2B` | `#5CA87D` |
| `--primary-foreground` | `#FFFFFF` | `#0A140F` |
| `--secondary` | `#D7D3C3` | `#2A362F` |
| `--secondary-foreground` | `#1B3A2B` | `#EDE8DC` |
| `--muted` | `#E4DECE` | `#232D27` |
| `--muted-foreground` | `#4A6051` | `#9CA79D` |
| `--accent` (neutro, no es el acento de marca) | `#DED8C8` | `#2A362F` |
| `--accent-foreground` | `#1B3A2B` | `#EDE8DC` |
| `--destructive` | `#EE4129` | `#FF7A5C` |
| `--destructive-foreground` | `#130503` | `#0A140F` |
| `--border` / `--input` | `color-mix(#1B3A2B 16%, transparent)` | `#34443B` |
| `--ring` | `color-mix(#1B3A2B 55%, transparent)` | `color-mix(#5CA87D 55%, transparent)` |
| `--warm-contrast` | `#1B3A2B` (= `--primary`) | `#5CA87D` (= `--primary`) |
| `--warm-contrast-foreground` | `#FFFFFF` | `#0A140F` |
| `--color-success` | `#1B3A2B` | `#5CA87D` |
| `--color-success-foreground` | `#FFFFFF` | `#0A140F` |
| `--color-warning` | `#8A5A12` | `#E2A54A` |
| `--color-warning-foreground` | `#FFFFFF` | `#0A140F` |
| `--color-error` | `#EE4129` | `#FF7A5C` |
| `--color-error-foreground` | `#130503` | `#0A140F` |
| `--color-info` | `#1B3A2B` (= success) | `#5CA87D` (= success) |
| `--color-info-foreground` | `#FFFFFF` | `#0A140F` |
| `--color-success-soft` | `#E4DECE` | `#1E2D25` |
| `--color-success-soft-foreground` | `#1B3A2B` | `#5CA87D` |
| `--color-warning-soft` | `#EEE4D2` | `#272A1F` |
| `--color-warning-soft-foreground` | `#8A5A12` | `#E2A54A` |
| `--color-error-soft` | `#F1E3D3` | `#2A2620` |
| `--color-error-soft-foreground` | `#BA3320` | `#FF7A5C` |
| `--color-info-soft` | `#E4DECE` (= success-soft) | `#1E2D25` (= success-soft) |

> **Nota — `--warm-contrast` ahora es igual a `--primary` en los dos temas.**
> En la paleta anterior tenía doble rol (charcoal en claro, oliva en
> oscuro) porque existían 6 colores de marca entre los que elegir un
> resaltado "distinto de primary". Con solo 3 colores no hay un cuarto tono
> disponible sin violar la regla 4 del pedido (un solo tono por color, sin
> variaciones de saturación al voleo) — así que el ítem activo del sidebar
> (`AppSidebar.tsx`, único consumidor) ahora se ve exactamente como un
> botón primario sólido. Es la consecuencia aceptada de tener menos colores
> de marca, no un bug.

> **Nota — `olive-strong` y `sage-strong` colapsan al mismo verde.** La
> paleta anterior tenía tres acentos decorativos de texto/ícono distintos
> (oliva, sage, ámbar). Con solo dos hues no-neutras disponibles (fir y el
> ocre de excepción), inventar un tercer verde "ligeramente distinto" solo
> para tener tres colores sería la variación de saturación al voleo que la
> regla 4 prohíbe. `--color-olive-strong` y `--color-sage-strong` apuntan
> ahora los dos a `--brand-fir-text`; `--color-amber-strong` apunta a
> `--brand-ocre-text`. Los únicos consumidores en vivo hoy son íconos
> decorativos en modales de licencias y paneles de estadísticas — ninguno
> dependía de que esos tres colores fueran distinguibles entre sí.

### Rampa de 5 pasos (reservada / sin uso actual)

| Paso | Token | Hex claro | Significado |
|---|---|---|---|
| 1 (mejor) | `--scale-1` | `#1B3A2B` | Fir |
| 2 | `--scale-2` | `#534A1F` | Fir→ocre, punto medio |
| 3 | `--scale-3` | `#8A5A12` | Ocre |
| 4 | `--scale-4` | `#BC4E1E` | Ocre→tomate, punto medio |
| 5 (peor) | `--scale-5` | `#EE4129` | Tomate |

Sigue sin estar cableada a ningún componente en vivo (ver nota histórica:
la única referencia a una rampa de 5 pasos es la sección legacy, comentada y
muerta, de `src/app/util/UiRRHH.tsx`, líneas ~1-793). El componente en vivo
que muestra un medidor de desempeño es `SoftSkillBar` (mismo archivo), con
una rampa de 3 pasos (`bg-success`/`bg-warning`/`bg-error`) que hereda la
paleta nueva automáticamente porque usa esos tokens.

## 5. Antes de agregar un color nuevo

1. Definir el hex como variante de un `--brand-*` existente si es posible, o
   como nuevo `--brand-*` si es realmente un color nuevo de marca — y
   confirmar con quien pidió la paleta que una cuarta/quinta familia de hue
   no rompe la regla de "un acento, tres colores".
2. Si se va a usar como texto o como fill con texto encima, calcular su
   variante `-text` (u homóloga) contra los fondos reales donde va a
   aparecer, en los dos temas.
3. Agregar el par (o los pares) a `PARES` en `scripts/check-contrast.mjs`.
4. Correr `node scripts/check-contrast.mjs` y confirmar `Todos los pares
   cumplen AA.` antes de commitear.
