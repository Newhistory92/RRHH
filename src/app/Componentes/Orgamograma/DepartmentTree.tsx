import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from 'primereact/button';
import { Tree, TreeSelectionEvent, TreeExpandedEvent } from 'primereact/tree';
import { Card } from 'primereact/card';
import { DepartmentTreeNode } from './DepartmentTreeNode';
import { useDepartmentTree } from '@/app/util/useDepartmentTree';
import type { Department, Office,ModalContext  } from '@/app/Interfas/Interfaces';


interface DepartmentTreeProps {
  departmentsData: Department[];
  selectedDepartment: Department | null;
  onSelect: (department: Department) => void;
  onOpenModal: (type: 'department' | 'office', data?: Department | Office | null, context?: ModalContext) => void;
}

export const DepartmentTree: React.FC<DepartmentTreeProps> = ({
  departmentsData,
  selectedDepartment,
  onSelect,
  onOpenModal
}) => {
  const {
    treeNodes,
    expandedKeys,
    selectedKey,
    setExpandedKeys,
    findDepartmentInTree
  } = useDepartmentTree(departmentsData, selectedDepartment);

  const handleSelection = (e: TreeSelectionEvent) => {
    const selectedNode = findDepartmentInTree(treeNodes, e.value as string);
    if (selectedNode && selectedNode.data) {
      onSelect(selectedNode.data);
    }
  };

  const handleToggle = (e: TreeExpandedEvent) => {
    setExpandedKeys(e.value as { [key: string]: boolean });
  };

  return (
    <Card className="h-fit">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700">Departamentos</h2>
        <Button
          icon={<PlusCircle className="w-5 h-5" />}
          onClick={() => onOpenModal("department")}
          className="p-button-rounded p-button-text"
          tooltip="Crear Nuevo Departamento"
        />
      </div>
      
      <Tree
        value={treeNodes}
        selectionMode="single"
        selectionKeys={selectedKey}
        expandedKeys={expandedKeys}
        onSelectionChange={handleSelection}
        onToggle={handleToggle}
        nodeTemplate={(node) => <DepartmentTreeNode node={node} />}
        className="w-full"
        filter
        filterPlaceholder="Buscar departamentos..."
      />
    </Card>
  );
};