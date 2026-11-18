import { NodeColors } from '@/app/Interfas/Interfaces';

// El organigrama es la excepcion deliberada a "un solo acento": el usuario
// pidio colores llamativos ac + propositos para poder distinguir los 5
// niveles jerarquicos de un vistazo, en vez de la paleta habitual de la
// app (que ademas colapsaba Nivel 1 y 2 al mismo verde porque
// --warm-contrast = --primary en el tema claro). Son hex fijos, no tokens
// de la app, a proposito: esta pantalla no debe seguir la disciplina de
// "un solo acento" del resto de RRHH.
export const NODE_COLORS: Record<number, NodeColors> = {
  1: { bg: '#1B3A2B', text: '#FFFFFF', border: '#0F2A1C' }, // Direccion -- fir, ancla de marca
  2: { bg: '#EE4129', text: '#FFFFFF', border: '#BA3320' }, // Gerencia -- tomate
  3: { bg: '#D9A72E', text: '#2A1D00', border: '#A97F1E' }, // Supervision -- ambar
  4: { bg: '#2563EB', text: '#FFFFFF', border: '#1D4ED8' }, // Coordinacion -- azul
  5: { bg: '#7C3AED', text: '#FFFFFF', border: '#6D28D9' }, // Operativo -- violeta
};

export const DEFAULT_NODE_COLOR: NodeColors = {
  bg: '#6B7280',
  text: '#FFFFFF',
  border: '#4B5563',
};

// Variante "Claro": mismo hue por nivel, en tinte pastel con texto oscuro.
export const NODE_COLORS2: Record<number, NodeColors> = {
  1: { bg: '#E3EDE6', text: '#1B3A2B', border: '#1B3A2B' },
  2: { bg: '#FCE4E1', text: '#BA3320', border: '#EE4129' },
  3: { bg: '#FBF0D9', text: '#7A5A12', border: '#D9A72E' },
  4: { bg: '#DCE8FD', text: '#1D4ED8', border: '#2563EB' },
  5: { bg: '#EDE3FB', text: '#6D28D9', border: '#7C3AED' },
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
