'use client';

import React, { useEffect, useState } from 'react';
import { Calendar } from 'primereact/calendar';
import { addLocale, type LocaleOptions } from 'primereact/api';
import { CalendarDays } from 'lucide-react';
import { apiClient } from '@/app/util/apiClient';

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

interface Feriado {
  id: number;
  fecha: string;
  nombre: string;
}

interface CalendarDateTemplateArg {
  day: number;
  month: number;
  year: number;
}

export function CalendarWidget() {
  const [feriados, setFeriados] = useState<Feriado[]>([]);

  useEffect(() => {
    apiClient
      .get<{ feriados: Feriado[] }>('/licenses/feriados')
      .then((res) => setFeriados(res.feriados || []))
      .catch((err) => console.error('Error al cargar feriados:', err));
  }, []);

  const feriadoFechas = new Set(feriados.map((f) => f.fecha.slice(0, 10)));

  const dateTemplate = (date: CalendarDateTemplateArg) => {
    const iso = `${date.year}-${String(date.month + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
    const esFeriado = feriadoFechas.has(iso);
    return (
      <span className={esFeriado ? 'flex items-center justify-center w-full h-full rounded-full bg-error/20 text-error font-semibold' : ''}>
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
