import React, { useState, useEffect } from 'react';
import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';



// export default  function DateRangePicker({ onDateChange }) {
//   // Estado para el rango de fechas [startDate, endDate]
//   const [dates, setDates] = useState(null);
  
//   // Estado para almacenar los feriados obtenidos de la API
//   const [holidays, setHolidays] = useState([]);
  
//   // Estado para la cantidad de días hábiles calculados
//   const [businessDays, setBusinessDays] = useState(0);

//   // 1. Configuración del idioma español para el calendario de PrimeReact
//   addLocale('es', {
//     firstDayOfWeek: 1,
//     dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
//     dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
//     dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
//     monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
//     monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
//     today: 'Hoy',
//     clear: 'Limpiar',
//   });

//   // 2. useEffect para obtener los feriados de la API al montar el componente
//   useEffect(() => {
//     const fetchHolidays = async () => {
//       const year = new Date().getFullYear();
//       try {
//         const response = await fetch(`https://api.argentinadatos.com/v1/feriados/${year}`);
//         if (!response.ok) {
//           throw new Error('No se pudieron obtener los feriados.');
//         }
//         const data = await response.json();
//         console.log(data)
//         // Mapeamos los datos para tener un objeto Date y el nombre del feriado
//         const formattedHolidays = data.map(holiday => {
//           // Importante: Crear la fecha en UTC para evitar problemas de zona horaria
//           const dateParts = holiday.fecha.split('-').map(Number);
//           return {
//             date: new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2])),
//             name: holiday.nombre
//           };
//         });
//         setHolidays(formattedHolidays);
//       } catch (error) {
//         console.error("Error al obtener feriados:", error);
//       }
//     };

//     fetchHolidays();
//   }, []);

//   // 3. useEffect para calcular los días hábiles cuando el rango de fechas cambia
//   useEffect(() => {
//     if (dates && dates[0] && dates[1]) {
//       const [startDate, endDate] = dates;
      
//       // Se crea un Set con las fechas de los feriados en formato 'YYYY-MM-DD' para una búsqueda rápida
//       const holidaySet = new Set(
//         holidays.map(h => h.date.toISOString().split('T')[0])
//       );
      
//       let count = 0;
//       const currentDate = new Date(startDate.getTime());

//       while (currentDate <= endDate) {
//         const dayOfWeek = currentDate.getDay();
//         const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
//         // Creamos una copia UTC para comparar con el Set de feriados
//         const utcCurrentDate = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
//         const isHoliday = holidaySet.has(utcCurrentDate.toISOString().split('T')[0]);

//         if (!isWeekend && !isHoliday) {
//           count++;
//         }
//         currentDate.setDate(currentDate.getDate() + 1);
//       }
      
//       setBusinessDays(count);
      
//       // Llamamos a la función del padre para pasarle las fechas
//       if (onDateChange) {
//         onDateChange(startDate, endDate);
//       }
//     } else {
//         // Si se limpia la selección, reseteamos todo
//         setBusinessDays(0);
//         if (onDateChange) {
//             onDateChange(null, null);
//         }
//     }
//   }, [dates, holidays, onDateChange]);

//   // 4. Fechas deshabilitadas: solo los feriados. Los fines de semana se manejan con `disabledDays`
//   const disabledDates = holidays.map(h => h.date);
  
//   // 5. Plantilla para cada celda de fecha: permite agregar el tooltip en los feriados
//   const dateTemplate = (date) => {
//     const dateString = new Date(Date.UTC(date.year, date.month, date.day)).toISOString().split('T')[0];
    
//     const holiday = holidays.find(h => h.date.toISOString().split('T')[0] === dateString);

//     if (holiday) {
//       return (
//         <strong style={{ textDecoration: 'line-through' }} title={holiday.name}>
//           {date.day}
//         </strong>
//       );
//     }
    
//     // Si es fin de semana, PrimeReact ya lo atenúa, pero podríamos agregar estilos si quisiéramos
//     if (date.weekend) {
//         // return <span style={{ color: '#ccc' }}>{date.day}</span>;
//     }

//     return date.day;
//   };

//   return (
//     <div className="flex flex-col items-center">
//       <Calendar
//         value={dates}
//         onChange={(e) => setDates(e.value)}
//         selectionMode="range"
//         readOnlyInput
//         inline
//         locale="es"
//         // Bloquea Sábados (6) y Domingos (0)
//         disabledDays={[0, 6]} 
//         // Bloquea las fechas específicas de feriados
//         disabledDates={disabledDates}
//         // Aplica la plantilla para mostrar tooltips
//         dateTemplate={dateTemplate} 
//         className="w-full md:w-auto"
//         panelClassName="rounded-lg shadow-md"
//       />
//       <div className="mt-6 text-center">
//         {businessDays > 0 && (
//           <p className="text-xl font-semibold text-green-700 bg-green-100 p-3 rounded-lg">
//             Días hábiles seleccionados: <span className="text-2xl">{businessDays}</span>
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };





// Los imports de CSS se eliminan de aquí y se manejarán dinámicamente.

