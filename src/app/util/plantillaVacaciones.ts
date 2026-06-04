export interface PlantillaParams {
  empleado?: string;
  dni?: string;
  supervisor?: string;
  desde?: string;
  hasta?: string;
  dias?: string | number;
  // Punto 3: agregar cuando veas la estructura de saldos
  anioActual?: number;
  diasTotalesAnioActual?: number;
  licenciasAdeudadas?: { anio: number; dias: number }[];
  totalDiasSaldo?: number;
}

export function generarPlantillaVacaciones({
  empleado, dni, supervisor, desde, hasta, dias,
  anioActual,
  diasTotalesAnioActual,
  licenciasAdeudadas = [],
  totalDiasSaldo,
}: PlantillaParams = {}): string {
  console.log("empleado", empleado);
  console.log("dni", dni);
  console.log("supervisor", supervisor);
  console.log("desde", desde);
  console.log("hasta", hasta);
  console.log("dias", dias);
  console.log("anioActual", anioActual);
  console.log("diasTotalesAnioActual", diasTotalesAnioActual);
  console.log("licenciasAdeudadas", licenciasAdeudadas);
  console.log("totalDiasSaldo", totalDiasSaldo);
  const d = (n: number) => '.'.repeat(n);

  const today = new Date();
  const diaHoy = today.getDate().toString().padStart(2, '0');
  const mesHoy = today.toLocaleDateString('es-AR', { month: 'long' });
  const anioHoy = today.getFullYear();

  const emp = empleado || d(50);
  const dniV = dni || d(15);
  const sup = supervisor || d(50);
  const dsd = desde || '...../...../…';
  const hst = hasta || '......./......./…';
  const dias_ = dias?.toString() || d(10);

  // ── Punto 3: Sección INTERVENCIÓN OFICINA DE PERSONAL ──
  const anioLic = anioActual ?? anioHoy;
  const diasTotales = diasTotalesAnioActual !== undefined ? diasTotalesAnioActual.toString() : d(10);
  const totalDias = totalDiasSaldo !== undefined ? totalDiasSaldo.toString() : d(10);

  // Líneas de licencias adeudadas (una por año anterior con saldo)
  const lineasAdeudadas = licenciasAdeudadas.length > 0
    ? licenciasAdeudadas
      .map(l => `Año: ${l.anio}          Días restantes: ${l.dias}`)
      .join('\n')
    : `Año: ${d(4)}          Días restantes: ${d(4)}`;

  return `                 SAN JUAN, ${diaHoy} de ${mesHoy} de ${anioHoy}

SEÑOR/A:

S_______/________D

El/La Sr/a. ${emp},
D.N.I. N° ${dniV}, tiene el agrado de dirigirse a
Ud., a fin de solicitarle tenga a bien concederle licencia anual
reglamentaria desde el ${dsd} al ${hst}
conforme a lo dispuesto por el Artículo 3° de la Ley 6698.

Saludo a Ud. atentamente.


..................................................
              Firma del Solicitante
              ${emp}

CONFORMIDAD DEL JEFE INMEDIATO: ${sup}

────────────────────────────────────────────────────────────────
INTERVENCIÓN OFICINA DE PERSONAL:

Licencia anual año: ${anioLic}          Total de días que corresponden: ${diasTotales}

${lineasAdeudadas}

Total de días: ${totalDias}

FECHA:

.................................................. Firma y Sello responsable de Personal

────────────────────────────────────────────────────────────────
RESOLUCIÓN N°:

SAN JUAN,

VISTO Y CONSIDERANDO: La solicitud de licencia anual reglamentaria que antecede.

POR ELLO:

RESUELVE

ARTÍCULO 1°: Otórgase / Deniégase por razones de servicio, al agente dependiente
de este Organismo,

Sr./Sra. ${emp}

${dias_} días de la licencia anual reglamentaria correspondiente al/los año/s ..................

a partir de ${dsd}, conforme a lo establecido en los Artículos 3°, 4° y 5°
de la Ley N° 6698.

ARTÍCULO 2°: Téngase por Resolución de ........................................................................

Notifíquese al interesado, tome conocimiento la Oficina de Personal, archívese.

Notificación:`;
}