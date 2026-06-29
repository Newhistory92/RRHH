"use client"
import React, { useState, useEffect } from 'react';
import { TechnicalTests } from '@/app/Componentes/TestComponent/TechnicalTests';
import { Test, TestsByProfession, SoftSkill } from "@/app/Interfas/Interfaces";
import { apiClient } from '@/app/util/apiClient';

type ActiveTab = "technical";

export default function TestPage(){
  // Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>("technical");

  // Loading State
  const [loading, setLoading] = useState<boolean>(true);

  // Technical Tests State
  const [testsByProfession, setTestsByProfession] = useState<TestsByProfession>({});
  const [professions, setProfessions] = useState<{ [key: string]: number[] }>({});
  const [selectedProfession, setSelectedProfession] = useState<string>("Abogado");

  // Soft Skills State
  const [softSkills, setSoftSkills] = useState<SoftSkill[]>([]);

  // Fetch data on mount
  useEffect(() => {
    Promise.all([
      apiClient.get<{ professions: { [key: string]: number[] }, testsByProfession: TestsByProfession }>("/configtest/technical"),
      apiClient.get<SoftSkill[]>("/configtest/soft")
    ]).then(([techData, softData]) => {
      setProfessions(techData.professions);
      setTestsByProfession(techData.testsByProfession);
      const keys = Object.keys(techData.professions);
      if (keys.length > 0) {
        setSelectedProfession(keys[0]);
      }
      setSoftSkills(softData);
      setLoading(false);
    }).catch(err => {
      console.error("Error fetching test configuration:", err);
      setLoading(false);
    });
  }, []);

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
    apiClient.post<{ success: boolean, id: number }>(`/configtest/technical?profession=${encodeURIComponent(selectedProfession)}`, test)
      .then(res => {
        const savedTest = { ...test, id: String(res.id) };
        setTestsByProfession(prev => {
          const current = prev[selectedProfession] || [];
          // If updating, replace existing test; otherwise append
          const exists = current.some(t => t.id === test.id);
          const updated = exists 
            ? current.map(t => t.id === test.id ? savedTest : t)
            : [...current, savedTest];
          return {
            ...prev,
            [selectedProfession]: updated
          };
        });
      })
      .catch(err => {
        console.error("Error saving test:", err);
        alert("Error al guardar el test: " + err.message);
      });
  };

  const handleDeleteTest = (testId: string) => {
    apiClient.delete(`/configtest/technical/${testId}`)
      .then(() => {
        setTestsByProfession(prev => ({
          ...prev,
          [selectedProfession]: (prev[selectedProfession] || []).filter(
            test => test.id !== testId
          ),
        }));
      })
      .catch(err => {
        console.error("Error deleting test:", err);
        alert("Error al eliminar el test: " + err.message);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1ABCD7] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-semibold">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Gestión de Tests
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra tests técnicos para diferentes profesiones
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
                  {Object.keys(professions).length}
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
}