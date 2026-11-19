// Nota de autorización de licencia para Personal Contratado, según el
// modelo provisto por RRHH (plantilla "SAN JUAN, día de mes del año").
// A diferencia de la plantilla de vacaciones (planta permanente), esta nota
// va dirigida al jefe superior del supervisor directo -- el superior
// "siempre es el que está más arriba del jefe inmediato", no el aprobador
// que el sistema asigna automáticamente.

export interface PlantillaLicenciaContratoParams {
  empleado: string;
  dni: string;
  oficina: string;
  jefeSuperior: string;
  areaJefeSuperior: string;
  desde: Date;
  hasta: Date;
  dias: number;
  tipoLicencia: string; // 'Particular' hace que la nota diga "particular" en vez de "licencia"
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** Días hábiles (lunes a viernes) entre dos fechas, ambas inclusive. */
function diasHabilesEntre(desde: Date, hasta: Date): Date[] {
  const dias: Date[] = [];
  const cursor = new Date(desde);
  while (cursor <= hasta) {
    const diaSemana = cursor.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) dias.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dias;
}

/** "el día 20 de noviembre" / "los días 20 y 23 de noviembre" / "los días 20, 23 y 24 de noviembre" */
function listarDias(dias: Date[]): string {
  const mismoMes = dias.every(d => d.getMonth() === dias[0].getMonth() && d.getFullYear() === dias[0].getFullYear());
  const partes = dias.map(d => mismoMes ? `${d.getDate()}` : `${d.getDate()} de ${MESES[d.getMonth()]}`);
  const listado = partes.length === 1
    ? partes[0]
    : `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`;
  const prefijo = dias.length === 1 ? 'el día' : 'los días';
  return mismoMes ? `${prefijo} ${listado} de ${MESES[dias[0].getMonth()]}` : `${prefijo} ${listado}`;
}

/** Más de 3 días: en vez de enumerar cada día hábil, se da el rango completo. */
function rangoFechas(desde: Date, hasta: Date): string {
  const mismoMes = desde.getMonth() === hasta.getMonth() && desde.getFullYear() === hasta.getFullYear();
  return mismoMes
    ? `del ${desde.getDate()} al ${hasta.getDate()} de ${MESES[desde.getMonth()]}`
    : `desde el ${desde.getDate()} de ${MESES[desde.getMonth()]} hasta el ${hasta.getDate()} de ${MESES[hasta.getMonth()]}`;
}

export function generarPlantillaLicenciaContrato({
  empleado,
  dni,
  oficina,
  jefeSuperior,
  areaJefeSuperior,
  desde,
  hasta,
  dias,
  tipoLicencia,
}: PlantillaLicenciaContratoParams): string {
  const hoy = new Date();
  const diaHoy = hoy.getDate();
  const mesHoy = MESES[hoy.getMonth()];
  const anioHoy = hoy.getFullYear();

  const esParticular = tipoLicencia.toLowerCase().includes('particular');
  const motivo = esParticular ? 'particular' : 'licencia';

  const anioLicencia = desde.getFullYear();
  const esAnioCorriente = anioLicencia === anioHoy;

  // Se listan los días hábiles reales (salteando fines de semana), no solo
  // el inicio y el fin -- si cae un fin de semana en el medio, los días
  // efectivamente tomados no son consecutivos. Para rangos largos (más de 3
  // días hábiles) se usa un rango simple en vez de enumerarlos todos.
  const habiles = diasHabilesEntre(desde, hasta);
  const tramoFechas = habiles.length > 0 && habiles.length <= 3
    ? listarDias(habiles)
    : rangoFechas(desde, hasta);

  return `                                                       SAN JUAN ${diaHoy} DE ${mesHoy.toUpperCase()} DEL ${anioHoy}.-



${jefeSuperior}
${areaJefeSuperior}

Quien suscribe; ${empleado}, DNI: ${dni}, que se desempeña en el ${oficina} como Personal Contratado solicita la autorización de ${dias} días de ${motivo} correspondiente al año ${anioLicencia} ${tramoFechas} del ${esAnioCorriente ? 'corriente' : 'siguiente'} año.

Sin otro particular, la saluda atentamente.-`;
}
