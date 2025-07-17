"use client"

import React, { useState} from 'react';
import { FileText,  Trash2, Lock, Check, BrainCircuit, Edit, Save } from 'lucide-react';
import { DynamicSection } from '@/app/Componentes/Perfil/DynamicSectionCv';
import { Accordion, Input, Select,  SectionTitle,formatDate } from '@/app/util/UiCv';
import { ProfilePictureUploader } from '@/app/Componentes/Perfil/ProfilePicture';
import { SkillTestModal } from '@/app/Componentes/Perfil/SkillTest';
import { initialCvData } from '@/app/api/Prueba';
import { mockData } from '@/app/api/Prueba';

export default function EmployeeCV() {
    const loggedInEmployee = mockData.employees.find(e => e.id === 1);
    const [cvData, setCvData] = useState(initialCvData(loggedInEmployee));
    const [originalCvData, setOriginalCvData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [skillToTest, setSkillToTest] = useState(null);

    const handlePersonalDataChange = (field, value) => setCvData(prev => ({ ...prev, personalData: { ...prev.personalData, [field]: value } }));
    const handleDynamicSectionChange = (section, id, field, value) => setCvData(prev => ({ ...prev, [section]: prev[section].map(item => item.id === id ? { ...item, [field]: value } : item) }));
    // const addDynamicSectionItem = (section, newItem) => setCvData(prev => ({ ...prev, [section]: [...prev[section], { ...newItem, id: Date.now() }] }));
    const removeDynamicSectionItem = (section, id) => setCvData(prev => ({ ...prev, [section]: prev[section].filter(item => item.id !== id) }));
    const getValidationStatusPill = (status) => { const styles = { Pendiente: 'bg-yellow-100 text-yellow-800', Validado: 'bg-green-100 text-green-800', Rechazado: 'bg-red-100 text-red-800' }; return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${styles[status]}`}>{status}</span>; };
    const handleStartTest = (skill) => { setSkillToTest(skill); setIsTestModalOpen(true); };

    const handleSoftSkillChange = (skillId) => {
        if (!isEditing) return;
        setCvData(prev => {
            const currentSkills = prev.softSkills;
            const newSkills = currentSkills.includes(skillId) ? currentSkills.filter(id => id !== skillId) : [...currentSkills, skillId];
            return { ...prev, softSkills: newSkills };
        });
    };
    
    const handleEdit = () => {
        setOriginalCvData(JSON.parse(JSON.stringify(cvData)));
        setIsEditing(true);
    };

    const handleSave = () => {
        // In a real app, you'd send `cvData` to your backend here.
        setIsEditing(false);
        setOriginalCvData(null); // Clear backup
        console.log("Datos guardados:", cvData);
    };

    const handleCancel = () => {
        setCvData(originalCvData);
        setIsEditing(false);
        setOriginalCvData(null);
    };


    const handleTestComplete = (skill, score) => {
        setIsTestModalOpen(false); setSkillToTest(null);
        if (score >= 70) {
            let level = 'Básico'; if (score >= 85) level = 'Avanzado'; else if (score >= 70) level = 'Medio';
            // const newSkill = { id: Date.now(), skill: skill.name, level: level, experienceYears: 0 };
            setCvData(prev => ({ ...prev, technicalSkills: [...prev.technicalSkills, newSkill] }));
            const newStatus = { skill_id: skill.id, status: 'passed' };
            setCvData(prev => ({ ...prev, skillStatus: [...prev.skillStatus.filter(s => s.skill_id !== skill.id), newStatus] }));
        } else {
            const unlockDate = new Date(); unlockDate.setMonth(unlockDate.getMonth() + 3);
            const newStatus = { skill_id: skill.id, status: 'locked', unlockDate };
            setCvData(prev => ({ ...prev, skillStatus: [...prev.skillStatus.filter(s => s.skill_id !== skill.id), newStatus] }));
        }
    };
    
    return (
        <div className="bg-gray-100 font-sans min-h-screen">
            {isTestModalOpen && <SkillTestModal skill={skillToTest} onClose={() => setIsTestModalOpen(false)} onTestComplete={handleTestComplete} />}
            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex justify-between items-start mb-6">
                    <SectionTitle icon={FileText} title="Mi Currículum Vitae" />
                    <div>
                        <span className="text-sm text-gray-600 mr-2">Estado de Validación:</span>
                        {getValidationStatusPill(cvData.validation_status)}
                    </div>
                </div>
                <div className="space-y-4">
                    <Accordion title="1. Datos Personales" defaultOpen={true}>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-3 flex justify-center">
                                <ProfilePictureUploader photo={cvData.personalData.profilePhoto} setPhoto={photo => handlePersonalDataChange('profilePhoto', photo)} isEditing={isEditing} />
                            </div>
                            <Input label="Nombre Completo" value={cvData.personalData.fullName} disabled /> 
                            <Input label="DNI" value={cvData.personalData.dni} disabled /> 
                            <Input label="Fecha de Nacimiento" value={cvData.personalData.birthDate} disabled /> 
                            <Input label="Nacionalidad" value={cvData.personalData.nationality} onChange={e => handlePersonalDataChange('nationality', e.target.value)} disabled={!isEditing} /> 
                            <Select label="Género (opcional)" value={cvData.personalData.gender} onChange={e => handlePersonalDataChange('gender', e.target.value)} options={[{value: 'Femenino', label: 'Femenino'}, {value: 'Masculino', label: 'Masculino'}, {value: 'Otro', label: 'Otro'}]} disabled={!isEditing}/> 
                            <Input label="Dirección" value={cvData.personalData.address} onChange={e => handlePersonalDataChange('address', e.target.value)} disabled={!isEditing}/> 
                            <Input label="Ciudad" value={cvData.personalData.city} onChange={e => handlePersonalDataChange('city', e.target.value)} disabled={!isEditing}/> 
                            <Input label="Provincia/Estado" value={cvData.personalData.province} onChange={e => handlePersonalDataChange('province', e.target.value)} disabled={!isEditing}/> 
                            <Input label="Teléfono" type="tel" value={cvData.personalData.phone} onChange={e => handlePersonalDataChange('phone', e.target.value)} disabled={!isEditing}/> 
                            <Input label="Email" type="email" value={cvData.personalData.email} onChange={e => handlePersonalDataChange('email', e.target.value)} disabled={!isEditing}/> 
                         </div>
                    </Accordion>
                    <Accordion title="2. Formación Académica"> <DynamicSection sectionName="academicFormation" items={cvData.academicFormation} onChange={(id, field, value) => handleDynamicSectionChange('academicFormation', id, field, value)} onRemove={(id) => removeDynamicSectionItem('academicFormation', id)} onAdd={() => addDynamicSectionItem('academicFormation', { title: '', institution: '', level: 'Universitario', status: 'En curso', startDate: '', endDate: '', isCurrent: false })} fields={[ { name: 'title', label: 'Título Obtenido', type: 'text', required: true, grid: 'md:col-span-2' }, { name: 'institution', label: 'Institución Educativa', type: 'text', required: true, grid: 'md:col-span-2' }, { name: 'level', label: 'Nivel', type: 'select', options: [{value:'Secundario', label:'Secundario'}, {value:'Terciario', label:'Terciario'}, {value:'Universitario', label:'Universitario'}, {value:'Posgrado', label:'Posgrado'}] }, { name: 'status', label: 'Estado', type: 'select', options: [{value:'En curso', label:'En curso'}, {value:'Completo', label:'Completo'}, {value:'Incompleto', label:'Incompleto'}] }, { name: 'startDate', label: 'Fecha de Inicio', type: 'date' }, { name: 'endDate', label: 'Fecha de Fin', type: 'date' }, { name: 'isCurrent', label: 'Actualmente', type: 'checkbox' }, { name: 'attachment', label: 'Adjuntar Diploma (PDF)', type: 'file', accept: '.pdf' }, ]} isEditing={isEditing} /> </Accordion>
                    <Accordion title="3. Experiencia Laboral"> <DynamicSection items={cvData.workExperience} onChange={(id, field, value) => handleDynamicSectionChange('workExperience', id, field, value)} onRemove={(id) => removeDynamicSectionItem('workExperience', id)} onAdd={() => addDynamicSectionItem('workExperience', { position: '', company: '', industry: '', location: '', startDate: '', endDate: '', isCurrent: false, contractType: 'Tiempo completo' })} fields={[{ name: 'position', label: 'Puesto', type: 'text', required: true, grid: 'md:col-span-1' }, { name: 'company', label: 'Empresa', type: 'text', required: true, grid: 'md:col-span-1' }, { name: 'industry', label: 'Industria', type: 'text', required: true }, { name: 'location', label: 'Ubicación', type: 'text', required: true }, { name: 'startDate', label: 'Fecha de Inicio', type: 'date' }, { name: 'endDate', label: 'Fecha de Fin', type: 'date' }, { name: 'isCurrent', label: 'Actualmente', type: 'checkbox' }, { name: 'contractType', label: 'Tipo de Contrato', type: 'select', options: [{ value: 'Tiempo completo', label: 'Tiempo completo' }, { value: 'Medio tiempo', label: 'Medio tiempo' }, { value: 'Freelance', label: 'Freelance' }] },]} isEditing={isEditing} sectionName={undefined} /> </Accordion>
                    <Accordion title="4. Idiomas"> <DynamicSection items={cvData.languages} onChange={(id, field, value) => handleDynamicSectionChange('languages', id, field, value)} onRemove={(id) => removeDynamicSectionItem('languages', id)} onAdd={() => addDynamicSectionItem('languages', { language: '', level: 'Básico', certification: '' })} fields={[{ name: 'language', label: 'Idioma', type: 'text', required: true }, { name: 'level', label: 'Nivel', type: 'select', options: [{ value: 'Básico', label: 'Básico' }, { value: 'Intermedio', label: 'Intermedio' }, { value: 'Avanzado', label: 'Avanzado' }, { value: 'Nativo', label: 'Nativo' }] }, { name: 'certification', label: 'Certificación (Opcional)', type: 'text' }, { name: 'attachment', label: 'Adjuntar Certificado (PDF/JPG)', type: 'file', accept: '.pdf, .jpg, .jpeg' },]} isEditing={isEditing} sectionName={undefined} /> </Accordion>
                    <Accordion title="5. Habilidades Técnicas">
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-800">Valida tus habilidades</h4>
                            <p className="text-sm text-blue-700">Selecciona una habilidad de la lista para iniciar una breve prueba técnica. Si apruebas, se añadirá a tu perfil con el nivel correspondiente.</p>
                        </div>
                        <h4 className="font-semibold text-gray-700 mb-2">Mis Habilidades Validadas</h4>
                        {cvData.technicalSkills.length > 0 ? (
                            <div className="space-y-3 mb-6">
                               {cvData.technicalSkills.map(skill => (
                                   <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                       <div>
                                           <span className="font-medium">{skill.skill}</span>
                                           <span className="ml-4 text-sm text-gray-500">Años de Exp:</span>
                                           <input type="number" value={skill.experienceYears} onChange={e => handleDynamicSectionChange('technicalSkills', skill.id, 'experienceYears', e.target.value)} className="w-16 ml-2 text-sm p-1 border rounded" disabled={!isEditing} />
                                       </div>
                                       <div>
                                           <span className="font-semibold text-sm px-3 py-1 bg-green-100 text-green-800 rounded-full">{skill.level}</span>
                                           {isEditing && (<button onClick={() => removeDynamicSectionItem('technicalSkills', skill.id)} className="ml-3 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full"> <Trash2 className="w-4 h-4"/> </button>)}
                                       </div>
                                   </div>
                               ))}
                            </div>
                        ) : <p className="text-sm text-gray-500 text-center py-4 mb-4">Aún no tienes habilidades validadas.</p>}
                        {isEditing && (
                            <>
                                <h4 className="font-semibold text-gray-700 mb-3">Añadir Nueva Habilidad</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {mockData.availableSkills.map(skill => {
                                    const passedSkill = cvData.technicalSkills.find(s => s.skill === skill.name);
                                    const statusInfo = cvData.skillStatus.find(s => s.skill_id === skill.id);
                                    const isLocked = statusInfo?.status === 'locked' && new Date() < new Date(statusInfo.unlockDate);
                                    if (passedSkill) { return ( <div key={skill.id} className="p-3 border rounded-lg bg-green-50 flex items-center justify-between"> <span className="font-medium text-green-800">{skill.name}</span> <span className="flex items-center text-sm text-green-700"><Check className="w-4 h-4 mr-1"/> Validado</span> </div> ); }
                                    if (isLocked) { return ( <div key={skill.id} className="p-3 border rounded-lg bg-red-50 text-red-700"> <div className="flex items-center justify-between font-medium"> {skill.name} <Lock className="w-4 h-4"/> </div> <p className="text-xs mt-1">Bloqueado hasta: {formatDate(statusInfo.unlockDate)}</p> </div> ) }
                                    return ( <button key={skill.id} onClick={() => handleStartTest(skill)} className="p-3 border rounded-lg text-left hover:bg-gray-100 hover:border-blue-500 transition-colors flex items-center justify-between"> <span className="font-medium text-gray-800">{skill.name}</span> <span className="flex items-center px-3 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full"> <BrainCircuit className="w-4 h-4 mr-1"/> Iniciar Prueba </span> </button> );
                                })}
                                </div>
                            </>
                        )}
                    </Accordion>
                    <Accordion title="6. Habilidades Blandas">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {mockData.softSkills.map(skill => (
                                <label key={skill.id} className={`flex items-start p-3 border rounded-lg ${isEditing ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed bg-gray-50'}`}>
                                    <input type="checkbox" className={`h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 ${!isEditing ? 'cursor-not-allowed' : ''}`} checked={cvData.softSkills.includes(skill.id)} onChange={() => handleSoftSkillChange(skill.id)} disabled={!isEditing} />
                                    <div className="ml-3 text-sm">
                                        <span className="font-medium text-gray-900">{skill.name}</span>
                                        <p className="text-gray-500">{skill.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </Accordion>
                    <Accordion title="7. Certificaciones y Cursos"> <DynamicSection items={cvData.certifications} onChange={(id, field, value) => handleDynamicSectionChange('certifications', id, field, value)} onRemove={(id) => removeDynamicSectionItem('certifications', id)} onAdd={() => addDynamicSectionItem('certifications', { name: '', issuingBody: '', issueDate: '' })} fields={[ { name: 'name', label: 'Nombre del Curso/Certificación', type: 'text', required: true, grid: 'md:col-span-2' }, { name: 'issuingBody', label: 'Institución Emisora', type: 'text', required: true, grid: 'md:col-span-2' }, { name: 'issueDate', label: 'Fecha de Obtención', type: 'date' }, { name: 'attachment', label: 'Adjuntar Certificado (PDF/JPG)', type: 'file', accept: '.pdf, .jpg, .jpeg' }, ]} isEditing={isEditing} /> </Accordion>
                </div>
                 <div className="mt-8 flex justify-end gap-4">
                    {isEditing ? (
                        <>
                            <button onClick={handleCancel} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                            <button onClick={handleSave} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                                <Save className="w-4 h-4"/> Guardar Cambios
                            </button>
                        </>
                    ) : (
                        <button onClick={handleEdit} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 flex items-center gap-2">
                            <Edit className="w-4 h-4"/> Editar CV
                        </button>
                    )}
                 </div>
            </main>
        </div>
    );
}
