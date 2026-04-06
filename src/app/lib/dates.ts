import { Temporal } from '@js-temporal/polyfill';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface HolidayApi {
    fecha: string;   // 'YYYY-MM-DD'
    tipo: string;
    nombre: string;
}

export interface PlainHoliday {
    date: Temporal.PlainDate;
    name: string;
    type: string;
}

// ─── Configuración de feriados trasladables ───────────────────────────────────
// Key: fecha original 'YYYY-MM-DD', Value: fecha nueva 'YYYY-MM-DD'

export const MOVEABLE_DATES: Record<string, string> = {
    '2025-10-12': '2025-10-13',
};

// ─── Funciones ────────────────────────────────────────────────────────────────

/** Convierte 'YYYY-MM-DD' → Temporal.PlainDate (sin el bug del mes -1 de JS) */
export const toPlainDate = (iso: string): Temporal.PlainDate =>
    Temporal.PlainDate.from(iso);

/** Temporal.PlainDate → 'YYYY-MM-DD' */
export const toISOString = (d: Temporal.PlainDate): string => d.toString();

/** Temporal.PlainDate → Date nativo (solo para APIs que lo requieran, ej: PrimeReact) */
export const toNativeDate = (d: Temporal.PlainDate): Date =>
    new Date(d.year, d.month - 1, d.day);

/** Date nativo → Temporal.PlainDate */
export const fromNativeDate = (d: Date): Temporal.PlainDate =>
    Temporal.PlainDate.from({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate(),
    });

/** Verdadero si el día es sábado (6) o domingo (7) en ISO dayOfWeek */
export const isWeekend = (d: Temporal.PlainDate): boolean =>
    d.dayOfWeek >= 6;

/**
 * Procesa la lista de feriados de la API:
 * - Parsea las fechas con Temporal (sin bug de mes)
 * - Aplica traslados según MOVEABLE_DATES
 * - Devuelve un Map<'YYYY-MM-DD', PlainHoliday> para O(1) lookup
 */
export const processHolidays = (
    raw: HolidayApi[],
    moveable: Record<string, string> = MOVEABLE_DATES,
): Map<string, PlainHoliday> => {
    const map = new Map<string, PlainHoliday>();

    for (const h of raw) {
        map.set(h.fecha, {
            date: toPlainDate(h.fecha),
            name: h.nombre,
            type: h.tipo,
        });
    }

    for (const [original, newDateStr] of Object.entries(moveable)) {
        if (!map.has(original)) continue;
        const holiday = map.get(original)!;
        map.delete(original);
        map.set(newDateStr, {
            date: toPlainDate(newDateStr),
            name: `${holiday.name} (Trasladado)`,
            type: holiday.type,
        });
    }

    return map;
};

/**
 * Cuenta días hábiles entre dos fechas (inclusive ambos extremos).
 * Excluye fines de semana y feriados del Set provisto.
 */
export const countBusinessDays = (
    start: Temporal.PlainDate,
    end: Temporal.PlainDate,
    holidaySet: Set<string>,
): number => {
    let count = 0;
    let current = start;

    while (Temporal.PlainDate.compare(current, end) <= 0) {
        if (!isWeekend(current) && !holidaySet.has(toISOString(current))) {
            count++;
        }
        current = current.add({ days: 1 });
    }

    return count;
};