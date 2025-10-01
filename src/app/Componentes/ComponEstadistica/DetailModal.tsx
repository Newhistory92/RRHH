import {getScoreColor, SoftSkillBar } from '@/app/util/UiRRHH';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, } from 'recharts';
import {  X,  BarChart2, Star,  Briefcase, Calendar, MessageSquareWarning, } from 'lucide-react';
import { Card } from 'primereact/card';
import { Employee } from '@/app/Interfas/Interfaces';

export const EmployeeDetailModal: React.FC<{ employee: Employee | null; onClose: () => void }> = ({ employee, onClose }) => {
    if (!employee) return null;




return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={24} />
            </button>
            <div className="p-8">
                <div className="flex flex-col md:flex-row items-center mb-6">
                    <div className={`p-2 rounded-full ${getScoreColor(employee.productivityScore)} mr-6`}>
                        <div className="bg-white dark:bg-gray-800 rounded-full w-24 h-24 flex items-center justify-center text-3xl font-bold text-gray-800 dark:text-white">
                            {employee.productivityScore.toFixed(1)}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{employee.name}</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">{employee.department} / {employee.office}</p>
                        <p className="text-sm text-indigo-500 font-semibold">{employee.category} - {employee.status}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2" title={
                        <div className="flex items-center gap-2">
                            <BarChart2 className="text-blue-500" />
                            Horas a Favor/Contra por Mes
                        </div>
                    }>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart  data={employee.monthlyHours} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip 
                               contentStyle={{ 
                               backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                               border: 'none', 
                               borderRadius: '0.5rem',
                               color: '#ffffff' 
                               }}
                               labelStyle={{ color: '#ffffff' }} 
                               itemStyle={{ color: '#ffffff' }}  
                                  />
                                <Bar dataKey="hours" name="Horas" >
                                    {employee.monthlyHours.map((entry: { hours: number; }, index: unknown) => (
                                        <Cell key={`cell-${index}`} fill={entry.hours >= 0 ? '#10b981' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                    
                    <Card title={
                        <div className="flex items-center gap-2 text-lg">
                            <Star className="text-yellow-500 w" />
                            Feedback del Equipo
                        </div>
                    }>
                        {employee.softSkills.map((skill, index) => (
  <SoftSkillBar 
    key={index} 
    skill={skill.nombre} 
    score={skill.level} 
  />
))}
                    </Card>
                    
                    <Card title={
                        <div className="flex items-center gap-2 text-lg">
                            <Briefcase className="text-green-500" />
                            Productividad por Tarea
                        </div>
                    }>
                        <ul>
                            {employee.tasks.map((task: { name: string; productivity: number }) => (
                                <li key={task.name} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-300">{task.name}</span>
                                    <span className={`font-bold px-2 py-1 rounded-md text-white text-sm ${getScoreColor(task.productivity)}`}>
                                        {task.productivity.toFixed(1)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card title={
                        <div className="flex items-center gap-2 text-lg">
                            <Calendar className="text-purple-500" />
                            Licencias y Faltas (Anual)
                        </div>
                    }>
                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Licencias tomadas</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{employee.licenses['2024']} <span className="text-base font-normal text-gray-500">en 2024</span></p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Faltas</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{employee.absences['2024']} <span className="text-base font-normal text-gray-500">en 2024</span></p>
                            </div>
                        </div>
                    </Card>

                    <Card title={
                        <div className="flex items-center gap-2 text-lg">
                            <MessageSquareWarning className="text-orange-500" />
                            Quejas Recibidas
                        </div>
                    }>
                        <p className="text-4xl font-bold text-orange-500 mb-2">{employee.complaints.length}</p>
                        {employee.complaints.length > 0 ? (
                            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                              {employee.complaints.map((c: { id: string | number; reason: string }) => (
                              <li key={c.id}>{c.reason}</li>
                            ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">Sin quejas registradas.</p>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    </div>
);
}