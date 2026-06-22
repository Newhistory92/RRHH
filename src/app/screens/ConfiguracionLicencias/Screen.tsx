"use client"
import React, { useState, useEffect, useMemo } from 'react';
import {
    Settings,
    Plus,
    Edit2,
    Trash2,
    X,
    Check,
    AlertCircle,
    Loader2,
    Search,
    ChevronDown,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { apiClient } from '@/app/util/apiClient';
import { EmploymentStatus } from '@/app/Interfas/Interfaces';
interface ConfiguracionLicencia {
    id: number;
    anio: number;
    tipo: string;       // Tipo de Contrato (Planta Permanente, etc)
    categoria: string;  // Nombre de la Licencia (Vacaciones, etc)
    diasTotales: number;
    createdAt?: string;
    updatedAt?: string;
}

const CONTRATOS = [
    { label: 'Planta Permanente', value: 'permanente' as EmploymentStatus },
    { label: 'Contratado', value: 'contratado' as EmploymentStatus },
    { label: 'Comisionado', value: 'comisionado' as EmploymentStatus },
    { label: 'Auditor Medico', value: 'auditor_medico' as EmploymentStatus }
];

const TIPOS_LICENCIA = [
    "Vacaciones",
    "LAR",
    "Lesiones de largo tratamiento",
    "Particular",
    "Lic. Profilácticas",
    "Accidente de trabajo",
    "Enfermedad profesional",
    "Cuidado de enfermos",
    "Licencia sin Goce de haberes",
    "Matrimonio del empleado",
    "Matrimonio de su hijo",
    "Nacimiento",
    "Embarazo",
    "Fallecimiento en Parto",
    "Fallecimiento primer grado",
    "Fallecimiento de segundo grado",
    "Fallecimiento de tercer grado",
    "Enfermedad de miembros del grupo",
    "Guarda o tenencia",
    "Lic por Examen",
    "Lic por Enfermedad"
];

type SortField = 'anio' | 'tipo' | 'categoria' | 'diasTotales';
type SortOrder = 'asc' | 'desc';

export default function ConfiguracionLicencias() {
    const [configuraciones, setConfiguraciones] = useState<ConfiguracionLicencia[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [sortField, setSortField] = useState<SortField>('anio');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<ConfiguracionLicencia>>({
        anio: new Date().getFullYear(),
        tipo: "",
        categoria: "",
        diasTotales: 0
    });


    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get<{ configuraciones: ConfiguracionLicencia[] }>('/licenses/configuracion');
            setConfiguraciones(res.configuraciones);
        } catch (error: any) {
            showToast(error.message || "Error al cargar datos", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && formData.id) {
                await apiClient.put(`/licenses/configuracion/${formData.id}`, formData);
                showToast("Configuración actualizada correctamente", "success");
            } else {
                await apiClient.post('/licenses/configuracion', formData);
                showToast("Nueva regla creada correctamente", "success");
            }
            setShowModal(false);
            loadData();
        } catch (error: any) {
            showToast(error.message || "Error al guardar", "error");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Está seguro de que desea eliminar esta configuración técnica?")) return;
        try {
            await apiClient.delete(`/licenses/configuracion/${id}`);
            showToast("Regla eliminada", "success");
            loadData();
        } catch (error: any) {
            showToast(error.message || "Error al eliminar", "error");
        }
    };

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const sortedData = useMemo(() => {
        const filtered = configuraciones.filter(c =>
            c.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.anio.toString().includes(searchTerm)
        );

        return [...filtered].sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];

            if (typeof valA === 'string' && typeof valB === 'string') {
                return sortOrder === 'asc'
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }

            return sortOrder === 'asc'
                ? (valA as number) - (valB as number)
                : (valB as number) - (valA as number);
        });
    }, [configuraciones, searchTerm, sortField, sortOrder]);

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown size={14} className="ml-1 text-gray-300" />;
        return sortOrder === 'asc' ? <ArrowUp size={14} className="ml-1 text-indigo-500" /> : <ArrowDown size={14} className="ml-1 text-indigo-500" />;
    };

    const openEdit = (config: ConfiguracionLicencia) => {
        setFormData(config);
        setIsEditing(true);
        setShowModal(true);
    };

    const openCreate = () => {
        setFormData({
            anio: new Date().getFullYear(),
            tipo: "Planta permanente",
            categoria: "",
            diasTotales: 5
        });
        setIsEditing(false);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 font-sans antialiased text-gray-900">
            {notification && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl border animate-in fade-in slide-in-from-top-4 duration-300 ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                    {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    <span className="font-medium text-sm">{notification.message}</span>
                </div>
            )}

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                        <Settings className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestión de Licencias</h1>
                        <p className="text-gray-500 text-sm">Configuración anual de cupos por contrato</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar regla..."
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all w-full md:w-64 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-100 active:scale-95"
                    >
                        <Plus size={18} />
                        Nueva Regla
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-indigo-500" size={40} />
                        <p className="text-gray-400 font-medium animate-pulse">Cargando configuraciones...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 uppercase tracking-widest text-[10px] text-gray-400 font-bold">
                                    <th className="px-6 py-4 cursor-pointer hover:text-indigo-500 transition-colors" onClick={() => toggleSort('anio')}>
                                        <div className="flex items-center">Año <SortIcon field="anio" /></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:text-indigo-500 transition-colors" onClick={() => toggleSort('tipo')}>
                                        <div className="flex items-center">Contrato / Perfil <SortIcon field="tipo" /></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:text-indigo-500 transition-colors" onClick={() => toggleSort('categoria')}>
                                        <div className="flex items-center">Tipo de Licencia <SortIcon field="categoria" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-center cursor-pointer hover:text-indigo-500 transition-colors" onClick={() => toggleSort('diasTotales')}>
                                        <div className="flex items-center justify-center text-center">Cupo <SortIcon field="diasTotales" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {sortedData.length > 0 ? sortedData.map((config) => (
                                    <tr key={config.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4 text-gray-500 font-medium">{config.anio}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.tipo === 'contratado' ? 'bg-blue-50 text-blue-700' :
                                                config.tipo === 'comisionado' ? 'bg-amber-50 text-amber-700' :
                                                    config.tipo === 'auditor_medico' ? 'bg-emerald-50 text-emerald-700' :
                                                        'bg-indigo-50 text-indigo-700'
                                                }`}>
                                                {CONTRATOS.find((c) => c.value === config.tipo)?.label || config.tipo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-700">{config.categoria}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-mono bg-gray-100 px-2.5 py-1 rounded text-gray-600 border border-gray-200">
                                                {config.diasTotales} {config.diasTotales === 1 ? 'd' : 'ds'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEdit(config)}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(config.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-gray-400 font-medium italic">
                                            No se encontraron reglas configuradas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Gestión */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowModal(false)} />

                    <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar Regla' : 'Nueva Regla Anual'}</h3>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Parámetros de cupo y derecho</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 ml-1">Año Fiscal</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                        value={formData.anio}
                                        onChange={(e) => setFormData({ ...formData, anio: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 ml-1">Días Totales</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                        value={formData.diasTotales === undefined ? '' : formData.diasTotales}
                                        onChange={(e) => setFormData({ ...formData, diasTotales: e.target.value ? parseInt(e.target.value) : 0 })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 ml-1">Tipo de Contrato</label>
                                <div className="relative group">
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                                        value={formData.tipo}
                                        onChange={(e) =>
                                            setFormData({ ...formData, tipo: e.target.value as EmploymentStatus })
                                        }
                                        required
                                    >
                                        <option value="">Seleccionar tipo</option>
                                        {CONTRATOS.map((c) => (
                                            <option key={c.value} value={c.value}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-indigo-500" size={18} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 ml-1">Nombre de la Licencia</label>
                                <div className="relative group">
                                    <input
                                        list="license-types"
                                        required
                                        placeholder="Ej: Particular, LAR..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                        value={formData.categoria}
                                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                    />
                                    <datalist id="license-types">
                                        {TIPOS_LICENCIA.map(t => <option key={t} value={t} />)}
                                    </datalist>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-2xl transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 transition-all active:scale-95"
                                >
                                    {isEditing ? 'Guardar Cambios' : 'Crear Regla'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
