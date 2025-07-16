import React from 'react';
import { Card } from '@/app/Componentes/Card';
import { mockEmployees } from '@/app/api/Prueba';
export const RecursosHumanosPage = () => (
  <div>
    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Gestión de Recursos Humanos</h2>
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-700 dark:text-gray-200">Lista de Empleados</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Añadir Empleado</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">ID</th>
              <th scope="col" className="px-6 py-3">Nombre</th>
              <th scope="col" className="px-6 py-3">Cargo</th>
              <th scope="col" className="px-6 py-3">Departamento</th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Estado</th>
              <th scope="col" className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mockEmployees.map(emp => (
              <tr key={emp.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{emp.id}</td>
                <td className="px-6 py-4">{emp.name}</td>
                <td className="px-6 py-4">{emp.position}</td>
                <td className="px-6 py-4">{emp.department}</td>
                <td className="px-6 py-4">{emp.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${emp.status === 'Activo' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                    {emp.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Editar</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);