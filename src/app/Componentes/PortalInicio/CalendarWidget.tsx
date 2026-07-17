'use client';

import React, { useEffect, useState } from 'react';
import { Calendar } from 'primereact/calendar';
import { addLocale, type LocaleOptions } from 'primereact/api';
import { CalendarDays } from 'lucide-react';
import { Temporal } from '@js-temporal/polyfill';
import { type HolidayApi, type PlainHoliday, processHolidays } from '@/app/lib/dates';

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

interface CalendarDateTemplateArg {
  day: number;
  month: number;
  year: number;
}

export function CalendarWidget() {
  const [feriados, setFeriados] = useState<Map<string, PlainHoliday>>(new Map());

  useEffect(() => {
    const year = Temporal.Now.plainDateISO().year;
    fetch(`https://api.argentinadatos.com/v1/feriados/${year}`)
      .then((r) => { if (!r.ok) throw new Error('Error al obtener feriados públicos'); return r.json(); })
      .then((data: HolidayApi[]) => setFeriados(processHolidays(data)))
      .catch((err) => console.error('Error al cargar feriados:', err));
  }, []);

  const dateTemplate = (date: CalendarDateTemplateArg) => {
    const iso = `${date.year}-${String(date.month + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
    const holiday = feriados.get(iso);
    return (
      <span
        title={holiday?.name}
        className={holiday ? 'flex items-center justify-center w-full h-full rounded-full bg-error/20 text-error font-semibold' : ''}
      >
        {date.day}
      </span>
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-soft">
      <h3 className="font-heading text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
        <CalendarDays size={16} className="text-primary" />
        Calendario
      </h3>
      <div className="calendar-compact">
        <Calendar inline locale="es" dateTemplate={dateTemplate} className="w-full" />
      </div>
    </div>
  );
}
