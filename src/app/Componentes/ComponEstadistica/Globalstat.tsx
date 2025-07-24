
"use client"
import { Card,CardTitle } from '@/app/Componentes/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell} from 'recharts';
import {  BarChart2,  Award, Users, Frown } from 'lucide-react';
import React from 'react';


export const GlobalStats = ({ employees }) => {
    const { bestDepartment, lowEfficiencyActivities, avgAbsences, avgLateness, statusDistribution } = React.useMemo(() => {
        if (employees.length === 0) {
            return {
                bestDepartment: { name: 'N/A', avg: '0' },
                lowEfficiencyActivities: [],
                avgAbsences: '0',
                avgLateness: '0',
                statusDistribution: []
            };
        }
        // Mejor departamento
        const deptProd = employees.reduce((acc, e) => {
            acc[e.department] = acc[e.department] || { total: 0, count: 0 };
            acc[e.department].total += e.productivityScore;
            acc[e.department].count++;
            return acc;
        }, {});
        const bestDeptName = Object.keys(deptProd).reduce((a, b) => (deptProd[a].total / deptProd[a].count) > (deptProd[b].total / deptProd[b].count) ? a : b);

        // Actividades con baja eficiencia
        const activityProd = employees.reduce((acc, e) => {
            acc[e.activityType] = acc[e.activityType] || { total: 0, count: 0 };
            acc[e.activityType].total += e.productivityScore;
            acc[e.activityType].count++;
            return acc;
        }, {});
        const lowActivities = Object.entries(activityProd)
            .map(([name, data]) => ({ name, avg: data.total / data.count }))
            .filter(item => item.avg < 7.5);

        // Promedio de ausencias y tardanzas (simulado)
        const totalAbsences = employees.reduce((sum, e) => sum + e.absences['2024'], 0);
        const totalLateness = employees.reduce((sum, e) => sum + (e.monthlyHours.filter(m => m.hours < 0).length), 0) * 2; // Simulación

        // Distribución por condición laboral
        const statusDist = employees.reduce((acc, e) => {
            acc[e.status] = (acc[e.status] || 0) + 1;
            return acc;
        }, {});
        
        return {
            bestDepartment: { name: bestDeptName, avg: (deptProd[bestDeptName].total / deptProd[bestDeptName].count).toFixed(1) },
            lowEfficiencyActivities: lowActivities,
            avgAbsences: (totalAbsences / employees.length).toFixed(1),
            avgLateness: (totalLateness / employees.length).toFixed(1),
            statusDistribution: Object.entries(statusDist).map(([name, value]) => ({ name, value }))
        };
    }, [employees]);

    const PIE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];
    
    // Datos para el gráfico de productividad por departamento
    const departmentProductivityData = React.useMemo(() => {
         const deptProd = employees.reduce((acc, e) => {
            acc[e.department] = acc[e.department] || { total: 0, count: 0 };
            acc[e.department].total += e.productivityScore;
            acc[e.department].count++;
            return acc;
        }, {});
        return Object.entries(deptProd).map(([name, data]) => ({
            name,
            productividad: (data.total / data.count)
        }));
    }, [employees]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <Award className="h-10 w-10 mb-2 opacity-80" />
                <p className="text-sm font-light uppercase tracking-widest">Mejor Departamento</p>
                <p className="text-3xl font-bold">{bestDepartment.name}</p>
                <p className="text-lg font-medium opacity-90">Promedio: {bestDepartment.avg}</p>
            </Card>
            <Card className="flex flex-col items-center justify-center bg-gradient-to-br from-rose-500 to-orange-500 text-white">
                <Frown className="h-10 w-10 mb-2 opacity-80" />
                <p className="text-sm font-light uppercase tracking-widest">Ausencias (Promedio/Año)</p>
                <p className="text-4xl font-bold">{avgAbsences}</p>
            </Card>
            <Card className="flex flex-col items-center justify-center">
                 <p className="text-sm font-light uppercase tracking-widest text-gray-500 dark:text-gray-400">Tardanzas (Promedio/Año)</p>
                 <p className="text-4xl font-bold text-gray-800 dark:text-white">{avgLateness}</p>
            </Card>
             <Card>
                <CardTitle>Actividades de Baja Eficiencia</CardTitle>
                {lowEfficiencyActivities.length > 0 ? (
                    <ul className="space-y-2">
                        {lowEfficiencyActivities.map(act => (
                            <li key={act.name} className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-300">{act.name}</span>
                                <span className="font-bold text-red-500">{act.avg.toFixed(1)}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Todas las actividades tienen buena eficiencia.</p>
                )}
            </Card>

            <Card className="md:col-span-2">
                <CardTitle icon={BarChart2}>Productividad Promedio por Departamento</CardTitle>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentProductivityData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={[0, 10]} />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="productividad" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            <Card className="md:col-span-2">
                <CardTitle icon={Users}>Distribución por Condición Laboral</CardTitle>
                 <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={statusDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                return (
                                <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text>
                                );
                            }}
                        >
                            {statusDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                         <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};