import { ReactNode } from 'react';
//import Image from "next/image";
interface InfoCardProps {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  children: ReactNode;
}

export const StatusBadge = ({ status }: { status: string }) => {
  const baseClasses = "px-3 py-1 text-xs font-medium rounded-full inline-block";
  const statusClasses: Record<string, string> = {
    'Activo': 'bg-green-100 text-green-800',
    'De licencia': 'bg-yellow-100 text-yellow-800',
    'Parte médico': 'bg-red-100 text-red-800',
  };
  return <span className={`${baseClasses} ${statusClasses[status] ?? 'bg-gray-100 text-gray-800'}`}>{status}</span>;
};

export const HoursDisplay = ({ hours }: { hours: number }) => {
  const classes = hours >= 0 ? 'text-blue-600' : 'text-orange-600';
  const sign = hours > 0 ? '+' : '';
  return <span className={`font-semibold ${classes}`}>{sign}{hours.toFixed(2)}hs</span>;
};

export const InfoCard = ({ icon: Icon, title, children }: InfoCardProps) => (
    <div className="bg-gray-50 rounded-lg p-4 flex items-start space-x-4 h-full">
        <Icon className="text-gray-400 mt-1 flex-shrink-0" size={20}/>
        <div>
            <h4 className="font-semibold text-gray-600">{title}</h4>
            <div className="text-gray-800 text-sm">{children}</div>
        </div>
    </div>
);


// export const EmployeeAvatar = ({ employeeId }) => {
//   const employee = EMPLOYEES_DATA.find((e) => e.id === employeeId);
//   if (!employee) return null;
//   return (
//     <div className="flex items-center" title={employee.name}>
//        <Image
//                   src={employee.photo}
//                   alt={`Foto de ${employee.name}`}
//                   width={96}
//                   height={96}
//                   className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"

//                   priority
//                 />
//       {/* <img
//          src={employee.photo}
//        alt={`Foto de ${employee.name}`}
//         className="w-8 h-8 rounded-full mr-2 border-2 border-white"
//       /> */}
//       <span className="text-gray-700 hidden sm:inline">{employee.name}</span>
//     </div>
//   );
// };