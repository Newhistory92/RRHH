// import React, { useState } from 'react';
// import { Lock, Check, BrainCircuit } from 'lucide-react';
// import { formatDate } from '@/app/util/UiCv';
// import { SkillTestModal } from '@/app/Componentes/Perfil/SkillTest';
// import { AVAILABLE_SKILLS } from '@/app/api/prueba2';
// import SkillTecnico from '@/app/Componentes/Perfil/SkillTecnit';
// import {Employee,CvProps} from "@/app/Interfas/Interfaces"
// import { Accordion, AccordionTab } from 'primereact/accordion';


// export default function HabilidadesTecnicas({ data, skillStatus, updateData, isEditing }: CvProps) {
//   const [isTestModalOpen, setIsTestModalOpen] = useState(false);
//   const [skillToTest, setSkillToTest] = useState(null);

//   const handleStartTest = (skill) => {
//     setSkillToTest(skill);
//     setIsTestModalOpen(true);
//   };

//   const handleRemove = (id) => {
//     const newData = data.filter((item) => item.id !== id);
//     updateData(newData, skillStatus);
//   };

//   const handleExperienceChange = (id, years) => {
//     const newData = data.map((item) =>
//       item.id === id ? { ...item, experienceYears: years } : item
//     );
//     updateData(newData, skillStatus);
//   };

//   const handleTestComplete = (skill, score) => {
//     setIsTestModalOpen(false);
//     setSkillToTest(null);
    
//     if (score >= 70) {
//       let level = score >= 85 ? 10 : score >= 70 ? 7 : 5;
      
//       const newSkill = { 
//         id: Date.now(), 
//         name: skill.name, 
//         level: level,
//         experienceYears: 0
//       };
      
//       const newData = [...data, newSkill];
//       const newStatus = { skill_id: skill.id, status: "passed" };
//       const newSkillStatus = [
//         ...skillStatus.filter((s) => s.skill_id !== skill.id),
//         newStatus,
//       ];
      
//       updateData(newData, newSkillStatus);
//     } else {
//       const unlockDate = new Date();
//       unlockDate.setMonth(unlockDate.getMonth() + 3);
//       const newStatus = { skill_id: skill.id, status: "locked", unlockDate };
//       const newSkillStatus = [
//         ...skillStatus.filter((s) => s.skill_id !== skill.id),
//         newStatus,
//       ];
      
//       updateData(data, newSkillStatus);
//     }
//   };

//   return (

//     <Accordion activeIndex={0}>
//     <AccordionTab header="5. Habilidades Técnicas">
//       {isTestModalOpen && (
//         <SkillTestModal
//           skill={skillToTest}
//           onClose={() => setIsTestModalOpen(false)}
//           onTestComplete={handleTestComplete}
//         />
//       )}
      
//       <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//         <h4 className="font-semibold text-blue-800">
//           Valida tus habilidades
//         </h4>
//         <p className="text-sm text-blue-700">
//           Selecciona una habilidad de la lista para iniciar una breve
//           prueba técnica. Si apruebas, se añadirá a tu perfil con el nivel
//           correspondiente.
//         </p>
//       </div>
      
//       <h4 className="font-semibold text-gray-700 mb-2">
//         Mis Habilidades Validadas
//       </h4>
      
//       <SkillTecnico
//         skills={data}
//         isEditing={isEditing}
//         onRemove={handleRemove}
//         onExperienceChange={handleExperienceChange}
//       />
      
//       {isEditing && (
//         <>
//           <h4 className="font-semibold text-gray-700 mb-3">
//             Añadir Nueva Habilidad
//           </h4>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {AVAILABLE_SKILLS.map((skill) => {
//               const passedSkill = data.find(
//                 (s) => s.name === skill.name
//               );
//               const statusInfo = skillStatus.find(
//                 (s) => s.skill_id === skill.id
//               );
//               const isLocked =
//                 statusInfo?.status === "locked" &&
//                 new Date() < new Date(statusInfo.unlockDate);
              
//               if (passedSkill) {
//                 return (
//                   <div
//                     key={skill.id}
//                     className="p-3 border rounded-lg bg-green-50 flex items-center justify-between"
//                   >
//                     <span className="font-medium text-green-800">
//                       {skill.name}
//                     </span>
//                     <span className="flex items-center text-sm text-green-700">
//                       <Check className="w-4 h-4 mr-1" /> Validado
//                     </span>
//                   </div>
//                 );
//               }
              
