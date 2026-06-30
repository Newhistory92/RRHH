import React, { useState, useEffect } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Message } from 'primereact/message';
import { SkillCard } from '@/app/util/UiRRHH';
import { TechnicalSkill, SkillStatus, Skill, AcademicFormation, EmployeeTechnicalSkill, AcademicTitleMapping } from "@/app/Interfas/Interfaces"
import { SkillTestDialog} from './SkillTest';
import TestModal from '@/app/Componentes/Validaciones/TestModal';
import { apiClient } from '@/app/util/apiClient';

// Props del componente HabilidadesTecnicas
export type HabilidadesTecnicasProps = {
  data: EmployeeTechnicalSkill[];
  skillStatus: SkillStatus[];
  academicFormation: AcademicFormation[];
  updateData: (technicalSkills: EmployeeTechnicalSkill[], skillStatus: SkillStatus[]) => void;
  isEditing: boolean;
  position: string;
  employeeId: number;
  headerActions?: React.ReactNode;
};

export default function HabilidadesTecnicas({
    data,
    skillStatus,
    academicFormation = [],
    updateData,
    isEditing,
    position,
    employeeId,
    headerActions
}: HabilidadesTecnicasProps) {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [dbSkills, setDbSkills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTestModalVisible, setIsTestModalVisible] = useState(false);
    const [selectedSkillForTest, setSelectedSkillForTest] = useState<Skill | null>(null);
    
    // Estado para el TestModal (validacion con IA via API)
    const [testModalVisible, setTestModalVisible] = useState(false);
    const [selectedSkillForAITest, setSelectedSkillForAITest] = useState<{ id: number; nombre: string } | null>(null);

    // Mapeo titulo academico -> profesion, cargado desde /configtest/academic-title-mappings
    const [titleMappings, setTitleMappings] = useState<Record<string, string>>({});

    // 1. Cargar habilidades disponibles desde la DB
    const fetchDbSkills = async () => {
        if (!employeeId) return;
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://127.0.0.1:8000/tests/skills/${employeeId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const resData = await response.json();
            if (resData.skills) {
                setDbSkills(resData.skills);
            }
        } catch (error) {
            console.error("Error cargando habilidades de la DB:", error);
        } finally {
            setLoading(false);
        }
    };

    // 1b. Cargar el mapeo titulo academico -> profesion
    const fetchTitleMappings = async () => {
        try {
            const res = await apiClient.get<{ mappings: AcademicTitleMapping[] }>('/configtest/academic-title-mappings');
            const map: Record<string, string> = {};
            res.mappings.forEach(m => { map[m.tituloAcademico] = m.profession; });
            setTitleMappings(map);
        } catch (error) {
            console.error("Error cargando mapeo de titulos academicos:", error);
        }
    };

    useEffect(() => {
        fetchDbSkills();
        fetchTitleMappings();
    }, [employeeId]);

    // 2. Calcular habilidades relevantes basadas en títulos y posición
    useEffect(() => {
        if (loading) return;

        // Títulos a buscar (Posición + Títulos Académicos)
        const titlesToMap = new Set<string>();
        if (position) titlesToMap.add(position.trim());
        
        academicFormation.forEach(record => {
            if (record.title) {
                // Aplicar mapeo configurado (TestConfig) si existe, sino usar el título original
                const mappedTitle = titleMappings[record.title.trim()] || record.title.trim();
                titlesToMap.add(mappedTitle);
            }
        });

        // Habilidades finales a mostrar
        const finalSkills: Skill[] = [];
        const processedSkillNames = new Set<string>();

        // A. Buscar coincidencias en la DB
        titlesToMap.forEach(title => {
            const dbSkill = dbSkills.find(s => 
                s.nombre.toLowerCase() === title.toLowerCase() || 
                s.profession?.toLowerCase() === title.toLowerCase()
            );

            if (dbSkill) {
                processedSkillNames.add(dbSkill.nombre.toLowerCase());
                
                // Verificar si ya está validada (existe en 'data' que viene del profile)
                const validatedSkill = data?.find(ts => ts.technicalSkillId === dbSkill.id);
                
                finalSkills.push({
                    id: dbSkill.id,
                    name: dbSkill.nombre,
                    description: dbSkill.description || `Validación para ${dbSkill.nombre}`,
                    status: validatedSkill?.certified ? 'validated' : 'pending',
                    level: 0,
                    unlockDate: null,
                    isVirtual: false
                });
            } else {
                // B. Si no existe en DB, crear una habilidad "VIRTUAL"
                // Solo si no la procesamos ya (evitar duplicados si título y posición son iguales)
                if (!processedSkillNames.has(title.toLowerCase())) {
                    finalSkills.push({
                        id: Math.floor(Math.random() * -10000), // ID temporal negativo
                        name: title,
                        description: `Test generado por IA para: ${title}`,
                        status: 'pending',
                        level: 0,
                        unlockDate: null,
                        isVirtual: true
                    });
                    processedSkillNames.add(title.toLowerCase());
                }
            }
        });

        // Si no hay ninguna habilidad relevante, mostrar todas las de la DB (fallback)
        if (finalSkills.length === 0 && dbSkills.length > 0) {
            dbSkills.forEach(dbSkill => {
                const validatedSkill = data?.find(ts => ts.technicalSkillId === dbSkill.id);
                finalSkills.push({
                    id: dbSkill.id,
                    name: dbSkill.nombre,
                    description: dbSkill.description || `Validación para ${dbSkill.nombre}`,
                    status: (validatedSkill?.certified || dbSkill.certified) ? 'validated' : 'pending',
                    level: 0,
                    unlockDate: null,
                    isVirtual: false
                });
            });
        }

        setSkills(finalSkills);
    }, [position, academicFormation, dbSkills, data, loading, titleMappings]);

    const handleStartTest = async (skill: Skill) => {
        if (skill.status === 'locked') return;

        let finalSkillId = skill.id;
        let finalSkillName = skill.name;

        // Si la habilidad es VIRTUAL, debemos asegurarla en la DB primero
        if (skill.isVirtual) {
            try {
                const res = await fetch('/api/technical-skills/ensure', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: skill.name })
                });
                const result = await res.json();
                if (result.success && result.skill) {
                    finalSkillId = result.skill.id;
                    finalSkillName = result.skill.nombre;
                } else {
                    throw new Error("No se pudo crear la habilidad en la DB");
                }
            } catch (error) {
                console.error("Error asegurando habilidad:", error);
                return;
            }
        }

        // Abrir el TestModal con el ID real de la DB
        setSelectedSkillForAITest({ id: finalSkillId, nombre: finalSkillName });
        setTestModalVisible(true);
    };

    const handleTestComplete = (skill: Skill, score: number) => {
        // Implementación simplificada para el test local si se llega a usar
        setIsTestModalVisible(false);
        setSelectedSkillForTest(null);
        // Recargar habilidades o actualizar estado según sea necesario
    };

    const validatedSkills = skills.filter(s => s.status === 'validated');
    const pendingSkills = skills.filter(s => s.status !== 'validated');

    return (
        <>
            <Accordion activeIndex={0}>
                <AccordionTab header={
                    <div className="flex items-center justify-between w-full pr-2">
                      <span>5. Habilidades Tecnicas</span>
                      {headerActions && <span onClick={(e) => e.stopPropagation()}>{headerActions}</span>}
                    </div>
                  }>
                    <div className="p-4">
                        {!isEditing && (
                            <Message 
                                severity="info" 
                                text="Activa el modo de edicion para validar nuevas habilidades." 
                                className="mb-6 w-full" 
                            />
                        )}

                        {loading ? (
                            <p className="text-muted-foreground italic">Cargando habilidades...</p>
                        ) : (
                            <>
                                {/* Seccion de Habilidades Validadas */}
                                <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
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
                                    <p className="text-muted-foreground italic mb-6">
                                        Aun no tienes habilidades validadas.
                                    </p>
                                )}

                                {/* Seccion de Habilidades por Validar (solo en modo edicion) */}
                                {isEditing && (
                                    <div className="mt-8">
                                        <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
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
                                            <p className="text-muted-foreground italic">
                                                No hay mas habilidades disponibles para validar.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </AccordionTab>
            </Accordion>
            
            {/* Modal de Test local (SkillTestDialog) */}
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

            {/* Modal de Test con IA (TestModal) */}
            {selectedSkillForAITest && (
                <TestModal
                    visible={testModalVisible}
                    onHide={() => {
                        setTestModalVisible(false);
                        setSelectedSkillForAITest(null);
                    }}
                    onSuccess={() => {
                        fetchDbSkills();
                    }}
                    technicalSkill={selectedSkillForAITest}
                    employeeId={employeeId}
                />
            )}
        </>
    );
}