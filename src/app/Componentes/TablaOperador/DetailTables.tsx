import {InfoCard, HoursDisplay} from "@/app/util/UiRRHH"
import { User, Briefcase, Clock, Building,  Calendar as CalendarIcon, CheckCircle, Phone, Home,Cake,AtSign,Handshake,CopyCheck,ChartColumnStacked } from 'lucide-react';
import {  Employee, Licenses,LicenseHistory, Permit, EmploymentStatus} from '@/app/Interfas/Interfaces';
import { Pagination} from '@/app/Componentes/Pagination/pagination';
import { useState } from "react";
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
interface LicenseHistoryTabProps {
  licenses: Licenses;
  onRowClick: (license: LicenseHistory) => void;
}
export const ProfileTab = ({ employee }: { employee: Employee }) => {
 const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    position: employee.condicionLaboral.position,
    scheduleStart: employee.horario.horaInicio,
    scheduleEnd: employee.horario.horaFin,
    employmentStatus: employee.condicionLaboral.tipoContrato,
     startDate: employee.condicionLaboral?.fechaIngreso
  ? new Date(employee.condicionLaboral.fechaIngreso)
  : null,
    permanentDate: employee.condicionLaboral.fechaPlanta ? new Date(employee.condicionLaboral.fechaPlanta) : null,
    category: employee.condicionLaboral.categoria,
    lastCategoryUpdate: employee.condicionLaboral.fechaCategoria ? new Date(employee.condicionLaboral.fechaCategoria) : null
  });
   const handleSave = () => {
    // Aquí implementarías la lógica para guardar los cambios
    console.log('Datos guardados:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      position: employee.condicionLaboral.position,
    scheduleStart: employee.horario.horaInicio,
    scheduleEnd: employee.horario.horaFin,
    employmentStatus: employee.condicionLaboral.tipoContrato,
    startDate: employee.condicionLaboral?.fechaIngreso
  ? new Date(employee.condicionLaboral.fechaIngreso)
  : null,

    permanentDate: employee.condicionLaboral.fechaPlanta ? new Date(employee.condicionLaboral.fechaPlanta) : null,
    category: employee.condicionLaboral.categoria,
    lastCategoryUpdate: employee.condicionLaboral.fechaCategoria ? new Date(employee.condicionLaboral.fechaCategoria) : null
    });
    setIsEditing(false);
  };

