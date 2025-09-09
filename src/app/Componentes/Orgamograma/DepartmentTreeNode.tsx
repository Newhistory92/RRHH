import React from 'react';
import { Building2 } from 'lucide-react';
import { TreeNode } from 'primereact/treenode';
import type { Department } from '@/app/Interfas/Interfaces';

interface DepartmentTreeNodeProps {
  node: TreeNode;
}

export const DepartmentTreeNode: React.FC<DepartmentTreeNodeProps> = ({ node }) => {
  const department = node.data as Department;
  
  return (
    <div className="flex items-center justify-between w-full p-2 min-h-[2.5rem]">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <span className="font-medium text-sm truncate flex-1 min-w-0">
          {node.label}
        </span>
        {department.jefeId && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex-shrink-0 whitespace-nowrap">
            Con jefe
          </span>
        )}
      </div>
    </div>
  );
};