//               if (isLocked) {
//                 return (
//                   <div
//                     key={skill.id}
//                     className="p-3 border rounded-lg bg-red-50 text-red-700"
//                   >
//                     <div className="flex items-center justify-between font-medium">
//                       {skill.name} <Lock className="w-4 h-4" />
//                     </div>
//                     <p className="text-xs mt-1">
//                       Bloqueado hasta: {formatDate(statusInfo.unlockDate)}
//                     </p>
//                   </div>
//                 );
//               }
              
//               return (
//                 <button
//                   key={skill.id}
//                   onClick={() => handleStartTest(skill)}
//                   className="p-3 border rounded-lg text-left hover:bg-gray-100 hover:border-blue-500 transition-colors flex items-center justify-between"
//                 >
//                   <span className="font-medium text-gray-800">
//                     {skill.name}
//                   </span>
//                   <span className="flex items-center px-3 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full">
//                     <BrainCircuit className="w-4 h-4 mr-1" /> Iniciar Prueba
//                   </span>
//                 </button>
//               );
//             })}
//           </div>
//         </>
//       )}
//       </AccordionTab>
//     </Accordion>
//   );
// }

import React, { useState, useEffect } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Message } from 'primereact/message';
import { AVAILABLE_SKILLS, initialProfessions} from '@/app/api/prueba2';
import { SkillCard } from '@/app/util/UiRRHH';
import { TechnicalSkill, SkillStatus} from "@/app/Interfas/Interfaces"
import { SkillTestDialog } from '../Perfil/SkillTest';




type Skill = {
    id: number;
    name: string;
    description: string;
    status: 'validated' | 'pending' | 'locked';
    level: number;
    unlockDate: string | null;
};

type HabilidadesTecnicasProps = {
    data: TechnicalSkill[];
    skillStatus: SkillStatus[];
    updateData: (technicalSkills: TechnicalSkill[], skillStatus: SkillStatus[]) => void;
    isEditing: boolean;
    position: string; // Posición del empleado para filtrar habilidades relevantes
};

export default function HabilidadesTecnicas({ 
    data, 
    skillStatus, 
    updateData, 
    isEditing, 
    position 
}: HabilidadesTecnicasProps) {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isTestModalVisible, setIsTestModalVisible] = useState(false);
    const [selectedSkillForTest, setSelectedSkillForTest] = useState<Skill | null>(null);
