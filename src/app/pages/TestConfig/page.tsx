import React, { useState} from 'react';
import {  X as CloseIcon } from 'lucide-react';
import { Card } from 'primereact/card';
type Test = {
  name: string;
  description: string;
  type: 'multiple-choice' | 'case-study';
};
type TestsByProfession = {
  [key: string]: Test[];
};

type SoftSkill = {
  name: string;
  description: string;
};
export const TestPage = () => {
  const [activeTab, setActiveTab] = useState<'technical' | 'soft-skills'>('technical');
  
  // State for Technical Tests
  const [testsByProfession, setTestsByProfession] = useState<TestsByProfession>({
    'Contador': [
      { name: 'Conocimientos Contables', description: 'Evaluación sobre Normas NIIF, liquidación de sueldos y balances.', type: 'multiple-choice' },
      { name: 'Excel Avanzado', description: 'Uso de tablas dinámicas, fórmulas financieras y macros.', type: 'case-study' },
      { name: 'Legislación Tributaria Argentina', description: 'Comprensión de normativas de AFIP, IVA e Impuesto a las Ganancias.', type: 'multiple-choice' },
    ]
  });
  const [profession, setProfession] = useState('');
  const [currentTests, setCurrentTests] = useState<Test[]>([{ name: '', description: '', type: 'multiple-choice' }]);

  // State for Soft Skills
  const [softSkills, setSoftSkills] = useState<SoftSkill[]>([
    { name: 'Comunicación Efectiva', description: 'Habilidad para transmitir ideas de forma clara y concisa.' },
    { name: 'Trabajo en Equipo', description: 'Capacidad para colaborar con otros para alcanzar un objetivo común.' },
    { name: 'Resolución de Problemas', description: 'Aptitud para identificar problemas y encontrar soluciones eficientes.' },
  ]);
  const [newSoftSkill, setNewSoftSkill] = useState<SoftSkill>({ name: '', description: '' });


  const handleTestChange = (index: number, field: keyof Test, value: string) => {
    const newTests = [...currentTests];
    newTests[index] = { ...newTests[index], [field]: value };
    setCurrentTests(newTests);
  };

  const addTestField = () => {
    setCurrentTests([...currentTests, { name: '', description: '', type: 'multiple-choice' }]);
  };
  
  const removeTestField = (index: number) => {
    const newTests = currentTests.filter((_, i) => i !== index);
    setCurrentTests(newTests);
  };

  const handleTechnicalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profession.trim() || currentTests.some(t => !t.name.trim() || !t.description.trim())) return;
    setTestsByProfession(prev => ({ ...prev, [profession]: [...(prev[profession] || []), ...currentTests] }));
    setProfession('');
    setCurrentTests([{ name: '', description: '', type: 'multiple-choice' }]);
  };
  
  const handleSoftSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSoftSkill.name.trim() || !newSoftSkill.description.trim()) return;
    setSoftSkills(prev => [...prev, newSoftSkill]);
    setNewSoftSkill({ name: '', description: '' });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Gestión de Tests</h2>
      
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button onClick={() => setActiveTab('technical')} className={`px-4 py-2 font-semibold transition-colors duration-200 ${activeTab === 'technical' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}>
            Tests Técnicos
        </button>
        <button onClick={() => setActiveTab('soft-skills')} className={`px-4 py-2 font-semibold transition-colors duration-200 ${activeTab === 'soft-skills' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}>
            Soft Skills
        </button>
      </div>

      {activeTab === 'technical' && (
        <div>
          <Card className="mb-6">
            <h3 className="font-bold text-xl mb-4 text-gray-700 dark:text-gray-200">Crear Nuevos Tests Técnicos</h3>
            <form onSubmit={handleTechnicalSubmit} className="space-y-6">
              <div>
                <label htmlFor="profession" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profesión</label>
                <input type="text" id="profession" value={profession} onChange={(e) => setProfession(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Ej: Contador" required/>
              </div>
              {currentTests.map((test, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4 relative">
                  <h4 className="font-semibold text-gray-600 dark:text-gray-400">Test #{index + 1}</h4>
                  {currentTests.length > 1 && (<button type="button" onClick={() => removeTestField(index)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><CloseIcon size={16}/></button>)}
                  <div><label htmlFor={`test-name-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Test</label><input type="text" id={`test-name-${index}`} value={test.name} onChange={(e) => handleTestChange(index, 'name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required /></div>
                  <div><label htmlFor={`test-desc-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label><textarea id={`test-desc-${index}`} value={test.description} onChange={(e) => handleTestChange(index, 'description', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={2} required></textarea></div>
                  <div><label htmlFor={`test-type-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label><select id={`test-type-${index}`} value={test.type} onChange={(e) => handleTestChange(index, 'type', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"><option value="multiple-choice">Multiple Choice</option><option value="case-study">Caso de Estudio</option></select></div>
                </div>
              ))}
              <div className="flex items-center justify-between"><button type="button" onClick={addTestField} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors">Añadir otro Test</button><button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Guardar Tests</button></div>
            </form>
          </Card>
          <Card>
            <h3 className="font-bold text-xl mb-4 text-gray-700 dark:text-gray-200">Tests Técnicos Existentes</h3>
            <div className="space-y-6">
              {Object.keys(testsByProfession).length === 0 && <p className="text-gray-500 dark:text-gray-400">Aún no se han creado tests.</p>}
              {Object.keys(testsByProfession).map(prof => (
                <div key={prof}><h4 className="text-lg font-bold text-blue-500 dark:text-blue-400 mb-2">{prof}</h4><ul className="space-y-3">{testsByProfession[prof].map((test, index) => (<li key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><div className="flex justify-between items-start"><div><p className="font-semibold text-gray-800 dark:text-white">{test.name}</p><p className="text-sm text-gray-600 dark:text-gray-400">{test.description}</p></div><span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${test.type === 'multiple-choice' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>{test.type === 'multiple-choice' ? 'Multiple Choice' : 'Caso de Estudio'}</span></div></li>))}</ul></div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'soft-skills' && (
        <div>
          <Card className="mb-6">
            <h3 className="font-bold text-xl mb-4 text-gray-700 dark:text-gray-200">Añadir Nueva Soft Skill</h3>
            <form onSubmit={handleSoftSkillSubmit} className="space-y-4">
              <div><label htmlFor="softskill-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de la Soft Skill</label><input type="text" id="softskill-name" value={newSoftSkill.name} onChange={(e) => setNewSoftSkill({...newSoftSkill, name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required /></div>
              <div><label htmlFor="softskill-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label><textarea id="softskill-desc" value={newSoftSkill.description} onChange={(e) => setNewSoftSkill({...newSoftSkill, description: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={2} required></textarea></div>
              <div className="text-right"><button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Guardar Soft Skill</button></div>
            </form>
          </Card>
          <Card>
            <h3 className="font-bold text-xl mb-4 text-gray-700 dark:text-gray-200">Soft Skills Existentes</h3>
            <div className="space-y-3">
              {softSkills.length === 0 && <p className="text-gray-500 dark:text-gray-400">Aún no se han creado soft skills.</p>}
              {softSkills.map((skill, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="font-semibold text-gray-800 dark:text-white">{skill.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{skill.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
