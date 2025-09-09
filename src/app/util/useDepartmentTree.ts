import { useEffect, useMemo, useState } from 'react';
import { TreeNode } from 'primereact/treenode';
import type { Department } from '@/app/Interfas/Interfaces';

export const useDepartmentTree = (departmentsData: Department[], selectedDepartment: Department | null) => {
  const [expandedKeys, setExpandedKeys] = useState<{ [key: string]: boolean }>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const buildDepartmentTree = (departments: Department[]): TreeNode[] => {
    const departmentMap = new Map<number, TreeNode>();
    const roots: TreeNode[] = [];

    // Crear todos los nodos
    departments.forEach(dept => {
      const node: TreeNode = {
        key: dept.id.toString(),
        label: dept.nombre,
        data: dept,
        children: []
      };
      departmentMap.set(dept.id, node);
    });

    // Construir jerarquía
    departments.forEach(dept => {
      const node = departmentMap.get(dept.id);
      if (dept.parentId && departmentMap.has(dept.parentId)) {
        const parent = departmentMap.get(dept.parentId);
        parent!.children = parent!.children || [];
        parent!.children.push(node!);
      } else {
        roots.push(node!);
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