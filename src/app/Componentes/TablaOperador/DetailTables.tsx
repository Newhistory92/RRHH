import {InfoCard, HoursDisplay} from "@/app/util/UiRRHH"
import { User, Briefcase, Clock, Building,  Calendar, CheckCircle, Phone, Home } from 'lucide-react';
import {  Employee, Licenses,LicenseHistory, Permit} from '@/app/Interfas/Interfaces';

interface LicenseHistoryTabProps {
  licenses: Licenses;
  onRowClick: (license: LicenseHistory) => void;
}
export const ProfileTab = ({ employee }: { employee: Employee }) => (


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
          <InfoCard icon={Home} title="Fecha de Nacimiento">
            {employee.birthDate}
          </InfoCard>
          <InfoCard icon={Home} title="Email">
            {employee.email}
          </InfoCard>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
          Condición Laboral
        </h3>
        <div className="space-y-4">
          <InfoCard icon={Briefcase} title="Tipo de Contrato">
            {employee.employmentStatus}
          </InfoCard>
          <InfoCard icon={Calendar} title="Fecha de Ingreso">
            {employee.startDate}
          </InfoCard>
          {employee.permanentDate && (
            <InfoCard icon={CheckCircle} title="Ingreso a Planta">
              {employee.permanentDate}
            </InfoCard>
          )}
          <InfoCard icon={User} title="Categoría">
            {employee.category}
          </InfoCard>
          <InfoCard icon={User} title="Ultima Recategorización">
            {employee.lastCategoryUpdate}
          </InfoCard>
        </div>
      </div>
    </div>
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
          Detalles Adicionales
        </h3>
        <div className="space-y-4">
          <InfoCard icon={Briefcase} title="Posición">
            {employee.position}
          </InfoCard>
          <InfoCard icon={Building} title="Departamento/ Supervisor">
            {employee.department} - {employee.office} / {employee.supervisor}
          </InfoCard>
          <InfoCard icon={Clock} title="Horario Laboral">
            {employee.schedule.startTime} - {employee.schedule.endTime}
          </InfoCard>
          <InfoCard icon={Briefcase} title="Productividad">
            {employee.productivityScore} Promedio
          </InfoCard>
        </div>
      </div>
    </div>
  </div>
);

export const LicenseHistoryTab = ({ licenses, onRowClick }: LicenseHistoryTabProps) => (
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
           {licenses.history.map((lic: LicenseHistory) => (
                <tr
                  key={lic.id}
                  onClick={() => onRowClick(lic)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    Tipo
                    {lic.type}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    Desde
                    {lic.startDate}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    Hasta
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
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No hay historial de licencias.
                  </td>
                </tr>
              )
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);


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
              {permisos.length > 0 ? (
                permisos.map((p) => (
                  <tr key={p.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {p.date}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {p.departureTime}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {p.returnTime}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <HoursDisplay hours={p.hours} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No hay historial de permisos.
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
