const LIMITES_BYTES: Record<'imagen' | 'documento' | 'video', number> = {
  imagen: 10 * 1024 * 1024,
  documento: 25 * 1024 * 1024,
  video: 200 * 1024 * 1024,
};

const EXT_A_CATEGORIA: Record<string, 'imagen' | 'documento' | 'video'> = {
  jpg: 'imagen', jpeg: 'imagen', png: 'imagen', webp: 'imagen', gif: 'imagen',
  pdf: 'documento', docx: 'documento', xlsx: 'documento', pptx: 'documento', txt: 'documento', zip: 'documento',
  mp4: 'video', webm: 'video',
};

export function validarArchivo(file: File): string | null {
  const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '';
  const categoria = EXT_A_CATEGORIA[ext];
  if (!categoria) {
    return `Tipo de archivo no permitido (.${ext || '?'})`;
  }
  const limite = LIMITES_BYTES[categoria];
  if (file.size > limite) {
    const mb = Math.round(limite / (1024 * 1024));
    return `El archivo excede el límite de ${mb} MB para ${categoria}`;
  }
  return null;
}
