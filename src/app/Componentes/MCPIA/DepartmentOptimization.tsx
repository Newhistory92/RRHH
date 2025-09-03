import { ArrowLeft } from "lucide-react";
import { useState } from "react";


interface DepartmentOptimizationProps {
  onBack: () => void;
}

export const DepartmentOptimization = ({ onBack }: DepartmentOptimizationProps) => {
     const [aiSuggestion, setAiSuggestion] = useState('');
      const [isAiLoading, setIsAiLoading] = useState(false);
  const departments = [
    {
      office: 'Sede Central',
      department: 'Innovación y Desarrollo',
      keySkills: ['Design Thinking', 'Análisis de Datos', 'Gestión de Proyectos Ágiles'],
      description: 'Responsable de la investigación y creación de nuevos productos. Colabora estrechamente con Marketing y Ventas para identificar oportunidades de mercado.'
    },
    {
      office: 'Oficina Norte',
      department: 'Operaciones y Logística',
      keySkills: ['Gestión de Cadena de Suministro', 'Optimización de Procesos', 'Control de Calidad'],
      description: 'Asegura la eficiencia en la producción y distribución de nuestros productos. Punto clave para la satisfacción del cliente final.'
    },
    {
      office: 'Sede Central',
      department: 'Talento y Cultura',
      keySkills: ['Reclutamiento Estratégico', 'Desarrollo Organizacional', 'Comunicación Interna'],
      description: 'Atrae y desarrolla al mejor talento. Fomenta una cultura de colaboración y crecimiento continuo en toda la institución.'
    }
  ];



    const handleAnalyzeWithAI = async () => {
        setIsAiLoading(true);
        setAiSuggestion('');

        // 1. Construir el prompt para Gemini
        let structureText = "ESTRUCTURA ORGANIZACIONAL:\n\n";
        departmentsData.forEach(dept => {
            structureText += `DEPARTAMENTO: "${dept.nombre}" (Nivel ${dept.nivel_jerarquico})\n`;
            structureText += `DESCRIPCIÓN: ${dept.descripcion}\n`;
            if (dept.oficinas.length > 0) {
                dept.oficinas.forEach(office => {
                    structureText += `  - OFICINA: "${office.nombre}"\n`;
                    structureText += `    DESCRIPCIÓN: ${office.descripcion}\n`;
                });
            }
            structureText += "\n";
        });

        const prompt = `Como experto en consultoría organizacional, analiza la siguiente estructura de una empresa. Tu objetivo es identificar redundancias funcionales, áreas de superposición o ineficiencias estructurales basándote EXCLUSIVAMENTE en los nombres y descripciones proporcionados.

        **Análisis Solicitado:**
        1.  **Identifica Redundancias:** ¿Hay departamentos u oficinas que parecen hacer lo mismo? Nómbralos y explica por qué sus funciones se superponen.
        2.  **Propón Fusiones o Reorganizaciones:** Basado en tu análisis, sugiere fusiones concretas. Por ejemplo, "Sugerimos fusionar el departamento 'Adquisiciones' con la oficina 'Compras' para centralizar la función". Justifica cada sugerencia.
        3.  **Resultado Esperado:** Proporciona un resumen claro y accionable para la Dirección. Formatea tu respuesta de manera profesional.

        ${structureText}`;

        // 2. Llamar a la API de Gemini
        try {
            const apiKey = ""; // Dejar vacío, se gestiona en el entorno de ejecución
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Error en la API: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setAiSuggestion(text);
            } else {
                setAiSuggestion("No se pudo obtener una sugerencia de la IA. La respuesta no tuvo el formato esperado.");
            }
        } catch (error) {
            console.error("Error al llamar a la API de Gemini:", error);
            setAiSuggestion(`Hubo un error al conectar con el servicio de IA. Por favor, inténtalo de nuevo más tarde. Detalles: ${error.message}`);
        } finally {
            setIsAiLoading(false);
        }
    };



  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft size={20} />
        Volver
      </button>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Optimización de Departamentos</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Análisis de estructura para optimizar el organigrama institucional.</p>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b dark:border-gray-700">
              <tr>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Oficina / Sede</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Departamento</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Habilidades Clave</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dep, index) => (
                <tr key={index} className="border-b dark:border-gray-700 last:border-b-0">
                  <td className="p-4 align-top">{dep.office}</td>
                  <td className="p-4 align-top">
                    <p className="font-semibold text-gray-800 dark:text-white">{dep.department}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{dep.description}</p>
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      {dep.keySkills.map(skill => (
                        <span key={skill} className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 text-xs font-medium px-2.5 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h4 className="font-bold text-gray-800 dark:text-white">Sugerencia de Optimización</h4>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Basado en las habilidades, se sugiere crear un &quot;comité de lanzamiento de productos&quot; con miembros de Innovación, Operaciones y Talento para agilizar la salida al mercado y asegurar la alineación estratégica.</p>
        </div>
      </div>
    </div>
  );
};

