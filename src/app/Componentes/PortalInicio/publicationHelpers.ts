import {
  Newspaper,
  FileText,
  Gavel,
  Wrench,
  AlertTriangle,
  CalendarDays,
  Briefcase,
  Gift,
  Users,
  type LucideIcon,
} from 'lucide-react';

export const CATEGORIA_ICONOS: Record<string, LucideIcon> = {
  'Noticia Institucional': Newspaper,
  'Circular': FileText,
  'Resolución': Gavel,
  'Mantenimiento y Reparaciones': Wrench,
  'Aviso Importante': AlertTriangle,
  'Evento Institucional': CalendarDays,
  'Oportunidad Interna': Briefcase,
  'Beneficio para Empleados': Gift,
  'Comunicación de RRHH': Users,
};

export const PRIORIDAD_CLASES: Record<string, string> = {
  Baja: 'bg-muted text-muted-foreground border-border',
  Normal: 'bg-primary/15 text-primary border-primary/30',
  Alta: 'bg-warning-soft text-warning-soft-foreground border-warning',
  Urgente: 'bg-error-soft text-error-soft-foreground border-error',
};

export function formatFechaRelativa(iso: string | null): string {
  if (!iso) return '';
  const fecha = new Date(iso);
  if (isNaN(fecha.getTime())) return '';
  const ahora = new Date();
  const diffMs = ahora.getTime() - fecha.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias === 0) return 'Hoy';
  if (diffDias === 1) return 'Ayer';
  if (diffDias > 1 && diffDias < 7) return `Hace ${diffDias} días`;
  return fecha.toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}
