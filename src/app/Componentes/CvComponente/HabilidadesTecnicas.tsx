
import React, { useState, useEffect } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Message } from 'primereact/message';
import { AVAILABLE_SKILLS, initialProfessions} from '@/app/api/prueba2';
import { SkillCard } from '@/app/util/UiRRHH';
import { TechnicalSkill, SkillStatus,Skill,SoftSkillCatalog} from "@/app/Interfas/Interfaces"
import { SkillTestDialog} from './SkillTest';



// Props del componente HabilidadesTecnicas
export type HabilidadesTecnicasProps = {
  data: TechnicalSkill[];
  skillStatus: SkillStatus[];
  updateData: (technicalSkills: TechnicalSkill[], skillStatus: SkillStatus[]) => void;
  isEditing: boolean;
  position: string;
};

// Props para el SkillCard component
export interface SkillCardProps {
  skill: Skill;
  onStartTest: (skill: Skill) => void;
}



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
    
    console.log('skillStatus:', skillStatus);
    console.log('data:', data);

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
        const processedSkills: Skill[] = relevantSkillIds.map((skillId: number) => {
            const skillDetail = (AVAILABLE_SKILLS as SoftSkillCatalog[]).find(s => s.id === skillId);
            
            if (!skillDetail) {
                console.warn(`Habilidad con ID ${skillId} no encontrada en AVAILABLE_SKILLS`);
                return null;
            }

            // Verificar si ya está validada (existe en data)
            const validatedSkill = data.find(ts => ts.id === skillId);
            if (validatedSkill) {
                return {
                    id: skillId,
                    name: skillDetail.nombre,
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
                        name: skillDetail.nombre,
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
        name: skillDetail.nombre,
        description: `Habilidad técnica para ${position}`,
        status: 'pending' as const,
        level: 0,
        unlockDate: null
         } as Skill; 
        }).filter((skill): skill is Skill => skill !== null); 
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
        const newTechnicalSkills = [...data];
        const newSkillStatus = skillStatus.filter(ss => ss.skill_id !== skill.id);
        
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
                nombre: skill.name, 
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
            
            const newStatus: SkillStatus = {
                id: Date.now(), // Generar un ID temporal
                employee_id: 1, // Debería venir del contexto del empleado actual
                skill_id: skill.id, 
                status: 'passed', // Agregamos 'passed' al tipo SkillStatus
                unlockDate: unlockDate.toISOString()
            };
            
            newSkillStatus.push(newStatus);
        } else {
            // Falló el test, bloquear por 3 meses sin validar
            const unlockDate = new Date();
            unlockDate.setMonth(unlockDate.getMonth() + 3);
            
            const newStatus: SkillStatus = {
                id: Date.now(), // Generar un ID temporal
                employee_id: 1, // Debería venir del contexto del empleado actual
                skill_id: skill.id, 
                status: 'locked', 
                unlockDate: unlockDate.toISOString() 
            };
            
            newSkillStatus.push(newStatus);
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