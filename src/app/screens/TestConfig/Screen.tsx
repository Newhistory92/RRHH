"use client"
import React, { useState, useEffect } from 'react';
import { TechnicalTests } from '@/app/Componentes/TestComponent/TechnicalTests';
import { Test, TestsByProfession, SoftSkill, AcademicTitleMapping } from "@/app/Interfas/Interfaces";
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

  // Academic Title Mappings State
  const [titleMappings, setTitleMappings] = useState<AcademicTitleMapping[]>([]);
  const [newTitulo, setNewTitulo] = useState("");
  const [newProfession, setNewProfession] = useState("");

  // Fetch data on mount
  useEffect(() => {
    Promise.all([
      apiClient.get<{ professions: { [key: string]: number[] }, testsByProfession: TestsByProfession }>("/configtest/technical"),
      apiClient.get<SoftSkill[]>("/configtest/soft"),
      apiClient.get<{ mappings: AcademicTitleMapping[] }>("/configtest/academic-title-mappings")
    ]).then(([techData, softData, mappingsData]) => {
      setProfessions(techData.professions);
      setTestsByProfession(techData.testsByProfession);
      const keys = Object.keys(techData.professions);
      if (keys.length > 0) {
        setSelectedProfession(keys[0]);
      }
      setSoftSkills(softData);
      setTitleMappings(mappingsData.mappings);
      setLoading(false);
    }).catch(err => {
      console.error("Error fetching test configuration:", err);
      setLoading(false);
    });
  }, []);

  // Academic Title Mapping Handlers
  const handleAddTitleMapping = () => {
    if (!newTitulo.trim() || !newProfession.trim()) return;
    apiClient.post<{ success: boolean }>("/configtest/academic-title-mappings", {
      tituloAcademico: newTitulo.trim(),
      profession: newProfession.trim(),
    }).then(() => {
      return apiClient.get<{ mappings: AcademicTitleMapping[] }>("/configtest/academic-title-mappings");
    }).then(res => {
      setTitleMappings(res.mappings);
      setNewTitulo("");
      setNewProfession("");
    }).catch(err => {
      console.error("Error al guardar mapeo:", err);
      alert("Error al guardar el mapeo: " + err.message);
    });
  };

  const handleDeleteTitleMapping = (id: number) => {
    apiClient.delete(`/configtest/academic-title-mappings/${id}`)
      .then(() => {
        setTitleMappings(prev => prev.filter(m => m.id !== id));
      })
      .catch(err => {
        console.error("Error al eliminar mapeo:", err);
        alert("Error al eliminar el mapeo: " + err.message);
      });
  };

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

        {/* Academic Title Mappings */}
        <div className="bg-card rounded-lg p-6 shadow-sm mb-8">
          <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
            Alias de títulos académicos
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Define qué profesión corresponde a un título académico cuando el nombre no coincide literalmente (ej. "Bachiller" → "Administración Pública").
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Título académico (ej. Bachiller)"
              value={newTitulo}
              onChange={(e) => setNewTitulo(e.target.value)}
              className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground"
            />
            <input
              type="text"
              placeholder="Profesión (ej. Administración Pública)"
              value={newProfession}
              onChange={(e) => setNewProfession(e.target.value)}
              className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground"
            />
            <button
              onClick={handleAddTitleMapping}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 font-semibold"
            >
              Agregar
            </button>
          </div>

          {titleMappings.length === 0 ? (
            <p className="text-muted-foreground italic">No hay mapeos configurados.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2">Título académico</th>
                  <th className="py-2">Profesión</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {titleMappings.map(m => (
                  <tr key={m.id} className="border-b border-border">
                    <td className="py-2 text-foreground">{m.tituloAcademico}</td>
                    <td className="py-2 text-foreground">{m.profession}</td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => handleDeleteTitleMapping(m.id)}
                        className="text-error hover:opacity-80"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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