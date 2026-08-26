// scripts/check-contrast.mjs
// Verifica que cada par texto/fondo del sistema de diseño cumpla WCAG AA.
// Uso: node scripts/check-contrast.mjs
const lin = (c) => {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const lum = (hex) => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

// [nombre, fondo, texto, mínimo exigido]
const PARES = [
  ["claro/foreground",        "#F6F7F4", "#37363E", 4.5],
  ["claro/card-foreground",   "#FFFFFF", "#37363E", 4.5],
  ["claro/muted-foreground",  "#F6F7F4", "#6B6A73", 4.5],
  ["claro/primary",           "#1E5561", "#FFFFFF", 4.5],
  ["claro/secondary",         "#C9DEDA", "#37363E", 4.5],
  ["claro/accent",            "#C3D184", "#37363E", 4.5],
  ["claro/destructive",       "#C42B2B", "#FFFFFF", 4.5],
  ["claro/warm-contrast",     "#37363E", "#FFFFFF", 4.5],
  // Rellenos solidos de estado. El par correcto es -foreground, NO
  // -soft-foreground: ese ultimo vale lo mismo que el fondo solido y deja el
  // texto invisible (rojo sobre rojo).
  ["claro/btn-error",         "#C42B2B", "#FFFFFF", 4.5],
  ["claro/btn-success",       "#3D7065", "#FFFFFF", 4.5],
  ["claro/btn-disabled",      "#F3F3F4", "#6B6A73", 4.5],
  // Acentos decorativos usados como color de texto/icono sobre card.
  // Los tonos base fallan aca (oliva 1.64:1), por eso existen las -strong.
  ["claro/olive-strong",      "#FFFFFF", "#616D33", 4.5],
  ["claro/sage-strong",       "#FFFFFF", "#3D7065", 4.5],
  ["claro/amber-strong",      "#FFFFFF", "#A2570A", 4.5],
  ["claro/success-soft",      "#E6F1EF", "#3D7065", 4.5],
  ["claro/warning-soft",      "#FDF3E7", "#A2570A", 4.5],
  ["claro/error-soft",        "#FDEAEA", "#C42B2B", 4.5],
  ["claro/info-soft",         "#DCE7EA", "#1E5561", 4.5],
  ["oscuro/foreground",       "#24232A", "#EDECF0", 4.5],
  ["oscuro/card-foreground",  "#2E2D36", "#EDECF0", 4.5],
  ["oscuro/muted-foreground", "#24232A", "#A3A1AC", 4.5],
  ["oscuro/primary",          "#5FA3B2", "#24232A", 4.5],
  ["oscuro/secondary",        "#3A4644", "#EDECF0", 4.5],
  ["oscuro/accent",           "#C3D184", "#37363E", 4.5],
  ["oscuro/destructive",      "#F87171", "#24232A", 4.5],
  ["oscuro/btn-error",        "#F87171", "#3A2323", 4.5],
  ["oscuro/btn-success",      "#8FC0B6", "#24352F", 4.5],
  ["oscuro/btn-disabled",     "#33323B", "#A3A1AC", 4.5],
  ["oscuro/olive-strong",     "#2E2D36", "#C3D184", 4.5],
  ["oscuro/sage-strong",      "#2E2D36", "#8FC0B6", 4.5],
  ["oscuro/amber-strong",     "#2E2D36", "#FBBF24", 4.5],
  ["oscuro/success-soft",     "#24352F", "#8FC0B6", 4.5],
  ["oscuro/warning-soft",     "#3A2E1A", "#FBBF24", 4.5],
  ["oscuro/error-soft",       "#3A2323", "#F87171", 4.5],
  ["oscuro/info-soft",        "#1B333A", "#5FA3B2", 4.5],
  ["login/texto-panel",       "#2A2930", "#FFFFFF", 4.5],
  ["login/acento-panel",      "#2A2930", "#C3D184", 4.5],
  ["login/texto-sobre-teal",  "#1E5561", "#FFFFFF", 4.5],
  ["login/error",             "#2A2930", "#F87171", 4.5],
];

let fallos = 0;
for (const [nombre, bg, fg, min] of PARES) {
  const r = ratio(bg, fg);
  const ok = r >= min;
  if (!ok) fallos++;
  console.log(
    `${ok ? "OK  " : "FALLA"} ${nombre.padEnd(26)} ${bg} / ${fg}  ${r.toFixed(2)}:1 (min ${min})`
  );
}
console.log(fallos === 0 ? "\nTodos los pares cumplen AA." : `\n${fallos} par(es) por debajo del mínimo.`);
process.exit(fallos === 0 ? 0 : 1);
