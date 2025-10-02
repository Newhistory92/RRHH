
import { Employee } from "@/app/Interfas/Interfaces";

export function groupEmployeesByDepartment(
  employees: Employee[]
): Record<string, Employee[]> {
  return employees.reduce((acc, employee) => {
    const dept = employee.department || 'Sin Departamento';
    if (!acc[dept]) {
      acc[dept] = [];
    }
    acc[dept].push(employee);
    return acc;
  }, {} as Record<string, Employee[]>);
}