import React, { useState, useEffect } from 'react';
import { Calendar } from 'primereact/calendar';
import { addLocale, LocaleOptions } from 'primereact/api';

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

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
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

// Componente principal que utiliza el DateRangePicker
export default function Calendario({ onDateChange }: DateRangePickerProps) {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
const [diasHabiles, setDiasHabiles] = useState<number>(0);

  // 🔥 NUEVO: Pasar datos al componente padre cuando cambien
  const handleDateChange = (startDate: Date | null, endDate: Date | null, businessDays: number) => {
    setDateRange({ startDate, endDate });
    setDiasHabiles(businessDays);
    
    // Notificar al componente padre
    onDateChange(startDate, endDate);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('es-ES', { timeZone: 'UTC' });
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <DateRangePicker onDateChange={handleDateChange} />
        
        {/* 🔥 Información de fechas seleccionadas */}
        {dateRange.startDate && dateRange.endDate && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-lg font-semibold text-blue-800 mb-2">Período Seleccionado:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-700">
              <p>
                <span className="font-medium">Inicio:</span><br />
                {formatDate(dateRange.startDate)}
              </p>
              <p>
                <span className="font-medium">Fin:</span><br />
                {formatDate(dateRange.endDate)}
              </p>
              <p>
                <span className="font-medium">Días Hábiles:</span><br />
                <span className="text-2xl font-bold text-green-600">{diasHabiles}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// --- COMPONENTE ESPECIALIZADO DE CALENDARIO ---
const DateRangePicker = ({ onDateChange }: DateRangePickerProps) => {
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
    console.log('🔄 useEffect ejecutándose - dates:', dates, 'holidays length:', holidays.length);
    
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      const [startDate, endDate] = dates;
      console.log('📅 Calculando días hábiles para:', startDate, 'a', endDate);
      
      const holidaySet = new Set(holidays.map(h => {
        const dateStr = h.date.getFullYear() + '-' + 
          String(h.date.getMonth() + 1).padStart(2, '0') + '-' + 
          String(h.date.getDate()).padStart(2, '0');
        console.log('🚫 Feriado para bloquear:', h.name, dateStr);
        return dateStr;
      }));
      console.log('🚫 Feriados bloqueados:', Array.from(holidaySet));
      
      let count = 0;
      const currentDate = new Date(startDate.getTime());

      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay(); // Cambiado de getUTCDay() a getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        const currentDateStr = currentDate.getFullYear() + '-' + 
          String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
          String(currentDate.getDate()).padStart(2, '0');
        
        const isHoliday = holidaySet.has(currentDateStr);
        
        console.log('📆 Evaluando:', currentDateStr, 'Weekend:', isWeekend, 'Holiday:', isHoliday);

        if (!isWeekend && !isHoliday) {
          count++;
        }
        currentDate.setDate(currentDate.getDate() + 1); // Cambiado de setUTCDate() a setDate()
      }
      
      console.log('💼 Días hábiles calculados:', count);
      setBusinessDays(count);
      
      // 🔥 NUEVO: Notificar al componente padre con días hábiles
      onDateChange(startDate, endDate, count);
    } else {
      console.log('❌ Limpiando selección - dates válidas:', !!dates);
      setBusinessDays(0);
      
      // 🔥 NUEVO: Notificar al componente padre
      onDateChange(null, null, 0);
    }
  }, [dates, holidays]);

  const disabledDates = holidays.map(h => h.date);
  
  const dateTemplate = (dateMeta: { year: number, month: number, day: number, today: boolean, selectable: boolean }) => {
    const currentRenderDate = new Date(dateMeta.year, dateMeta.month, dateMeta.day); // Cambiado a fecha local
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
      console.log('🎨 Renderizando feriado:', dateString, holiday.name);
      return (
        <strong style={{ textDecoration: 'line-through', color: 'red' }} title={holiday.name}>
          {dateMeta.day}
        </strong>
      );
    }
    return dateMeta.day;
  };
  
  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Fecha local
  const maxDate = new Date(today.getFullYear(), 11, 31); // Fecha local
  
  const handleClearSelection = () => {
    console.log('🧹 Limpiando selección');
    setDates(null);
  };

  // Corregido: Handler para el evento del calendario
  const handleCalendarChange = (e: any) => {
    console.log('🎯 Calendar change event:', e.value);
    console.log('📊 Tipo de valor:', typeof e.value, 'Es array:', Array.isArray(e.value));
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
        <button
          onClick={handleClearSelection}
          className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={!dates}
        >
          Limpiar selección
        </button>
      </div>
      {businessDays > 0 && (
        <div className="mt-4 text-center">
          <p className="text-xl font-semibold text-green-700 bg-green-100 p-3 rounded-lg">
            Días hábiles seleccionados: <span className="text-2xl">{businessDays}</span>
          </p>
        </div>
      )}
    </div>
  );
};