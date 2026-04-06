import { OrgData, OrgNode, OrgStatsType, NodeColors } from '@/app/Interfas/Interfaces';
import { NODE_COLORS, DEFAULT_NODE_COLOR, LEVEL_LABELS, NODE_COLORS2, DEFAULT_NODE_COLOR2 } from '@/app/Componentes/OrganigramaGraf/orgChart.constants';

export class OrgChartUtils {
  /**
   * Construye la jerarquía del organigrama.
   * 
   * Estrategia híbrida:
   * 1. Si un departamento tiene `jefeId` (parentId), se usa esa relación directa.
   * 2. Si NO tiene `jefeId`, se infiere el padre usando `nivel_jerarquico`:
   *    - Nivel 1 = raíz (directorio/gerencia general)
   *    - Nivel 2+ = se asigna como hijo del departamento de nivel inmediato superior
   * 
   * Esto garantiza que el organigrama funcione correctamente tanto con
   * parentId explícito como con departamentos que aún no lo tengan configurado.
   */
  static buildHierarchy(data: OrgData[]): OrgNode[] {
    const nodeMap = new Map<number, OrgNode>();
    const roots: OrgNode[] = [];

    // Paso 1: Crear mapa de todos los nodos
    data.forEach(item => {
      nodeMap.set(item.id, { ...item, children: [] });
    });

    // Paso 2: Ordenar por nivel jerárquico para procesar padres antes que hijos
    const sorted = [...data].sort((a, b) => a.nivel_jerarquico - b.nivel_jerarquico);

    // Paso 3: Construir jerarquía con estrategia híbrida
    sorted.forEach(item => {
      const node = nodeMap.get(item.id)!;

      // Caso A: tiene padre explícito (jefeId/parentId)
      // CORRECCIÓN: Evitar auto-referencia (id === jefeId) que causa desaparición del nodo
      if (item.jefeId !== null && item.jefeId !== undefined && item.jefeId !== item.id) {
        const parent = nodeMap.get(item.jefeId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
          return;
        }
      }

      // Caso B: es nivel 1 → siempre es raíz
      if (item.nivel_jerarquico <= 1) {
        roots.push(node);
        return;
      }

      // Caso C: no tiene padre explícito pero tiene nivel > 1
      // → Buscar el primer departamento del nivel inmediato superior como padre
      let parentFound = false;
      for (let nivelBuscado = item.nivel_jerarquico - 1; nivelBuscado >= 1; nivelBuscado--) {
        const posiblePadre = sorted.find(
          p => p.nivel_jerarquico === nivelBuscado && nodeMap.has(p.id)
        );
        if (posiblePadre) {
          const parentNode = nodeMap.get(posiblePadre.id)!;
          parentNode.children = parentNode.children || [];
          parentNode.children.push(node);
          parentFound = true;
          break;
        }
      }

      // Caso D: no se encontró ningún padre → agregar como raíz
      if (!parentFound) {
        roots.push(node);
      }
    });

    // Paso 4: Ordenar recursivamente por nivel y nombre
    this.sortHierarchy(roots);
    return roots;
  }

  private static sortHierarchy(nodes: OrgNode[]): void {
    nodes.sort((a, b) => {
      if (a.nivel_jerarquico !== b.nivel_jerarquico) {
        return a.nivel_jerarquico - b.nivel_jerarquico;
      }
      return a.nombre.localeCompare(b.nombre);
    });

    nodes.forEach(node => {
      if (node.children) {
        this.sortHierarchy(node.children);
      }
    });
  }

  static calculateStats(data: OrgData[]): OrgStatsType {
    const niveles = new Set(data.map(item => item.nivel_jerarquico));
    return {
      totalNodos: data.length,
      maxNivel: Math.max(...Array.from(niveles)),
      nivelesUnicos: Array.from(niveles).sort((a, b) => a - b)
    };
  }

 static getNodeColors(nivel: number, colorTheme: string = 'Oscuro'): NodeColors {
    if (colorTheme === 'Claro') {
      return NODE_COLORS2[nivel] || DEFAULT_NODE_COLOR2;
    }
    return NODE_COLORS[nivel] || DEFAULT_NODE_COLOR;
  }

  static getLevelLabel(nivel: number): string {
    return LEVEL_LABELS[nivel] || `Nivel ${nivel}`;
  }
}