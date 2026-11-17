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
  ["claro/foreground",        "#F1E8D8", "#1B3A2B", 4.5],
  ["claro/card-foreground",   "#F7F2EA", "#1B3A2B", 4.5],
  ["claro/muted-foreground",  "#E4DECE", "#4A6051", 4.5],
  ["claro/primary",           "#1B3A2B", "#FFFFFF", 4.5],
  ["claro/secondary",         "#D7D3C3", "#1B3A2B", 4.5],
  ["claro/accent",            "#DED8C8", "#1B3A2B", 4.5],
  ["claro/destructive",       "#EE4129", "#130503", 4.5],
  ["claro/warm-contrast",     "#1B3A2B", "#FFFFFF", 4.5],
  // Rellenos solidos de estado. El par correcto es -foreground, NO
  // -soft-foreground: ese ultimo vale lo mismo que el fondo solido y deja el
  // texto invisible (rojo sobre rojo).
  ["claro/btn-error",         "#EE4129", "#130503", 4.5],
  ["claro/btn-success",       "#1B3A2B", "#FFFFFF", 4.5],
  ["claro/btn-disabled",      "#E4DECE", "#4A6051", 4.5],
  // Acentos decorativos usados como color de texto/icono sobre card.
  // Fir y ocre colapsan oliva/sage/ambar del sistema anterior.
  ["claro/olive-strong",      "#F7F2EA", "#1B3A2B", 4.5],
  ["claro/sage-strong",       "#F7F2EA", "#1B3A2B", 4.5],
  ["claro/amber-strong",      "#F7F2EA", "#8A5A12", 4.5],
  ["claro/success-soft",      "#E4DECE", "#1B3A2B", 4.5],
  ["claro/warning-soft",      "#EEE4D2", "#8A5A12", 4.5],
  ["claro/error-soft",        "#F1E3D3", "#BA3320", 4.5],
  ["claro/info-soft",         "#E4DECE", "#1B3A2B", 4.5],
  ["oscuro/foreground",       "#171F1B", "#EDE8DC", 4.5],
  ["oscuro/card-foreground",  "#1E2822", "#EDE8DC", 4.5],
  ["oscuro/muted-foreground", "#232D27", "#9CA79D", 4.5],
  ["oscuro/primary",          "#5CA87D", "#0A140F", 4.5],
  ["oscuro/secondary",        "#2A362F", "#EDE8DC", 4.5],
  ["oscuro/accent",           "#2A362F", "#EDE8DC", 4.5],
  ["oscuro/destructive",      "#FF7A5C", "#0A140F", 4.5],
  ["oscuro/btn-error",        "#FF7A5C", "#0A140F", 4.5],
  ["oscuro/btn-success",      "#5CA87D", "#0A140F", 4.5],
  ["oscuro/btn-disabled",     "#232D27", "#9CA79D", 4.5],
  ["oscuro/olive-strong",     "#1E2822", "#5CA87D", 4.5],
  ["oscuro/sage-strong",      "#1E2822", "#5CA87D", 4.5],
  ["oscuro/amber-strong",     "#1E2822", "#E2A54A", 4.5],
  ["oscuro/success-soft",     "#1E2D25", "#5CA87D", 4.5],
  ["oscuro/warning-soft",     "#272A1F", "#E2A54A", 4.5],
  ["oscuro/error-soft",       "#2A2620", "#FF7A5C", 4.5],
  ["oscuro/info-soft",        "#1E2D25", "#5CA87D", 4.5],
  // Login no se toco en este pase (fuera del alcance "dashboard"): queda
  // con la paleta anterior hasta que se audite esa pantalla.
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
