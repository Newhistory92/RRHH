# Paleta de colores del sistema

Referencia de la paleta implementada en `src/app/globals.css`. Cualquier cambio de
color debe pasar por `node scripts/check-contrast.mjs` **antes** de mergearse: el
script recalcula el contraste WCAG de cada par texto/fondo del sistema y falla
(`exit 1`) si alguno queda por debajo de AA (4.5:1 para texto normal).

## 1. Los 6 colores base y su rol

| Color | Hex | Rol semántico |
|---|---|---|
| Charcoal | `#37363E` | Texto principal / `--foreground`, `--warm-contrast` |
| Teal | `#1E5561` | Color de marca / `--primary` (modo claro) |
| Oliva | `#C3D184` | Acento / `--accent`, paso intermedio-alto de la rampa de desempeño |
| Rojo | `#EF4444` | Color de marca para error/destructivo (uso como *fill*, no como texto — ver trampas) |
| Sage | `#6AA69B` | Tinte secundario / paso "bien" de la rampa de desempeño |
| Ámbar | `#D97706` | Advertencia / paso "regular" de la rampa de desempeño |

Estos 6 son los colores de marca declarados como `--brand-*` en `globals.css`
(`--brand-charcoal`, `--brand-teal`, `--brand-olive`, `--brand-red`,
`--brand-sage`, `--brand-amber`). El resto de los tokens del sistema (`--primary`,
`--secondary`, `--accent`, `--destructive`, `--color-success`, etc.) se derivan de
estos 6, ya sea usándolos directamente o mediante sus variantes de texto
accesibles (ver §2).

## 2. Las cuatro trampas de la paleta

Estos son los cuatro problemas de contraste descubiertos durante el plan de
retheme, y cómo se resolvieron:

1. **El teal primario (`#1E5561`) es ilegible en modo oscuro.** Sobre el fondo
   oscuro (`#24232A`) da apenas 1.87:1. Por eso `--primary` en `.dark` usa un
   teal más claro, `#5FA3B2` (5.46:1 sobre `#24232A`), no el mismo hex que en
   claro.
2. **Sage (`#6AA69B`) y ámbar (`#D97706`) no sirven como fill sólido con texto
   encima.** No hay combinación de texto blanco o charcoal sobre esos fondos
   que cumpla AA en tamaño de texto normal — solo funcionan como *tintes
   suaves* (fondos tipo "soft", con texto de otro color) o como color puro
   decorativo (íconos, barras, la rampa del medidor).
3. **Sage y ámbar sí sirven como texto, pero no con su hex base** — hace falta
   su variante oscurecida: `--brand-sage-text: #3D7065` (5.67:1 sobre blanco)
   y `--brand-amber-text: #A2570A` (5.38:1 sobre blanco). Lo mismo aplica a
   oliva (`--brand-olive-text: #616D33`, 5.61:1): el hex base da 1.64:1 como
   texto y es inutilizable.
4. **El rojo de marca (`#EF4444`) falla AA como texto de cuerpo.** Da 3.76:1
   sobre blanco. Para texto y para botones sólidos "destructivos" se usa la
   variante `--brand-red-text: #C42B2B` (5.63:1), que es también el valor de
   `--destructive` en modo claro.

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
| claro/foreground | `#F6F7F4` | `#37363E` | 11.10:1 |
| claro/card-foreground | `#FFFFFF` | `#37363E` | 11.93:1 |
| claro/muted-foreground | `#F6F7F4` | `#6B6A73` | 4.96:1 |
| claro/primary | `#1E5561` | `#FFFFFF` | 8.31:1 |
| claro/secondary | `#C9DEDA` | `#37363E` | 8.49:1 |
| claro/accent | `#C3D184` | `#37363E` | 7.26:1 |
| claro/destructive | `#C42B2B` | `#FFFFFF` | 5.63:1 |
| claro/warm-contrast | `#37363E` | `#FFFFFF` | 11.93:1 |
| claro/success-soft | `#E6F1EF` | `#3D7065` | 4.91:1 |
| claro/warning-soft | `#FDF3E7` | `#A2570A` | 4.91:1 |
| claro/error-soft | `#FDEAEA` | `#C42B2B` | 4.86:1 |
| claro/info-soft | `#DCE7EA` | `#1E5561` | 6.59:1 |
| oscuro/foreground | `#24232A` | `#EDECF0` | 13.24:1 |
| oscuro/card-foreground | `#2E2D36` | `#EDECF0` | 11.56:1 |
| oscuro/muted-foreground | `#24232A` | `#A3A1AC` | 6.12:1 |
| oscuro/primary | `#5FA3B2` | `#24232A` | 5.46:1 |
| oscuro/secondary | `#3A4644` | `#EDECF0` | 8.35:1 |
| oscuro/accent | `#C3D184` | `#37363E` | 7.26:1 |
| oscuro/destructive | `#F87171` | `#24232A` | 5.63:1 |
| oscuro/success-soft | `#24352F` | `#8FC0B6` | 6.39:1 |
| oscuro/warning-soft | `#3A2E1A` | `#FBBF24` | 7.93:1 |
| oscuro/error-soft | `#3A2323` | `#F87171` | 5.26:1 |
| oscuro/info-soft | `#1B333A` | `#5FA3B2` | 4.66:1 |
| login/texto-panel | `#2A2930` | `#FFFFFF` | 14.40:1 |
| login/acento-panel | `#2A2930` | `#C3D184` | 8.76:1 |
| login/texto-sobre-teal | `#1E5561` | `#FFFFFF` | 8.31:1 |
| login/error | `#2A2930` | `#F87171` | 5.21:1 |