// Componente principal que utiliza el DateRangePicker
export default function Calendario() {
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });




  // Esta función se pasará como prop al DateRangePicker
  // para recibir las fechas seleccionadas.
  const handleDateChange = (startDate, endDate) => {
    setDateRange({ startDate, endDate });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">
            Selector de Rango de Fechas
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Selecciona un período y calcularemos los días hábiles, excluyendo fines de semana y feriados de Argentina.
          </p>
          
          <DateRangePicker onDateChange={handleDateChange} />
          
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <h2 className="text-lg font-semibold text-blue-800">Fechas recibidas en el Componente Padre:</h2>
            <p className="text-blue-700 mt-2">
              <span className="font-medium">Inicio:</span> {formatDate(dateRange.startDate)}
            </p>
            <p className="text-blue-700">
              <span className="font-medium">Fin:</span> {formatDate(dateRange.endDate)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


// --- COMPONENTE ESPECIALIZADO DE CALENDARIO ---

const DateRangePicker = ({ onDateChange }) => {
  // Estado para el rango de fechas [startDate, endDate]
  const [dates, setDates] = useState(null);
  
  // Estado para almacenar los feriados obtenidos de la API
  const [holidays, setHolidays] = useState([]);
  
  // Estado para la cantidad de días hábiles calculados
  const [businessDays, setBusinessDays] = useState(0);

  // 1. Configuración del idioma español para el calendario de PrimeReact
  addLocale('es', {
    firstDayOfWeek: 1,
    dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
    today: 'Hoy',
    clear: 'Limpiar',
  });

  // 2. useEffect para obtener los feriados de la API al montar el componente
  useEffect(() => {
    const fetchHolidays = async () => {
      const year = new Date().getFullYear();
      try {
        const response = await fetch(`https://api.argentinadatos.com/v1/feriados/${year}`);
        if (!response.ok) {
          throw new Error('No se pudieron obtener los feriados.');
        }
        const data = await response.json();
        // Mapeamos los datos para tener un objeto Date y el nombre del feriado
        const formattedHolidays = data.map(holiday => {
          // Importante: Crear la fecha en UTC para evitar problemas de zona horaria
          const dateParts = holiday.fecha.split('-').map(Number);
          return {
            date: new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2])),
            name: holiday.nombre
          };
        });
        setHolidays(formattedHolidays);
      } catch (error) {
        console.error("Error al obtener feriados:", error);
      }
    };

    fetchHolidays();
  }, []);

  // 3. useEffect para calcular los días hábiles cuando el rango de fechas cambia
  useEffect(() => {
    if (dates && dates[0] && dates[1]) {
      const [startDate, endDate] = dates;
      
      // Se crea un Set con las fechas de los feriados en formato 'YYYY-MM-DD' para una búsqueda rápida
      const holidaySet = new Set(
        holidays.map(h => h.date.toISOString().split('T')[0])
      );
      
      let count = 0;
      const currentDate = new Date(startDate.getTime());

      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // Creamos una copia UTC para comparar con el Set de feriados
        const utcCurrentDate = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
        const isHoliday = holidaySet.has(utcCurrentDate.toISOString().split('T')[0]);

        if (!isWeekend && !isHoliday) {
          count++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setBusinessDays(count);
      
      // Llamamos a la función del padre para pasarle las fechas
      if (onDateChange) {
        onDateChange(startDate, endDate);
      }
    } else {
        // Si se limpia la selección, reseteamos todo
        setBusinessDays(0);
        if (onDateChange) {
            onDateChange(null, null);
        }
    }
  }, [dates, holidays, onDateChange]);

  // 4. Fechas deshabilitadas: solo los feriados. Los fines de semana se manejan con `disabledDays`
  const disabledDates = holidays.map(h => h.date);
  
  // 5. Plantilla para cada celda de fecha: permite agregar el tooltip en los feriados
  const dateTemplate = (date) => {
    const dateString = new Date(Date.UTC(date.year, date.month, date.day)).toISOString().split('T')[0];
    
    const holiday = holidays.find(h => h.date.toISOString().split('T')[0] === dateString);

    if (holiday) {
      return (
        <strong style={{ textDecoration: 'line-through' }} title={holiday.name}>
          {date.day}
        </strong>
      );
    }
    
    // Si es fin de semana, PrimeReact ya lo atenúa, pero podríamos agregar estilos si quisiéramos
    if (date.weekend) {
        // return <span style={{ color: '#ccc' }}>{date.day}</span>;
    }

    return date.day;
  };

  return (
    <div className="flex flex-col items-center">
      <Calendar
        value={dates}
        onChange={(e) => setDates(e.value)}
        selectionMode="range"
        readOnlyInput
        inline
        locale="es"
        // Bloquea Sábados (6) y Domingos (0)
        disabledDays={[0, 6]} 
        // Bloquea las fechas específicas de feriados
        disabledDates={disabledDates}
        // Aplica la plantilla para mostrar tooltips
        dateTemplate={dateTemplate} 
        className="w-full md:w-auto"
        panelClassName="rounded-lg shadow-md"
      />
      <div className="mt-6 text-center">
        {businessDays > 0 && (
          <p className="text-xl font-semibold text-green-700 bg-green-100 p-3 rounded-lg">
            Días hábiles seleccionados: <span className="text-2xl">{businessDays}</span>
          </p>
        )}
      </div>
    </div>
  );
};

