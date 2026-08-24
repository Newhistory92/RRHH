"use client";

import AsistenciaTablero from "@/app/Componentes/Asistencia/AsistenciaTablero";
import MiAsistencia from "@/app/Componentes/Asistencia/MiAsistencia";

interface AsistenciaPageProps {
  puedeGestionar: boolean;
}

export default function AsistenciaPage({ puedeGestionar }: AsistenciaPageProps) {
  return puedeGestionar ? <AsistenciaTablero /> : <MiAsistencia />;
}
