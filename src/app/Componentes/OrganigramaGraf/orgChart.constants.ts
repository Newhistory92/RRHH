import { NodeColors } from '@/app/Interfas/Interfaces';

// El organigrama es la excepcion deliberada a "un solo acento": el usuario
// pidio colores llamativos aca para distinguir los 5 niveles jerarquicos de
// un vistazo, en vez de la paleta 60/30/10 habitual de la app. Son hex
// fijos, no tokens de la app, a proposito.
//
// Paleta pastel (azul/mostaza/coral/rosa/violeta) tomada de una referencia
// que el usuario mostro y confirmo como la que le gusta para este grafico
// en particular -- no son los 5 colores "llamativos" saturados de un
// primer intento (que el usuario encontro feo), son el tono pastel mas
// suave de la imagen de referencia.
const HUES = {
  azul:    { bg: '#A4C5EF', text: '#2C5282' },
  mostaza: { bg: '#F3CE8B', text: '#8A5A12' },
  coral:   { bg: '#F0AD80', text: '#9C4A1D' },
  rosa:    { bg: '#EA98AC', text: '#9C3A52' },
  violeta: { bg: '#C89FE3', text: '#5B3B8C' },
};

export const NODE_COLORS: Record<number, NodeColors> = {
  1: { bg: HUES.azul.bg,    text: HUES.azul.text,    border: HUES.azul.text },    // Direccion
  2: { bg: HUES.mostaza.bg, text: HUES.mostaza.text, border: HUES.mostaza.text }, // Gerencia
  3: { bg: HUES.coral.bg,   text: HUES.coral.text,   border: HUES.coral.text },   // Supervision
  4: { bg: HUES.rosa.bg,    text: HUES.rosa.text,    border: HUES.rosa.text },    // Coordinacion
  5: { bg: HUES.violeta.bg, text: HUES.violeta.text, border: HUES.violeta.text }, // Operativo
};

export const DEFAULT_NODE_COLOR: NodeColors = {
  bg: '#D1D5DB',
  text: '#374151',
  border: '#374151',
};

// Variante "Claro": mismo hue, tinte mas palido con el color de texto como
// borde para que el nivel se siga reconociendo de un vistazo.
const tint = (hex: string) => `color-mix(in srgb, ${hex} 40%, white)`;

export const NODE_COLORS2: Record<number, NodeColors> = {
  1: { bg: tint(HUES.azul.bg),    text: HUES.azul.text,    border: HUES.azul.text },
  2: { bg: tint(HUES.mostaza.bg), text: HUES.mostaza.text, border: HUES.mostaza.text },
  3: { bg: tint(HUES.coral.bg),   text: HUES.coral.text,   border: HUES.coral.text },
  4: { bg: tint(HUES.rosa.bg),    text: HUES.rosa.text,    border: HUES.rosa.text },
  5: { bg: tint(HUES.violeta.bg), text: HUES.violeta.text, border: HUES.violeta.text },
};

export const DEFAULT_NODE_COLOR2: NodeColors = {
  bg: '#F3F4F6',
  text: '#374151',
  border: '#D1D5DB',
};

export const LEVEL_LABELS: Record<number, string> = {
  1: 'Dirección',
  2: 'Gerencia',
  3: 'Supervisión',
  4: 'Coordinación',
  5: 'Operativo',
};