console.log (skillStatus)
    useEffect(() => {
        if (!position) {
            setSkills([]);
            return;
        }

        // Obtener los IDs de habilidades relevantes para esta posición
        const relevantSkillIds = initialProfessions[position.trim()] || [];
        
        if (relevantSkillIds.length === 0) {
            console.warn(`No se encontraron habilidades específicas para el puesto: "${position}"`);
            setSkills([]);
            return;
        }

        // Mapear cada ID a la información completa de la habilidad
        const processedSkills = relevantSkillIds.map(skillId => {
            const skillDetail = AVAILABLE_SKILLS.find(s => s.id === skillId);
            
            if (!skillDetail) {
                console.warn(`Habilidad con ID ${skillId} no encontrada en AVAILABLE_SKILLS`);
                return null;
            }

            // Verificar si ya está validada (existe en data)
            const validatedSkill = data.find(ts => ts.id === skillId);
            if (validatedSkill) {
                return {
                    id: skillId,
                    name: skillDetail.name,
                    description: `Habilidad técnica para ${position}`,
                    status: 'validated' as const,
                    level: validatedSkill.level,
                    unlockDate: null
                };
            }

            // Verificar si está bloqueada
            const statusInfo = skillStatus.find(ss => ss.skill_id === skillId);
            if (statusInfo?.status === 'locked' && statusInfo.unlockDate) {
                const unlockDate = new Date(statusInfo.unlockDate);
                if (new Date() < unlockDate) {
                    return {
                        id: skillId,
                        name: skillDetail.name,
                        description: `Habilidad técnica para ${position}`,
                        status: 'locked' as const,
                        level: 0,
                        unlockDate: statusInfo.unlockDate
                    };
                }
            }

            // Habilidad disponible para evaluar
            return {
                id: skillId,
                name: skillDetail.name,
                description: `Habilidad técnica para ${position}`,
                status: 'pending' as const,
                level: 0,
                unlockDate: null
            };
        }).filter(Boolean) as Skill[];

        console.log(`Habilidades procesadas para ${position}:`, processedSkills);
        setSkills(processedSkills);
    }, [position, data, skillStatus]);

    const handleStartTest = (skill: Skill) => {
        if (skill.status === 'locked') {
            console.log('Esta habilidad está bloqueada hasta:', skill.unlockDate);
            return;
        }
        setSelectedSkillForTest(skill);
        setIsTestModalVisible(true);
    };

    const handleTestComplete = (skill: Skill, score: number) => {
        let newTechnicalSkills = [...data];
        let newSkillStatus = skillStatus.filter(ss => ss.skill_id !== skill.id);
        
        // Determinar si aprobó (score >= 70 equivale a "Bueno" o "Avanzado")
        const success = score >= 70;
        
        if (success) {
            // Determinar el nivel basado en el score
            let level: number;
            if (score >= 90) {
                level = 9; // Avanzado
            } else if (score >= 80) {
                level = 8; // Bueno alto
            } else {
                level = 7; // Bueno
            }

            // Agregar o actualizar la habilidad validada
            const existingSkillIndex = newTechnicalSkills.findIndex(ts => ts.id === skill.id);
            const newSkill: TechnicalSkill = { 
                id: skill.id, 
                name: skill.name, 
                level: level 
            };

            if (existingSkillIndex >= 0) {
                newTechnicalSkills[existingSkillIndex] = newSkill;
            } else {
                newTechnicalSkills.push(newSkill);
            }

            // Marcar como aprobada y bloquear por 3 meses
            const unlockDate = new Date();
            unlockDate.setMonth(unlockDate.getMonth() + 3);
            newSkillStatus.push({ 
                skill_id: skill.id, 
                status: 'passed',
                unlockDate: unlockDate.toISOString()
            });
        } else {
            // Falló el test, bloquear por 3 meses sin validar
            const unlockDate = new Date();
            unlockDate.setMonth(unlockDate.getMonth() + 3);
            newSkillStatus.push({ 
                skill_id: skill.id, 
                status: 'locked', 
                unlockDate: unlockDate.toISOString() 
            });
        }

        updateData(newTechnicalSkills, newSkillStatus);
        setIsTestModalVisible(false);
        setSelectedSkillForTest(null);
    };

    // Separar habilidades validadas de las pendientes
    const validatedSkills = skills.filter(s => s.status === 'validated');
    const pendingSkills = skills.filter(s => s.status !== 'validated');

    return (
        <>
            <Accordion activeIndex={0}>
                <AccordionTab header="5. Habilidades Técnicas">
                    <div className="p-4">
                        {!isEditing && (
                            <Message 
                                severity="info" 
                                text="Activa el modo de edición para validar nuevas habilidades." 
                                className="mb-6 w-full" 
                            />
                        )}

                        {/* Sección de Habilidades Validadas */}
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Habilidades Validadas
                        </h3>
                        {validatedSkills.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {validatedSkills.map(skill => (
                                    <SkillCard 
                                        key={skill.id} 
                                        skill={skill} 
                                        onStartTest={handleStartTest} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic mb-6">
                                Aún no tienes habilidades validadas.
                            </p>
                        )}

                        {/* Sección de Habilidades por Validar (solo en modo edición) */}
                        {isEditing && (
                            <div className="mt-8">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                    Habilidades por Validar
                                </h3>
                                {pendingSkills.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {pendingSkills.map(skill => (
                                            <SkillCard 
                                                key={skill.id} 
                                                skill={skill} 
                                                onStartTest={handleStartTest}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">
                                        No hay más habilidades disponibles para validar en tu puesto.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Mostrar información de debug en desarrollo */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm">
                                <p><strong>Debug Info:</strong></p>
                                <p>Posición: {position}</p>
                                <p>Habilidades para esta posición: {initialProfessions[position]?.join(', ') || 'Ninguna'}</p>
                                <p>Total habilidades cargadas: {skills.length}</p>
                                <p>Validadas: {validatedSkills.length}, Pendientes: {pendingSkills.length}</p>
                            </div>
                        )}
                    </div>
                </AccordionTab>
            </Accordion>
            
            {/* Modal de Test */}
            <SkillTestDialog 
                isVisible={isTestModalVisible}
                skill={selectedSkillForTest}
                position={position}
                onClose={() => {
                    setIsTestModalVisible(false);
                    setSelectedSkillForTest(null);
                }}
                onTestComplete={handleTestComplete}
            />
        </>
    );
}