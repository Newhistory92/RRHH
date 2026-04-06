import { useEffect, useMemo, useState } from 'react';
import { TreeNode } from 'primereact/treenode';
import type { Department } from '@/app/Interfas/Interfaces';

export const useDepartmentTree = (departmentsData: Department[], selectedDepartment: Department | null) => {
  const [expandedKeys, setExpandedKeys] = useState<{ [key: string]: boolean }>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const buildDepartmentTree = (departments: Department[]): TreeNode[] => {
    const departmentMap = new Map<number, TreeNode>();
    const roots: TreeNode[] = [];

    // Paso 1: Crear todos los nodos en el mapa
    departments.forEach(dept => {
      const node: TreeNode = {
        key: dept.id.toString(),
        label: dept.nombre,
        data: dept,
        children: []
      };
      departmentMap.set(dept.id, node);
    });

    // Paso 2: Construir jerarquía usando parentId real del backend
    departments.forEach(dept => {
      const node = departmentMap.get(dept.id)!;
      const parentId = dept.parentId;

      if (parentId && departmentMap.has(parentId) && parentId !== dept.id) {
        // Tiene padre → agregarlo como hijo del padre
        const parent = departmentMap.get(parentId)!;
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        // Sin padre → es un nodo raíz
        roots.push(node);
      }
    });

    return roots;
  };

  const treeNodes = useMemo(() => {
    return buildDepartmentTree(departmentsData);
  }, [departmentsData]);

  // Expandir todos los nodos inicialmente
  useEffect(() => {
    const keys: { [key: string]: boolean } = {};
    const expandAll = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        keys[node.key as string] = true;
        if (node.children) {
          expandAll(node.children);
        }
      });
    };
    expandAll(treeNodes);
    setExpandedKeys(keys);
  }, [treeNodes]);

  // Sincronizar selección
  useEffect(() => {
    if (selectedDepartment) {
      setSelectedKey(selectedDepartment.id.toString());
    } else {
      setSelectedKey(null);
    }
  }, [selectedDepartment]);

  const findDepartmentInTree = (nodes: TreeNode[], key: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.key === key) return node;
      if (node.children) {
        const found = findDepartmentInTree(node.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  return {
    treeNodes,
    expandedKeys,
    selectedKey,
    setExpandedKeys,
    findDepartmentInTree
  };
};