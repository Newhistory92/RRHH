'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import { Calendar } from 'primereact/calendar';
import { addLocale, type LocaleOptions } from 'primereact/api';
import { CalendarDays, X } from 'lucide-react';
import {
  type HolidayApi,
  type PlainHoliday,
  processHolidays,
  countBusinessDays,
  toNativeDate,
  fromNativeDate,
} from '@/app/lib/dates';

// ─── Locale (fuera del componente, se registra una sola vez) ──────────────────

addLocale('es', {
  firstDayOfWeek: 1,
  dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  today: 'Hoy',
  clear: 'Limpiar',
} as LocaleOptions);

// ─── Props ────────────────────────────────────────────────────────────────────

interface DateRangePickerProps {
  onDateChange: (start: Date | null, end: Date | null, dias: number) => void;
  maxDays?: number;
  allowPastDates?: boolean;
}


// Hook para detectar si es mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function DateRangePicker({ onDateChange, maxDays, allowPastDates }: DateRangePickerProps) {
  const [dates, setDates] = useState<[Date | null, Date | null] | null>(null);
  const [holidayMap, setHolidayMap] = useState<Map<string, PlainHoliday>>(new Map());
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  // ── Fetch feriados ──────────────────────────────────────────────────────────
  useEffect(() => {
    const year = Temporal.Now.plainDateISO().year;

    fetch(`https://api.argentinadatos.com/v1/feriados/${year}`)
      .then(r => { if (!r.ok) throw new Error('Error al obtener feriados'); return r.json(); })
      .then((data: HolidayApi[]) => setHolidayMap(processHolidays(data)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Cálculo de días hábiles ─────────────────────────────────────────────────
  const businessDays = useMemo(() => {
    if (!dates?.[0] || !dates?.[1]) return 0;

    const start = fromNativeDate(dates[0]);
    const end = fromNativeDate(dates[1]);
    const holidaySet = new Set(holidayMap.keys());

    return countBusinessDays(start, end, holidaySet);
  }, [dates, holidayMap]);

  // ── Notificar al padre ──────────────────────────────────────────────────────
  useEffect(() => {
    onDateChange(dates?.[0] ?? null, dates?.[1] ?? null, businessDays);
  }, [dates, businessDays, onDateChange]);

  // ── disabledDates para PrimeReact (necesita Date nativo) ───────────────────
  const disabledDates = useMemo(
    () => Array.from(holidayMap.values()).map(h => toNativeDate(h.date)),
    [holidayMap],
  );

  // ── Template de celda del calendario ───────────────────────────────────────
  const dateTemplate = useCallback((meta: { year: number; month: number; day: number }) => {
    // PrimeReact entrega month 0-based → reconstruimos el string ISO manualmente
    const iso = `${meta.year}-${String(meta.month + 1).padStart(2, '0')}-${String(meta.day).padStart(2, '0')}`;
    const holiday = holidayMap.get(iso);

    if (holiday) {
      return (
        <span
          title={holiday.name}
          className="line-through text-error font-medium"
        >
          {meta.day}
        </span>
      );
    }
    return meta.day;
  }, [holidayMap]);

  // ── Límites del calendario ──────────────────────────────────────────────────
  const today = Temporal.Now.plainDateISO();
  const minDate = allowPastDates ? toNativeDate(today.with({ month: 1, day: 1 })) : toNativeDate(today);
  const maxDate = toNativeDate(today.with({ month: 12, day: 31 }));

  const exceedsMax = maxDays !== undefined && businessDays > maxDays;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-4 w-full">

      {/* Indicador de carga */}
      {loading && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2 border-border border-t-primary animate-spin" />
          Cargando feriados...
        </p>
      )}

      {/* Calendario */}
      <div className="w-full overflow-x-auto">
        <Calendar
          value={dates}
          onChange={e => setDates(e.value as [Date | null, Date | null])}
          selectionMode="range"
          readOnlyInput
          inline
          locale="es"
          numberOfMonths={isMobile ? 1 : 2}
          minDate={minDate}
          maxDate={maxDate}
          disabledDays={[0, 6]}
          disabledDates={disabledDates}
          dateTemplate={dateTemplate}
          className="w-full"
          pt={{
            panel: { className: 'rounded-2xl shadow-lg border border-border overflow-hidden' },
          }}
        />
      </div>
      {/* Acciones */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full">

        {/* Días hábiles */}
        {businessDays > 0 && (
          <div className={`flex items-center gap-2 px-4 py-2 border rounded-full ${exceedsMax ? 'bg-error-soft border-error text-error-soft-foreground' : 'bg-primary/15 border-primary/30 text-primary'}`}>
            <CalendarDays className="w-4 h-4" />
            <span className="text-sm font-medium">
              {businessDays} {businessDays === 1 ? 'día hábil' : 'días hábiles'}
              {maxDays !== undefined ? ` / Máx. permitidos: ${maxDays}` : ''}
            </span>
          </div>
        )}

        {/* Mensaje error local */}
        {exceedsMax && (
          <div className="w-full text-center text-xs text-error font-semibold mt-1">
            Superaste el máximo de días para esta licencia. Ajustá las fechas.
          </div>
        )}

        {/* Limpiar */}
        {dates && (
          <button
            onClick={() => setDates(null)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-full hover:bg-muted hover:border-border transition shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}