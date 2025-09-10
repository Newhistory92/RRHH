import { OrgData, OrgNode, OrgStatsType, NodeColors } from '@/app/Interfas/Interfaces';
import { NODE_COLORS, DEFAULT_NODE_COLOR, LEVEL_LABELS, NODE_COLORS2, DEFAULT_NODE_COLOR2 } from '@/app/Componentes/OrganigramaGraf/orgChart.constants';

export class OrgChartUtils {
  static buildHierarchy(data: OrgData[]): OrgNode[] {
    const nodeMap = new Map<number, OrgNode>();
    const roots: OrgNode[] = [];

    // Crear mapa de nodos
    data.forEach(item => {
      nodeMap.set(item.id, { ...item, children: [] });
    });

    // Construir jerarquía
    data.forEach(item => {
      const node = nodeMap.get(item.id)!;
      
      if (item.jefeId === null) {
        roots.push(node);
      } else {
        const parent = nodeMap.get(item.jefeId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        }
      }
    });

    // Ordenar recursivamente
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