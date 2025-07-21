"use client"
import React, { useState } from 'react';
import {  Sparkles, LayoutGrid,  } from 'lucide-react';
import { OrgChartNode } from '@/app/Componentes/OrganigramaGraf/organigrama';
import { orgChartData } from '@/app/api/Prueba';
import { mockEmployeesorg } from '@/app/api/Prueba';
import { initialDataOrg } from '@/app/api/Prueba';
import { DepartmentManagementView } from '@/app/Componentes/Orgamograma/Departamento';
import { EntityFormModal } from '@/app/util/UiOrganigrama';
export default function OrganigramaPage() {
    const [departmentsData, setDepartmentsData] = useState(initialDataOrg);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ type: null, data: null, context: {} });
    const [activeTab, setActiveTab] = useState('gestion'); // 'gestion' | 'ia'
    
    // State for AI feature
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    const handleSelectDepartment = (department) => { setSelectedDepartment(departmentsData.find(d => d.id === department.id)); };
    const handleOpenModal = (type, data = null, context = {}) => { setModalConfig({ type, data, context }); setIsModalOpen(true); };
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSave = (formData) => {
        const { type, data } = modalConfig;
        if (type === 'department') {
            if (data) { setDepartmentsData(departmentsData.map(d => d.id === data.id ? { ...d, ...formData } : d));} else { setDepartmentsData([...departmentsData, { id: Date.now(), oficinas: [], ...formData }]); }
        } else if (type === 'office') {
            const parentDeptId = data ? departmentsData.find(d => d.oficinas.some(o => o.id === data.id)).id : modalConfig.context.departmentId;
            setDepartmentsData(departmentsData.map(d => {
                if (d.id === parentDeptId) {
                    const newOficinas = data ? d.oficinas.map(o => o.id === data.id ? { ...o, ...formData } : o) : [...d.oficinas, { id: Date.now(), ...formData }];
                    return { ...d, oficinas: newOficinas };
                }
                return d;
            }));
        }
        if (selectedDepartment && data && selectedDepartment.id === data.id) { handleSelectDepartment(data); }
        handleCloseModal();
    };
    
    const handleAnalyzeWithAI = async () => {
        setIsAiLoading(true);
        setAiSuggestion('');

        // 1. Construir el prompt para Gemini
        let structureText = "ESTRUCTURA ORGANIZACIONAL:\n\n";
        departmentsData.forEach(dept => {
            structureText += `DEPARTAMENTO: "${dept.nombre}" (Nivel ${dept.nivel_jerarquico})\n`;
            structureText += `DESCRIPCIÓN: ${dept.descripcion}\n`;
            if (dept.oficinas.length > 0) {
                dept.oficinas.forEach(office => {
                    structureText += `  - OFICINA: "${office.nombre}"\n`;
                    structureText += `    DESCRIPCIÓN: ${office.descripcion}\n`;
                });
            }
            structureText += "\n";
        });

        const prompt = `Como experto en consultoría organizacional, analiza la siguiente estructura de una empresa. Tu objetivo es identificar redundancias funcionales, áreas de superposición o ineficiencias estructurales basándote EXCLUSIVAMENTE en los nombres y descripciones proporcionados.

        **Análisis Solicitado:**
        1.  **Identifica Redundancias:** ¿Hay departamentos u oficinas que parecen hacer lo mismo? Nómbralos y explica por qué sus funciones se superponen.
        2.  **Propón Fusiones o Reorganizaciones:** Basado en tu análisis, sugiere fusiones concretas. Por ejemplo, "Sugerimos fusionar el departamento 'Adquisiciones' con la oficina 'Compras' para centralizar la función". Justifica cada sugerencia.
        3.  **Resultado Esperado:** Proporciona un resumen claro y accionable para la Dirección. Formatea tu respuesta de manera profesional.

        ${structureText}`;

        // 2. Llamar a la API de Gemini
        try {
            const apiKey = ""; // Dejar vacío, se gestiona en el entorno de ejecución
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Error en la API: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setAiSuggestion(text);
            } else {
                setAiSuggestion("No se pudo obtener una sugerencia de la IA. La respuesta no tuvo el formato esperado.");
            }
        } catch (error) {
            console.error("Error al llamar a la API de Gemini:", error);
            setAiSuggestion(`Hubo un error al conectar con el servicio de IA. Por favor, inténtalo de nuevo más tarde. Detalles: ${error.message}`);
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 font-sans min-h-screen">
            <div className="container mx-auto p-4 md:p-8">
                <header className="mb-8"><h1 className="text-4xl font-bold text-gray-800">Gestión Organizacional</h1><p className="text-gray-600 mt-1">Administra la estructura de tu empresa y optimízala con IA.</p></header>
                
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6">
                        <button onClick={() => setActiveTab('gestion')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'gestion' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><LayoutGrid className="mr-2 h-5 w-5"/>Gestión de Departamentos</button>
                        <button onClick={() => setActiveTab('ia')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'ia' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><Sparkles className="mr-2 h-5 w-5"/>Optimización con IA</button>
                        <button onClick={() => setActiveTab('organigrama')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'organigrama' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><Sparkles className="mr-2 h-5 w-5"/>Organigrama</button>
                    </nav>
                </div>

                {activeTab === 'gestion' && <DepartmentManagementView departmentsData={departmentsData} onSelect={handleSelectDepartment} selectedDepartment={selectedDepartment} onOpenModal={handleOpenModal} />}
                {/* {activeTab === 'ia' && <AiOptimizationView departmentsData={departmentsData} aiSuggestion={aiSuggestion} isAiLoading={isAiLoading} onAnalyze={handleAnalyzeWithAI} />} */}
                 {activeTab === 'organigrama' && <OrgChartNode node={orgChartData}  />}
            </div>
            {isModalOpen && <EntityFormModal config={modalConfig} onClose={handleCloseModal} onSave={handleSave} departments={departmentsData} employees={mockEmployeesorg} />}
            <style jsx>{`@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }`}</style>
        </div>
    );
}