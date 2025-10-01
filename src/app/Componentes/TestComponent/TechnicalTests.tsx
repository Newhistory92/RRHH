
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card } from 'primereact/card';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Test, TestsByProfession } from "@/app/Interfas/Interfaces";
import { CreateTestModal } from './CreateTestModal';

interface TechnicalTestsProps {
  testsByProfession: TestsByProfession;
  professions: { [key: string]: number[] };
  selectedProfession: string;
  onSelectedProfessionChange: (profession: string) => void;
  onAddProfession: (profession:{ [key: string]: number[] }) => void;
  onSaveTest: (test: Test) => void;
  onDeleteTest?: (testId: string) => void;
}

export const TechnicalTests: React.FC<TechnicalTestsProps> = ({
  testsByProfession,
  professions,
  selectedProfession,
  onSelectedProfessionChange,
  onAddProfession,
  onSaveTest,
  onDeleteTest
}) => {
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  const handleAddNewProfession = () => {
    const newProfession = prompt("Ingrese el nombre de la nueva profesión:");
    if (newProfession && !(newProfession in professions)) {
      onAddProfession({ [newProfession]: [] });
      onSelectedProfessionChange(newProfession);
    }
  };

  const handleSaveTest = (test: Test) => {
    onSaveTest(test);
    setIsTestModalOpen(false);
  };

  const currentTests = testsByProfession[selectedProfession] || [];

 const professionOptions = Object.keys(professions).map(profession => ({
  name: profession,
  value: profession
}));


  return (
    <div>
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label
              htmlFor="profession-select"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Seleccionar Profesión
            </label>
            <Dropdown
              inputId="profession-select"
              value={selectedProfession}
              onChange={(e: DropdownChangeEvent) => onSelectedProfessionChange(e.value)}
              options={professionOptions}
              optionLabel="name"
              optionValue="value"
              className="block w-full input-style"
              placeholder="Selecciona una profesión"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleAddNewProfession}
              severity="secondary" 
              text
              className="whitespace-nowrap"
            >
              <Plus size={16} className="mr-1" />
              Añadir Profesión
            </Button>
            <Button
              type="button"
              onClick={() => setIsTestModalOpen(true)}
              text 
              raised 
              className="whitespace-nowrap"
            >
              Crear Nuevo Test
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl text-gray-700 dark:text-gray-200">
            Tests para{" "}
            <span className="text-blue-500">{selectedProfession}</span>
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentTests.length} test{currentTests.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="space-y-4">
          {currentTests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                No hay tests para esta profesión.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                ¡Crea el primer test haciendo clic en &quot;Crear Nuevo Test&quot;!
              </p>
              <Button
                onClick={() => setIsTestModalOpen(true)}
                text
                className="text-blue-500 hover:text-blue-600"
              >
                Crear Primer Test
              </Button>
            </div>
          ) : (
            currentTests.map((test) => (
              <div
                key={test.id}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-white mb-1">
                      {test.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {test.description}
                    </p>
                    {test.type === 'multiple-choice' && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {test.questions.length} pregunta{test.questions.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        test.type === "multiple-choice"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      }`}
                    >
                      {test.type === "multiple-choice"
                        ? "Multiple Choice"
                        : "Caso de Estudio"}
                    </span>
                    {onDeleteTest && (
                      <Button
                        type="button"
                        onClick={() => onDeleteTest(test.id)}
                        className="text-red-500 hover:text-red-700"
                        text
                        size="small"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <CreateTestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        onSave={handleSaveTest}
        profession={selectedProfession}
      />
    </div>
  );
};