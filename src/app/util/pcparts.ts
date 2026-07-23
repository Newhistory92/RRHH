/** Convierte el JSON crudo de specs de PCParts en una descripcion legible
 * linea por linea (una entrada por clave), sin necesidad de conocer el
 * esquema especifico de cada una de las 25 categorias del dataset. */
export function formatearSpecs(specsJson: string | null): string {
  if (!specsJson) return '';
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(specsJson);
  } catch {
    return specsJson;
  }
  const etiqueta = (clave: string) =>
    clave
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  const formatearValor = (v: unknown): string | null => {
    if (v === null || v === undefined || v === '') return null;
    if (Array.isArray(v)) {
      if (v.length === 2 && typeof v[0] === 'number' && typeof v[1] === 'number') return `${v[0]} - ${v[1]}`;
      return v.map((x) => String(x)).join(', ');
    }
    if (typeof v === 'boolean') return v ? 'Sí' : 'No';
    return String(v);
  };
  return Object.entries(obj)
    .map(([clave, v]) => {
      const valor = formatearValor(v);
      return valor !== null ? `${etiqueta(clave)}: ${valor}` : null;
    })
    .filter((linea): linea is string => linea !== null)
    .join('\n');
}
