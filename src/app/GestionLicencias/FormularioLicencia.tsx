"use client";
import { Button } from '../Componentes/Buttom';
import { Card } from '../Componentes/Card';
import React, { useState, useEffect, useMemo } from 'react';
import { Send } from 'lucide-react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';


// ✅ Registrar idioma español
registerLocale('es', es);

export default function RequestForm({ saldos, supervisores, userData, onCancel, onSubmit }) {
  const [fecha, setFecha] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const initialDias = saldos.reduce((acc, saldo) => ({
    ...acc,
    [saldo.anio]: { Licencias: 0, Particulares: 0, Articulos: 0, Examen: 0 }
  }), {});
  const [solicitudDias, setSolicitudDias] = useState(initialDias);
  const [supervisorId, setSupervisorId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const f = new Date().toLocaleDateString('es-AR');
    setFecha(f);
  }, []);

  const diasHabilesSeleccionados = useMemo(() => {
    if (!startDate || !endDate) return 0;
    let count = 0;
    const d = new Date(startDate);
    while (d <= endDate) {
      if (d.getDay() % 6 !== 0) count++;
      d.setDate(d.getDate() + 1);
    }
    return count;
  }, [startDate, endDate]);

  const totalDiasSolicitados = useMemo(() =>
    Object.values(solicitudDias).flatMap(Object.values).reduce((a, b) => a + b, 0),
    [solicitudDias]
  );

  const mensaje = useMemo(() => {
    if (diasHabilesSeleccionados > 0 && totalDiasSolicitados === diasHabilesSeleccionados && supervisorId) {
      const supervisor = supervisores.find(s => s.id === supervisorId);
      const tiposDetalle = Object.entries(solicitudDias).map(([anio, tipos]) => {
        const detallesAnio = Object.entries(tipos)
          .filter(([, dias]) => dias > 0)
          .map(([tipo, dias]) => `- ${tipo} ${anio}: ${dias} día(s)`)
          .join('\n');
        return detallesAnio;
      }).filter(Boolean).join('\n');
      return `Estimado/a ${supervisor?.nombreCompleto || ''},\n\nSolicito autorización para tomar licencia desde el ${startDate.toLocaleDateString()} hasta el ${endDate.toLocaleDateString()}, por un total de ${diasHabilesSeleccionados} días hábiles.\n\n${tiposDetalle}\n\nAtentamente,\n${userData.nombreCompleto}`;
    }
    return '';
  }, [diasHabilesSeleccionados, totalDiasSolicitados, supervisorId, startDate, endDate, solicitudDias, userData, supervisores]);

  const handleDiasChange = (anio, tipo, valor) => {
    const numValor = Number(valor);
    const saldoAnual = saldos.find(s => s.anio === anio);
    if (saldoAnual && numValor >= 0 && numValor <= saldoAnual[tipo]) {
      setSolicitudDias(prev => ({
        ...prev,
        [anio]: { ...prev[anio], [tipo]: numValor }
      }));
    }
  };

  const handleSubmit = () => {
    if (totalDiasSolicitados !== diasHabilesSeleccionados) {
      setError(`El total de días asignados (${totalDiasSolicitados}) no coincide con los días hábiles del calendario (${diasHabilesSeleccionados}).`);
      return;
    }
    if (!supervisorId) {
      setError('Debes seleccionar un supervisor.');
      return;
    }
    onSubmit({
      id: `sol-${fecha}`,
      solicitanteId: userData.id,
      solicitanteNombre: userData.nombreCompleto,
      supervisorId,
      fechaDesde: startDate.toISOString(),
      fechaHasta: endDate.toISOString(),
      diasHabiles: diasHabilesSeleccionados,
      tiposLicencia: JSON.parse(JSON.stringify(solicitudDias)),
      mensaje,
      estado: 'Pendiente',
      createdAt: fecha
    });
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Crear Nueva Solicitud</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-2">1. Selecciona el rango de fechas</h3>
            <ReactDatePicker
              selected={startDate}
              onChange={([s, e]) => {
                setStartDate(s);
                setEndDate(e);
              }}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              inline
              minDate={new Date()}
              filterDate={d => d.getDay() % 6 !== 0}
              locale="es"
            />
            {diasHabilesSeleccionados > 0 && (
              <p className="mt-2 text-center font-semibold text-blue-600">
                Días hábiles seleccionados: {diasHabilesSeleccionados}
              </p>
            )}
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">2. Asigna los días por tipo</h3>
            <div className="space-y-4">
              {saldos.map(saldo => (
                <details key={saldo.anio} open>
                  <summary className="font-semibold cursor-pointer">Año {saldo.anio}</summary>
                  <div className="pl-4 pt-2 space-y-4">
                    {Object.keys(saldo).filter(k => k !== 'anio').map(tipo => {
                      const consumidos = solicitudDias[saldo.anio]?.[tipo] ?? 0;
                      const total = saldo[tipo];
                      const porcentaje = total > 0 ? (consumidos / total) * 100 : 0;
                      return (
                        <div key={tipo}>
                          <div className="flex justify-between items-center mb-1">
                            <label htmlFor={`${tipo}-${saldo.anio}`} className="font-semibold">{tipo}</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                id={`${tipo}-${saldo.anio}`}
                                value={consumidos}
                                onChange={e => handleDiasChange(saldo.anio, tipo, e.target.value)}
                                className="w-16 p-1 border rounded text-center"
                                min="0"
                                max={total}
                              />
                              <span className="text-sm text-gray-600 font-medium w-12 text-right">
                                {consumidos}/{total}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${porcentaje}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </details>
              ))}
            </div>
            <p className="mt-2 text-center font-semibold text-blue-600">
              Total de días asignados: {totalDiasSolicitados}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-2">3. Selecciona tu supervisor</h3>
            <select
              value={supervisorId}
              onChange={e => setSupervisorId(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white"
            >
              <option value="" disabled>-- Elige un supervisor --</option>
              {supervisores.map(sup => (
                <option key={sup.id} value={sup.id}>{sup.nombreCompleto}</option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">4. Mensaje para tu supervisor</h3>
            <textarea
              rows="15"
              className="w-full p-2 border rounded-lg bg-gray-50 font-mono text-sm"
              value={mensaje}
              readOnly
              placeholder="Completa los pasos anteriores..."
            />
          </div>
        </div>
      </div>

      {error && <p className="text-red-600 font-bold text-center mt-6">{error}</p>}

      <div className="mt-8 flex justify-end gap-4">
        <Button onClick={onCancel} variant="secondary">Cancelar</Button>
        <Button onClick={handleSubmit} disabled={!mensaje}><Send size={18} /> Enviar Solicitud</Button>
      </div>
    </Card>
  );
};
