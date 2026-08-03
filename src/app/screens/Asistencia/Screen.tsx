"use client";

import AsistenciaTablero from "@/app/Componentes/Asistencia/AsistenciaTablero";
import MiAsistencia from "@/app/Componentes/Asistencia/MiAsistencia";
import { ROLE_ID } from "@/app/util/rbac";

export default function AsistenciaPage({ roleId }: { roleId: number | null }) {
  return roleId === ROLE_ID.ADMIN || roleId === ROLE_ID.RRHH
    ? <AsistenciaTablero />
    : <MiAsistencia />;
}