## 4. Tokens: valor en claro y en oscuro

| Token | Claro | Oscuro |
|---|---|---|
| `--background` | `#F6F7F4` | `#24232A` |
| `--foreground` | `#37363E` | `#EDECF0` |
| `--card` | `#FFFFFF` | `#2E2D36` |
| `--card-foreground` | `#37363E` | `#EDECF0` |
| `--popover` | `#FFFFFF` | `#2E2D36` |
| `--popover-foreground` | `#37363E` | `#EDECF0` |
| `--primary` | `#1E5561` | `#5FA3B2` |
| `--primary-foreground` | `#FFFFFF` | `#14262B` |
| `--secondary` | `#C9DEDA` | `#3A4644` |
| `--secondary-foreground` | `#37363E` | `#EDECF0` |
| `--muted` | `#F3F3F4` | `#33323B` |
| `--muted-foreground` | `#6B6A73` | `#A3A1AC` |
| `--accent` | `#C3D184` | `#C3D184` |
| `--accent-foreground` | `#37363E` | `#37363E` |
| `--destructive` | `#C42B2B` | `#F87171` |
| `--destructive-foreground` | `#FFFFFF` | `#24232A` |
| `--border` / `--input` | `color-mix(#37363E 16%, transparent)` | `#45444F` |
| `--ring` | `color-mix(#1E5561 55%, transparent)` | `color-mix(#5FA3B2 55%, transparent)` |
| `--warm-contrast` | `#37363E` | `#C3D184` |
| `--warm-contrast-foreground` | `#FFFFFF` | `#37363E` |
| `--color-success` | `#3D7065` | `#8FC0B6` |
| `--color-success-foreground` | `#FFFFFF` | `#24352F` |
| `--color-warning` | `#A2570A` | `#FBBF24` |
| `--color-warning-foreground` | `#FFFFFF` | `#3A2E1A` |
| `--color-error` | `#C42B2B` | `#F87171` |
| `--color-error-foreground` | `#FFFFFF` | `#3A2323` |
| `--color-info` | `#1E5561` | `#5FA3B2` |
| `--color-info-foreground` | `#FFFFFF` | `#1B333A` |
| `--color-success-soft` | `#E6F1EF` | `#24352F` |
| `--color-success-soft-foreground` | `#3D7065` | `#8FC0B6` |
| `--color-warning-soft` | `#FDF3E7` | `#3A2E1A` |
| `--color-warning-soft-foreground` | `#A2570A` | `#FBBF24` |
| `--color-error-soft` | `#FDEAEA` | `#3A2323` |
| `--color-error-soft-foreground` | `#C42B2B` | `#F87171` |
| `--color-info-soft` | `#DCE7EA` | `#1B333A` |
| `--color-info-soft-foreground` | `#1E5561` | `#5FA3B2` |

### Rampa de desempeño (5 pasos, siempre con texto `#37363E` encima)

| Paso | Token | Hex | Significado |
|---|---|---|---|
| 1 (mejor) | `--scale-1` | `#3D7065` | Sage-text |
| 2 | `--scale-2` | `#6AA69B` | Sage |
| 3 | `--scale-3` | `#C3D184` | Oliva |
| 4 | `--scale-4` | `#D97706` | Ámbar |
| 5 (peor) | `--scale-5` | `#C42B2B` | Rojo-text |

El color de la rampa nunca es el único indicador de nivel: siempre va
acompañado de una etiqueta numérica/textual adyacente (confirmado en la
Tarea 3 del plan), para no depender solo del color (WCAG 1.4.1).

## 5. Antes de agregar un color nuevo

1. Definir el hex como variante de un `--brand-*` existente si es posible, o
   como nuevo `--brand-*` si es realmente un color nuevo de marca.
2. Si se va a usar como texto o como fill con texto encima, calcular su
   variante `-text` (u homóloga) contra los fondos reales donde va a
   aparecer.
3. Agregar el par (o los pares) a `PARES` en `scripts/check-contrast.mjs`.
4. Correr `node scripts/check-contrast.mjs` y confirmar `Todos los pares
   cumplen AA.` antes de commitear.
