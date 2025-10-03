"use client"
import React, { useState } from 'react';
import { TechnicalTests } from '@/app/Componentes/TestComponent/TechnicalTests';
import { SoftSkills } from '@/app/Componentes/TestComponent/SoftSkills';
import { initialProfessions, initialTestsByProfession,SOFT_SKILLS_CATALOG} from '@/app/api/prueba2';
import { Test,TestsByProfession, SoftSkill } from "@/app/Interfas/Interfaces";

type ActiveTab = "technical" | "soft-skills";

export default function TestPage(){
  // Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>("technical");

  // Technical Tests State
  const [testsByProfession, setTestsByProfession] = useState<TestsByProfession>(
    initialTestsByProfession
  );
  const [professions, setProfessions] = useState<{ [key: string]: number[] }>(initialProfessions);
  const [selectedProfession, setSelectedProfession] = useState<string>(
    Object.keys(initialProfessions)[0]
  );

  // Soft Skills State
  const [softSkills, setSoftSkills] = useState<SoftSkill[]>(SOFT_SKILLS_CATALOG);

  // Technical Tests Handlers
  const handleSelectedProfessionChange = (profession: string) => {
    setSelectedProfession(profession);
  };

  const handleAddProfession = (newProfession: { [key: string]: number[] }) => {
    setProfessions(prev => ({ ...prev, ...newProfession }));
    // Initialize empty tests array for new profession
    setTestsByProfession(prev => ({
      ...prev,
      [Object.keys(newProfession)[0]]: []
    }));
  };

  const handleSaveTest = (test: Test) => {
    setTestsByProfession(prev => ({
      ...prev,
      [selectedProfession]: [...(prev[selectedProfession] || []), test],
    }));
  };

  const handleDeleteTest = (testId: string) => {
    setTestsByProfession(prev => ({
      ...prev,
      [selectedProfession]: (prev[selectedProfession] || []).filter(
        test => test.id !== testId
      ),
    }));
  };

  // Soft Skills Handlers
  const handleAddSoftSkill = (skill: SoftSkill) => {
    setSoftSkills(prev => [...prev, skill]);
  };

  const handleDeleteSoftSkill = (index: number) => {
    setSoftSkills(prev => prev.filter((_, i) => i !== index));
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Gestión de Tests
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra tests técnicos y habilidades blandas para diferentes profesiones
          </p>
        </div>

        {/* Tab Navigation */}
        
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
             <button
          onClick={() => setActiveTab("technical")}
          className={`px-4 py-2 font-semibold transition-colors duration-200 ${
            activeTab === "technical"
              ? "border-b-2 border-[#2ecbe7] text-[#1ABCD7]  text-shadow-md"
              : "text-gray-500 hover:text-blue-500 text-shadow-md"
          }`}
         >
          🧪 Tests Técnicos
         </button>
         <button
          onClick={() => setActiveTab("soft-skills")}
          className={`px-4 py-2 font-semibold transition-colors duration-200 ${
            activeTab === "soft-skills"
              ? "border-b-2 border-[#2ecbe7] text-[#1ABCD7]  text-shadow-md"
              : "text-gray-500 hover:text-blue-500 text-shadow-md"
          }`}
         >
         🎯 Habilidades Blandas
         </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "technical" && (
              <TechnicalTests
                testsByProfession={testsByProfession}
                professions={professions}
                selectedProfession={selectedProfession}
                onSelectedProfessionChange={handleSelectedProfessionChange}
                onAddProfession={handleAddProfession}
                onSaveTest={handleSaveTest}
                onDeleteTest={handleDeleteTest}
              />
            )}

            {activeTab === "soft-skills" && (
              <SoftSkills
                softSkills={softSkills}
                onAddSoftSkill={handleAddSoftSkill}
                onDeleteSoftSkill={handleDeleteSoftSkill}
              />
            )}
          
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Profesiones
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {professions.length}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tests Técnicos
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.values(testsByProfession).flat().length}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <span className="text-2xl">🧪</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Habilidades Blandas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {softSkills.length}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};