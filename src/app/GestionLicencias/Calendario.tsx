import React, { useState, useEffect } from 'react';
import { Calendar } from 'primereact/calendar';
import { addLocale, LocaleOptions } from 'primereact/api';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
// --- INTERFACES DE TYPESCRIPT ---
interface HolidayApi {
  fecha: string;
  tipo: string;
  nombre: string;
}

interface Holiday {
  originalDate: string;
  date: Date;
  name: string;
  type: string;
}

interface DateRangePickerProps {
  onDateChange: (startDate: Date | null, endDate: Date | null) => void;
}

interface MoveableDatesConfig {
  [originalDate: string]: string; // Key: 'YYYY-MM-DD', Value: 'YYYY-MM-DD'
}

// --- CONFIGURACIÓN DE FECHAS TRASLADABLES ---
const moveableDatesConfig: MoveableDatesConfig = {
  '2025-10-12': '2025-10-13',
};

export default function DateRangePicker({ onDateChange }: DateRangePickerProps) {
  // Cambiado: Definir correctamente el tipo para selección de rango
  const [dates, setDates] = useState<[Date | null, Date | null] | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [businessDays, setBusinessDays] = useState<number>(0);

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

  useEffect(() => {
    const fetchAndProcessHolidays = async () => {
      const year = new Date().getFullYear();
      try {
        const response = await fetch(`https://api.argentinadatos.com/v1/feriados/${year}`);
        if (!response.ok) {
          throw new Error('No se pudieron obtener los feriados.');
        }
        const data: HolidayApi[] = await response.json();
        
        const holidaysMap = new Map<string, Holiday>();
        data.forEach(holiday => {
          // Solo parseamos la fecha para el calendario (para disabledDates)
          const [year, month, day] = holiday.fecha.split('-').map(Number);
          const dateForCalendar = new Date(year, month - 1, day);
          
          holidaysMap.set(holiday.fecha, {
            originalDate: holiday.fecha,
            date: dateForCalendar,
            name: holiday.nombre,
            type: holiday.tipo,
          });
        });

        // Procesar feriados trasladables
        for (const originalDate in moveableDatesConfig) {
          if (holidaysMap.has(originalDate)) {
            const holidayToMove = holidaysMap.get(originalDate)!;
            const newDateStr = moveableDatesConfig[originalDate];
            
            holidaysMap.delete(originalDate);
            
            const [year, month, day] = newDateStr.split('-').map(Number);
            holidayToMove.date = new Date(year, month - 1, day);
            holidayToMove.name = `${holidayToMove.name} (Trasladado)`;
            holidaysMap.set(newDateStr, holidayToMove);
          }
        }
        setHolidays(Array.from(holidaysMap.values()));
      } catch (error) {
        console.error("Error al obtener feriados:", error);
      }
    };
    fetchAndProcessHolidays();
  }, []);

  useEffect(() => {
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      const [startDate, endDate] = dates;
      
      const holidaySet = new Set(holidays.map(h => {
        const dateStr = h.date.getFullYear() + '-' + 
          String(h.date.getMonth() + 1).padStart(2, '0') + '-' + 
          String(h.date.getDate()).padStart(2, '0');
        return dateStr;
      }));
      
      let count = 0;
      const currentDate = new Date(startDate.getTime());

      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        const currentDateStr = currentDate.getFullYear() + '-' + 
          String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
          String(currentDate.getDate()).padStart(2, '0');
        
        const isHoliday = holidaySet.has(currentDateStr);

        if (!isWeekend && !isHoliday) {
          count++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setBusinessDays(count);
      onDateChange(startDate, endDate);
    } else {
      setBusinessDays(0);
      onDateChange(null, null);
    }
  }, [dates, holidays, onDateChange]);

  const disabledDates = holidays.map(h => h.date);
  
  const dateTemplate = (dateMeta: { year: number, month: number, day: number, today: boolean, selectable: boolean }) => {
    const currentRenderDate = new Date(dateMeta.year, dateMeta.month, dateMeta.day);
    const dateString = currentRenderDate.getFullYear() + '-' + 
      String(currentRenderDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(currentRenderDate.getDate()).padStart(2, '0');
    
    const holiday = holidays.find(h => {
      const holidayStr = h.date.getFullYear() + '-' + 
        String(h.date.getMonth() + 1).padStart(2, '0') + '-' + 
        String(h.date.getDate()).padStart(2, '0');
      return holidayStr === dateString;
    });

    if (holiday) {
      return (
        <strong style={{ textDecoration: 'line-through', color: 'red' }} title={holiday.name}>
          {dateMeta.day}
        </strong>
      );
    }
    return dateMeta.day;
  };
  
  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const maxDate = new Date(today.getFullYear(), 11, 31);
  
  const handleClearSelection = () => {
    setDates(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCalendarChange = (e: any) => {
    setDates(e.value);
  };

  return (
    <div className="flex flex-col items-center">
      <Calendar
        value={dates}
        onChange={handleCalendarChange}
        selectionMode="range"
        readOnlyInput
        inline
        locale="es"
        numberOfMonths={2}
        minDate={minDate}
        maxDate={maxDate}
        disabledDays={[0, 6]} 
        disabledDates={disabledDates}
        dateTemplate={dateTemplate} 
        className="w-full md:w-auto"
        panelClassName="rounded-lg shadow-md"
      />
      <div className="mt-6 text-center w-full flex justify-center items-center gap-4">
        <Button label="Limpiar selección" text raised
          onClick={handleClearSelection}
          className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={!dates}
        >
        </Button>
      </div>
      {businessDays > 0 && (
        <div className="mt-4 text-center">
            <Button text label=" Días hábiles seleccionados:" >
                <Badge severity="success" value={businessDays}></Badge>
            </Button>
        </div>
      )}
    </div>
  );
};