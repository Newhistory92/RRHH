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
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="text-center bg-card p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-semibold">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
            Gestión de Tests
          </h1>
          <p className="text-muted-foreground">
            Administra tests técnicos para diferentes profesiones
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab("technical")}
            className={`px-4 py-2 font-semibold transition-colors duration-200 ${
              activeTab === "technical"
                ? "border-b-2 border-primary text-primary  text-shadow-md"
                : "text-muted-foreground hover:text-primary text-shadow-md"
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
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Profesiones
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {Object.keys(professions).length}
                </p>
              </div>
              <div className="bg-primary/15 p-3 rounded-full">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tests Técnicos
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {Object.values(testsByProfession).flat().length}
                </p>
              </div>
              <div className="bg-accent/15 p-3 rounded-full">
                <span className="text-2xl">🧪</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Habilidades Blandas
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {softSkills.length}
                </p>
              </div>
              <div className="bg-warm-contrast/15 p-3 rounded-full">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}