const formatDate = (date: Date| null) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

  const getEmploymentStatusLabel = (status: EmploymentStatus) => {
    const labels = {
      permanent: 'Planta Permanente',
      contract: 'Contratado',
      temporary: 'Temporal'
    };
    const key = status as keyof typeof labels;
    return labels[key] || status;
  };

  const employmentStatusOptions = [
    { label: 'Planta Permanente', value: 'permanent' as EmploymentStatus },
    { label: 'Contratado', value: 'contract' as EmploymentStatus },
    { label: 'Temporal', value: 'temporary' as EmploymentStatus }
  ];


  const positionOptions = [
    { label: 'Desarrollador Senior', value: 'Desarrollador Senior' },
    { label: 'Desarrollador Junior', value: 'Desarrollador Junior' },
    { label: 'Analista', value: 'Analista' },
    { label: 'Gerente', value: 'Gerente' },
    { label: 'Coordinador', value: 'Coordinador' },
    { label: 'Director', value: 'Director' },
    { label: 'Especialista', value: 'Especialista' }
  ];
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
            Datos Personales
          </h3>
          <div className="space-y-4">
            <InfoCard icon={Phone} title="Teléfono">
              {employee.phone}
            </InfoCard>
            <InfoCard icon={Home} title="Domicilio">
              {employee.address}
            </InfoCard>
            <InfoCard icon={Cake} title="Fecha de Nacimiento">
               {formatDate(employee.birthDate)}
            </InfoCard>
            <InfoCard icon={AtSign} title="Email">
              {employee.email}
            </InfoCard>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-lg font-bold text-gray-800">
              Condición Laboral
            </h3>
            {!isEditing && (
              <Button 
                icon="pi pi-pencil" 
                className="p-button-text p-button-sm"
                onClick={() => setIsEditing(true)}
                style={{ color: '#2563eb' }}
              />
            )}
          </div>
          <div className="space-y-4">
            <InfoCard icon={Handshake} title="Tipo de Contrato">
              {isEditing ? (
                <Dropdown 
                  value={formData.employmentStatus}
                  options={employmentStatusOptions}
                  onChange={(e) => setFormData({...formData, employmentStatus: e.value})}
                  className="w-full"
                />
              ) : (
                getEmploymentStatusLabel(formData.employmentStatus)
              )}
            </InfoCard>
            
            <InfoCard icon={CalendarIcon} title="Fecha de Ingreso">
              {isEditing ? (
                <Calendar 
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.value as Date})}
                  dateFormat="yy-mm-dd"
                  className="w-full"
                />
              ) : (
                formatDate(formData.startDate)
              )}
            </InfoCard>
            
            {( employee.condicionLaboral.fechaPlanta || isEditing) && (
              <InfoCard icon={CheckCircle} title="Ingreso a Planta">
                {isEditing ? (
                  <Calendar 
                    value={formData.permanentDate}
                    onChange={(e) => setFormData({...formData, permanentDate: e.value as Date})}
                    dateFormat="yy-mm-dd"
                    className="w-full"
                  />
                ) : (
                  formatDate(formData.permanentDate)
                )}
              </InfoCard>
            )}
            
            <InfoCard icon={User} title="Categoría">
              {isEditing ? (
                <InputText 
                  value={formData.category ?? ''}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-inputtext-sm"
                />
              ) : (
                formData.category || ''
              )}
            </InfoCard>
            
            <InfoCard icon={CopyCheck} title="Ultima Recategorización">
              {isEditing ? (
                <Calendar 
                  value={formData.lastCategoryUpdate}
                  onChange={(e) => setFormData({...formData, lastCategoryUpdate: e.value as Date})}
                  dateFormat="yy-mm-dd"
                  className="w-full"
                />
              ) : (
                formatDate(formData.lastCategoryUpdate)
              )}
            </InfoCard>
          </div>
          
          {isEditing && (
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button 
                label="Guardar" 
                icon="pi pi-check" 
                className="p-button-sm p-button-success flex-1"
                onClick={handleSave}
              />
              <Button 
                label="Cancelar" 
                icon="pi pi-times" 
                className="p-button-sm p-button-secondary flex-1"
                onClick={handleCancel}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
            Detalles Adicionales
          </h3>
          <div className="space-y-4">
            <InfoCard icon={Briefcase} title="Posición">
              {isEditing ? (
                <Dropdown 
                  value={formData.position}
                  options={positionOptions}
                  onChange={(e) => setFormData({...formData, position: e.value})}
                  className="w-full"
                  editable
                />
              ) : (
                formData.position
              )}
            </InfoCard>
            
       <InfoCard icon={Building} title="Departamento / Supervisor">
        {employee.department?.nombre ?? "Sin departamento"} - {employee.office?.nombre ?? "Sin oficina"} / {employee.manager?.name ?? "Sin supervisor"}
        </InfoCard>

            
            <InfoCard icon={Clock} title="Horario Laboral">
              {isEditing ? (
                <div className="flex gap-2 items-center">
                  <InputText 
                    value={formData.scheduleStart}
                    onChange={(e) => setFormData({...formData, scheduleStart: e.target.value})}
                    placeholder="09:00"
                    className="flex-1 p-inputtext-sm"
                  />
                  <span>-</span>
                  <InputText 
                    value={formData.scheduleEnd}
                    onChange={(e) => setFormData({...formData, scheduleEnd: e.target.value})}
                    placeholder="18:00"
                    className="flex-1 p-inputtext-sm"
                  />
                </div>
              ) : (
                `${formData.scheduleStart} - ${formData.scheduleEnd}`
              )}
            </InfoCard>
            
            <InfoCard icon={ChartColumnStacked} title="Productividad">
              {employee.productivityScore} Promedio
            </InfoCard>
          </div>
        </div>
      </div>
    </div>
  );
};
export const LicenseHistoryTab = ({ licenses, onRowClick }: LicenseHistoryTabProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll suave hacia arriba al cambiar de página
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cálculos de paginación
const aprobaciones = Array.isArray(licenses)
  ? licenses.flatMap(l => l.aprobaciones || [])
  : []
const totalItems = aprobaciones.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = aprobaciones.slice(startIndex, endIndex);

  return (
    <div className="mt-4 flow-root">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    Tipo
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Inicio
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Fin
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Duración
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((lic: LicenseHistory) => (
                  <tr
                    key={lic.id}
                    onClick={() => onRowClick(lic)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {lic.type}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {lic.startDate}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {lic.endDate}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {lic.duration} días
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          lic.status === "Aprobada"
                            ? "bg-green-100 text-green-800"
                            : lic.status === "Rechazada"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {lic.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {totalItems === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No hay historial de licencias.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Mostrar información de paginación y el componente solo si hay datos */}
            {totalItems > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
                <Pagination
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PermissionHistoryTab = ({ permisos }: { permisos: Permit[] }) => (
  <div className="mt-4 flow-root">
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Hora Salida
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Hora Retorno
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Horas Adeudadas
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {Array.isArray(permisos) && permisos.length > 0 ? (
    permisos.map((p, index) => (
      <tr key={p.id ?? index}>
        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
          {p.date ?? "Sin fecha"}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {p.exitTime ?? "—"}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {p.returnTime ?? "—"}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          <HoursDisplay hours={p.hours ?? 0} />
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td
        colSpan={4}
        className="text-center text-sm text-gray-500 py-4"
      >
        No hay permisos registrados
      </td>
    </tr>
  )}
              
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
