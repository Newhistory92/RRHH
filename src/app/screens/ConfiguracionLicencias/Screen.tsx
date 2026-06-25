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
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Briefcase,
    GraduationCap,
    Clock as ClockIcon,
    Award
} from 'lucide-react';
import { apiClient } from '@/app/util/apiClient';
import { SoftSkills } from '@/app/Componentes/TestComponent/SoftSkills';
import { SoftSkill } from '@/app/Interfas/Interfaces';

interface ConfiguracionLicencia {
    id: number;
    anio: number;
    tipo: string;       // key del Tipo de Contrato (permanente, contratado, etc)
    categoria: string;  // Nombre de la Licencia (Vacaciones, etc)
    diasTotales: number;
}

interface ContractType {
    id?: number;
    nombre: string;
    key: string;
    descripcion: string;
}

interface Profession {
    id?: number;
    nombre: string;
    descripcion: string;
}

interface JornadaLaboral {
    id?: number;
    nombre: string;
    horasDia: number;
}

interface Horario {
    id?: number;
    horaInicio: number;
    horaFin: number;
    horasTrabajo?: number;
}

type TabId = 'licencias' | 'contratos' | 'profesiones' | 'habilidades' | 'horarios';

const TIPOS_LICENCIA_DEFAULT = [
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

export default function ConfiguracionGeneral() {
    const [activeTab, setActiveTab] = useState<TabId>('licencias');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Data lists
    const [configuraciones, setConfiguraciones] = useState<ConfiguracionLicencia[]>([]);
    const [contracts, setContracts] = useState<ContractType[]>([]);
    const [professions, setProfessions] = useState<Profession[]>([]);
    const [softSkills, setSoftSkills] = useState<SoftSkill[]>([]);
    const [jornadas, setJornadas] = useState<JornadaLaboral[]>([]);


    // Sorting
    const [sortField, setSortField] = useState<'anio' | 'tipo' | 'categoria' | 'diasTotales'>('anio');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Modals
    const [showLicenciaModal, setShowLicenciaModal] = useState(false);
    const [isEditingLicencia, setIsEditingLicencia] = useState(false);
    const [licenciaForm, setLicenciaForm] = useState<Partial<ConfiguracionLicencia>>({ anio: new Date().getFullYear(), tipo: "", categoria: "", diasTotales: 0 });

    const [showContractModal, setShowContractModal] = useState(false);
    const [isEditingContract, setIsEditingContract] = useState(false);
    const [contractForm, setContractForm] = useState<ContractType>({ nombre: "", key: "", descripcion: "" });

    const [showProfessionModal, setShowProfessionModal] = useState(false);
    const [isEditingProfession, setIsEditingProfession] = useState(false);
    const [professionForm, setProfessionForm] = useState<Profession>({ nombre: "", descripcion: "" });

    const [showJornadaModal, setShowJornadaModal] = useState(false);
    const [isEditingJornada, setIsEditingJornada] = useState(false);
    const [jornadaForm, setJornadaForm] = useState<JornadaLaboral>({ nombre: "", horasDia: 8 });

    const showToast = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [licRes, conRes, profRes, softRes, schedRes] = await Promise.all([
                apiClient.get<{ configuraciones: ConfiguracionLicencia[] }>('/licenses/configuracion'),
                apiClient.get<{ types: ContractType[] }>('/contracts/types'),
                apiClient.get<{ professions: Profession[] }>('/professions'),
                apiClient.get<SoftSkill[]>('/configtest/soft'),
                apiClient.get<{ jornadas: JornadaLaboral[], horarios: Horario[] }>('/schedules/regimes')
            ]);
            setConfiguraciones(licRes.configuraciones || []);
            setContracts(conRes.types || []);
            setProfessions(profRes.professions || []);
            setSoftSkills(softRes || []);
            setJornadas(schedRes.jornadas || []);
        } catch (error: any) {
            showToast(error.message || "Error al cargar configuraciones", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    // --- Tab Button Component ---
    const TabButton = ({ id, label, icon: Icon }: { id: TabId, label: string, icon: any }) => (
        <button
            onClick={() => { setActiveTab(id); setSearchTerm(""); }}
            className={`flex items-center gap-2 whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                    ? 'border-primary text-primary bg-primary/10'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    // --- Save Handlers ---
    const handleSaveLicencia = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditingLicencia && licenciaForm.id) {
                await apiClient.put(`/licenses/configuracion/${licenciaForm.id}`, licenciaForm);
                showToast("Regla de licencia actualizada", "success");
            } else {
                await apiClient.post('/licenses/configuracion', licenciaForm);
                showToast("Nueva regla de licencia creada", "success");
            }
            setShowLicenciaModal(false);
            loadAllData();
        } catch (error: any) {
            showToast(error.message || "Error al guardar", "error");
        }
    };

    const handleSaveContract = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiClient.post('/contracts/types', contractForm);
            showToast(isEditingContract ? "Contrato actualizado" : "Contrato creado", "success");
            setShowContractModal(false);
            loadAllData();
        } catch (error: any) {
            showToast(error.message || "Error al guardar contrato", "error");
        }
    };

    const handleSaveProfession = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiClient.post('/professions', professionForm);
            showToast(isEditingProfession ? "Profesión actualizada" : "Profesión creada", "success");
            setShowProfessionModal(false);
            loadAllData();
        } catch (error: any) {
            showToast(error.message || "Error al guardar profesión", "error");
        }
    };

    const handleSaveJornada = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiClient.post('/schedules/jornadas', jornadaForm);
            showToast(isEditingJornada ? "Jornada laboral actualizada" : "Jornada laboral creada", "success");
            setShowJornadaModal(false);
            loadAllData();
        } catch (error: any) {
            showToast(error.message || "Error al guardar jornada", "error");
        }
    };

 

    // --- Delete Handlers ---
    const handleDeleteLicencia = async (id: number) => {
        if (!window.confirm("¿Está seguro de eliminar esta regla de licencia?")) return;
        try {
            await apiClient.delete(`/licenses/configuracion/${id}`);
            showToast("Regla de licencia eliminada", "success");
            loadAllData();
        } catch (error: any) {
            showToast(error.message || "Error al eliminar", "error");
        }
    };

    const handleDeleteContract = async (id: number) => {
        if (!window.confirm("¿Está seguro de desactivar este tipo de contrato?")) return;
        try {
            await apiClient.delete(`/contracts/types/${id}`);
            showToast("Contrato desactivado", "success");
            loadAllData();
        } catch (error: any) {
            showToast(error.message || "Error al desactivar contrato", "error");
        }
    };

    const handleDeleteProfession = async (id: number) => {
        if (!window.confirm("¿Está seguro de desactivar esta profesión/cargo?")) return;
        try {
            await apiClient.delete(`/professions/${id}`);
            showToast("Profesión desactivada", "success");
            loadAllData();
        } catch (error: any) {
            showToast(error.message || "Error al desactivar profesión", "error");
        }
    };

    const handleDeleteJornada = async (id: number) => {
        if (!window.confirm("¿Está seguro de eliminar esta jornada laboral?")) return;
        try {
            await apiClient.delete(`/schedules/jornadas/${id}`);
            showToast("Jornada laboral eliminada", "success");
            loadAllData();
        } catch (error: any) {
            showToast(error.message || "Error al eliminar jornada", "error");
        }
    };


    // --- Soft Skill Handlers ---
    const handleAddSoftSkill = async (skill: SoftSkill) => {
        try {
            await apiClient.post('/configtest/soft', skill);
            showToast("Habilidad blanda guardada", "success");
            loadAllData();
        } catch (error: any) {
            showToast(error.message || "Error al guardar habilidad blanda", "error");
        }
    };

    const handleDeleteSoftSkill = async (index: number) => {
        const skill = softSkills[index];
        if (!skill || !skill.id) return;
        if (!window.confirm("¿Está seguro de eliminar esta habilidad blanda?")) return;
        try {
            await apiClient.delete(`/configtest/soft/${skill.id}`);
            showToast("Habilidad blanda eliminada", "success");
            loadAllData();
        } catch (error: any) {
            showToast(error.message || "Error al eliminar habilidad", "error");
        }
    };

    // --- Sorting & Filtering ---
    const sortedLicencias = useMemo(() => {
        const filtered = configuraciones.filter(c =>
            c.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.anio.toString().includes(searchTerm)
        );
        return [...filtered].sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];
            if (typeof valA === 'string' && typeof valB === 'string') {
                return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
        });
    }, [configuraciones, searchTerm, sortField, sortOrder]);

    const SortIcon = ({ field }: { field: typeof sortField }) => {
        if (sortField !== field) return <ArrowUpDown size={14} className="ml-1 text-gray-300" />;
        return sortOrder === 'asc' ? <ArrowUp size={14} className="ml-1 text-indigo-500" /> : <ArrowDown size={14} className="ml-1 text-indigo-500" />;
    };

    const toggleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    

    return (
        <div className="min-h-screen bg-background p-6 font-sans antialiased text-foreground">
            {notification && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl border animate-in fade-in slide-in-from-top-4 duration-300 ${
                    notification.type === 'success' ? 'bg-success-soft border-success text-success-soft-foreground' : 'bg-error-soft border-error text-error-soft-foreground'
                }`}>
                    {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    <span className="font-medium text-sm">{notification.message}</span>
                </div>
            )}

            {/* Header */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary rounded-xl shadow-lg shadow-primary/20">
                        <Settings className="text-primary-foreground" size={28} />
                    </div>
                    <div>
                        <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">Configuración General</h1>
                        <p className="text-muted-foreground text-sm">Parámetros globales del sistema de Recursos Humanos</p>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="max-w-7xl mx-auto mb-6 bg-card border border-border rounded-xl p-1 shadow-sm">
                <nav className="flex space-x-1 overflow-x-auto">
                    <TabButton id="licencias" label="Reglas de Licencias" icon={Settings} />
                    <TabButton id="contratos" label="Tipos de Contrato" icon={Briefcase} />
                    <TabButton id="profesiones" label="Profesiones y Cargos" icon={GraduationCap} />
                    <TabButton id="habilidades" label="Habilidades Blandas" icon={Award} />
                    <TabButton id="horarios" label="Régimen Horario" icon={ClockIcon} />
                </nav>
            </div>

            {/* Main Area */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <Loader2 className="animate-spin text-indigo-500" size={40} />
                        <p className="text-gray-400 font-medium animate-pulse">Cargando datos...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
                        
                        {/* ── TAB 1: LICENCIAS ────────────────────────────────────────── */}
                        {activeTab === 'licencias' && (
                            <div>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <h2 className="text-lg font-bold text-gray-800">Cupos de Licencias Anuales</h2>
                                    <div className="flex items-center gap-3">
                                        <div className="relative group">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Buscar regla..."
                                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all w-60"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                setLicenciaForm({ anio: new Date().getFullYear(), tipo: contracts[0]?.key || "", categoria: "", diasTotales: 5 });
                                                setIsEditingLicencia(false);
                                                setShowLicenciaModal(true);
                                            }}
                                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
                                        >
                                            <Plus size={16} /> Nueva Regla
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100 uppercase tracking-wider text-[10px] text-gray-400 font-bold">
                                                <th className="px-6 py-4 cursor-pointer hover:text-indigo-500" onClick={() => toggleSort('anio')}>
                                                    <div className="flex items-center">Año <SortIcon field="anio" /></div>
                                                </th>
                                                <th className="px-6 py-4 cursor-pointer hover:text-indigo-500" onClick={() => toggleSort('tipo')}>
                                                    <div className="flex items-center">Contrato / Perfil <SortIcon field="tipo" /></div>
                                                </th>
                                                <th className="px-6 py-4 cursor-pointer hover:text-indigo-500" onClick={() => toggleSort('categoria')}>
                                                    <div className="flex items-center">Tipo de Licencia <SortIcon field="categoria" /></div>
                                                </th>
                                                <th className="px-6 py-4 text-center cursor-pointer hover:text-indigo-500" onClick={() => toggleSort('diasTotales')}>
                                                    <div className="flex items-center justify-center">Cupo <SortIcon field="diasTotales" /></div>
                                                </th>
                                                <th className="px-6 py-4 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 text-sm">
                                            {sortedLicencias.length > 0 ? sortedLicencias.map((config) => (
                                                <tr key={config.id} className="hover:bg-gray-50/50 group">
                                                    <td className="px-6 py-4 text-gray-500 font-medium">{config.anio}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                                                            {contracts.find(c => c.key === config.tipo)?.nombre || config.tipo}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-gray-700">{config.categoria}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="font-mono bg-gray-100 px-2.5 py-1 rounded text-gray-600 border border-gray-200">
                                                            {config.diasTotales} {config.diasTotales === 1 ? 'día' : 'días'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => { setLicenciaForm(config); setIsEditingLicencia(true); setShowLicenciaModal(true); }} className="p-2 text-gray-400 hover:text-indigo-600" title="Editar"><Edit2 size={16} /></button>
                                                            <button onClick={() => handleDeleteLicencia(config.id)} className="p-2 text-gray-400 hover:text-red-600" title="Eliminar"><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={5} className="py-10 text-center text-gray-400 italic">No se encontraron reglas configuradas.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ── TAB 2: CONTRATOS ────────────────────────────────────────── */}
                        {activeTab === 'contratos' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-bold text-gray-800">Tipos de Contrato Disponibles</h2>
                                    <button
                                        onClick={() => { setContractForm({ nombre: "", key: "", descripcion: "" }); setIsEditingContract(false); setShowContractModal(true); }}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm"
                                    >
                                        <Plus size={16} /> Nuevo Contrato
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {contracts.map(c => (
                                        <div key={c.id} className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-all">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-bold text-gray-900">{c.nombre}</h3>
                                                    <span className="px-2 py-0.5 text-[9px] bg-indigo-50 text-indigo-700 rounded-md font-mono font-bold uppercase">{c.key}</span>
                                                </div>
                                                <p className="text-sm text-gray-500 line-clamp-3 mb-4">{c.descripcion || 'Sin descripción disponible.'}</p>
                                            </div>
                                            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                                                <button onClick={() => { setContractForm(c); setIsEditingContract(true); setShowContractModal(true); }} className="flex items-center gap-1 text-xs text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md transition-all font-semibold"><Edit2 size={12} /> Editar</button>
                                                <button onClick={() => c.id && handleDeleteContract(c.id)} className="flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded-md transition-all font-semibold"><Trash2 size={12} /> Desactivar</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── TAB 3: PROFESIONES ──────────────────────────────────────── */}
                        {activeTab === 'profesiones' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-bold text-gray-800">Catálogo de Profesiones y Cargos</h2>
                                    <button
                                        onClick={() => { setProfessionForm({ nombre: "", descripcion: "" }); setIsEditingProfession(false); setShowProfessionModal(true); }}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm"
                                    >
                                        <Plus size={16} /> Nueva Profesión
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100 uppercase tracking-wider text-[10px] text-gray-400 font-bold">
                                                <th className="px-6 py-4">Profesión / Cargo</th>
                                                <th className="px-6 py-4">Descripción</th>
                                                <th className="px-6 py-4 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 text-sm">
                                            {professions.length > 0 ? professions.map(p => (
                                                <tr key={p.id} className="hover:bg-gray-50/50 group">
                                                    <td className="px-6 py-4 font-bold text-gray-700">{p.nombre}</td>
                                                    <td className="px-6 py-4 text-gray-500">{p.descripcion || 'Sin descripción.'}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => { setProfessionForm(p); setIsEditingProfession(true); setShowProfessionModal(true); }} className="p-2 text-gray-400 hover:text-indigo-600" title="Editar"><Edit2 size={16} /></button>
                                                            <button onClick={() => p.id && handleDeleteProfession(p.id)} className="p-2 text-gray-400 hover:text-red-600" title="Desactivar"><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={3} className="py-10 text-center text-gray-400 italic">No hay profesiones cargadas en el sistema.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ── TAB 4: HABILIDADES BLANDAS ────────────────────────────────── */}
                        {activeTab === 'habilidades' && (
                            <SoftSkills
                                softSkills={softSkills}
                                onAddSoftSkill={handleAddSoftSkill}
                                onDeleteSoftSkill={handleDeleteSoftSkill}
                            />
                        )}

                        {/* ── TAB 5: HORARIOS ─────────────────────────────────────────── */}
                        {activeTab === 'horarios' && (
                            <div className="space-y-8">
                                {/* Jornadas Laborales */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-gray-800">Jornadas Laborales (Contratos vs Horas)</h3>
                                        <button
                                            onClick={() => { setJornadaForm({ nombre: "", horasDia: 8 }); setIsEditingJornada(false); setShowJornadaModal(true); }}
                                            className="flex items-center gap-1.5 text-indigo-600 hover:bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                        >
                                            <Plus size={14} /> Nueva Jornada
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {jornadas.map(j => (
                                            <div key={j.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-between shadow-sm">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-sm">{j.nombre}</h4>
                                                    <p className="text-xs text-gray-500 mt-1 font-mono">{j.horasDia} hrs/día</p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => { setJornadaForm(j); setIsEditingJornada(true); setShowJornadaModal(true); }} className="p-1.5 text-gray-400 hover:text-indigo-600"><Edit2 size={14} /></button>
                                                    <button onClick={() => j.id && handleDeleteJornada(j.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── MODALS ── */}

            {/* 1. Modal Licencia */}
            {showLicenciaModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowLicenciaModal(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-3xl border border-gray-100 shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">{isEditingLicencia ? 'Editar Regla de Licencia' : 'Nueva Regla Anual'}</h3>
                            <button onClick={() => setShowLicenciaModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveLicencia} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Año Fiscal</label>
                                    <input type="number" required className="w-full px-3 py-2 border rounded-xl" value={licenciaForm.anio} onChange={e => setLicenciaForm({ ...licenciaForm, anio: parseInt(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Días Totales</label>
                                    <input type="number" required min="0" className="w-full px-3 py-2 border rounded-xl" value={licenciaForm.diasTotales || 0} onChange={e => setLicenciaForm({ ...licenciaForm, diasTotales: parseInt(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Contrato</label>
                                <select required className="w-full px-3 py-2 border rounded-xl" value={licenciaForm.tipo} onChange={e => setLicenciaForm({ ...licenciaForm, tipo: e.target.value })}>
                                    <option value="">Seleccionar tipo</option>
                                    {contracts.map(c => <option key={c.key} value={c.key}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de la Licencia</label>
                                <input list="license-types" required placeholder="Ej: Particular, Vacaciones" className="w-full px-3 py-2 border rounded-xl" value={licenciaForm.categoria} onChange={e => setLicenciaForm({ ...licenciaForm, categoria: e.target.value })} />
                                <datalist id="license-types">
                                    {TIPOS_LICENCIA_DEFAULT.map(t => <option key={t} value={t} />)}
                                </datalist>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowLicenciaModal(false)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. Modal Contrato */}
            {showContractModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowContractModal(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-3xl border border-gray-100 shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">{isEditingContract ? 'Editar Contrato' : 'Nuevo Tipo de Contrato'}</h3>
                            <button onClick={() => setShowContractModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveContract} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Contrato</label>
                                <input type="text" required placeholder="Ej: Contrato Eventual" className="w-full px-3 py-2 border rounded-xl" value={contractForm.nombre} onChange={e => setContractForm({ ...contractForm, nombre: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Clave de Referencia (Key)</label>
                                <input type="text" required placeholder="Ej: eventual" disabled={isEditingContract} className="w-full px-3 py-2 border rounded-xl disabled:bg-gray-100" value={contractForm.key} onChange={e => setContractForm({ ...contractForm, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                                <textarea placeholder="Detalles de este tipo de régimen contractual" className="w-full px-3 py-2 border rounded-xl" rows={3} value={contractForm.descripcion} onChange={e => setContractForm({ ...contractForm, descripcion: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowContractModal(false)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. Modal Profesión */}
            {showProfessionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowProfessionModal(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-3xl border border-gray-100 shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">{isEditingProfession ? 'Editar Profesión' : 'Nueva Profesión / Cargo'}</h3>
                            <button onClick={() => setShowProfessionModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveProfession} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Cargo / Profesión</label>
                                <input type="text" required placeholder="Ej: Desarrollador Backend" className="w-full px-3 py-2 border rounded-xl" value={professionForm.nombre} onChange={e => setProfessionForm({ ...professionForm, nombre: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                                <textarea placeholder="Breve descripción del alcance del cargo" className="w-full px-3 py-2 border rounded-xl" rows={3} value={professionForm.descripcion} onChange={e => setProfessionForm({ ...professionForm, descripcion: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowProfessionModal(false)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 4. Modal Jornada */}
            {showJornadaModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowJornadaModal(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-3xl border border-gray-100 shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">{isEditingJornada ? 'Editar Jornada Laboral' : 'Nueva Jornada Laboral'}</h3>
                            <button onClick={() => setShowJornadaModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveJornada} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre (Tipo de Contrato)</label>
                                <select required className="w-full px-3 py-2 border rounded-xl" value={jornadaForm.nombre} onChange={e => setJornadaForm({ ...jornadaForm, nombre: e.target.value })}>
                                    <option value="">Seleccionar contrato relacionado</option>
                                    {contracts.map(c => <option key={c.key} value={c.nombre}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Horas Diarias</label>
                                <input type="number" required min="1" max="24" className="w-full px-3 py-2 border rounded-xl" value={jornadaForm.horasDia} onChange={e => setJornadaForm({ ...jornadaForm, horasDia: parseFloat(e.target.value) })} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowJornadaModal(false)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
