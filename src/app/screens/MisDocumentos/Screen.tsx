"use client";

import React, { useEffect, useState } from 'react';
import { Eye, FileText } from 'lucide-react';
import { apiClient } from '@/app/util/apiClient';
import { Employee } from '@/app/Interfas/Interfaces';
import { SectionTitle } from '@/app/util/UiCv';

interface EmployeeDocumentSummary {
  id: number;
  tipo: string;
  descripcion: string | null;
  fileName: string;
  mimeType: string;
  createdAt: string;
}

interface MisDocumentosProps {
  employeeData: Employee | null;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export default function MisDocumentos({ employeeData }: MisDocumentosProps) {
  const [documents, setDocuments] = useState<EmployeeDocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeData?.id) return;
    const loadDocuments = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<{ documents: EmployeeDocumentSummary[] }>(
          `/employee/${employeeData.id}/documents`
        );
        setDocuments(res.documents);
        setError(null);
      } catch (err) {
        console.error('Error al cargar documentos:', err);
        setError('No se pudieron cargar tus documentos.');
      } finally {
        setLoading(false);
      }
    };
    loadDocuments();
  }, [employeeData?.id]);

  const handleViewDocument = async (doc: EmployeeDocumentSummary) => {
    if (!employeeData?.id) return;
    try {
      const full = await apiClient.get<{ fileData: string; mimeType: string }>(
        `/employee/${employeeData.id}/documents/${doc.id}/download`
      );
      // Los navegadores bloquean la navegacion de nivel superior a URLs "data:"
      // (especialmente PDFs). Se decodifica el base64 a un Blob y se abre como
      // URL "blob:", que si se puede navegar/imprimir.
      const byteCharacters = atob(full.fileData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: full.mimeType });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      console.error('Error al abrir documento:', err);
      setError('No se pudo abrir el documento.');
    }
  };

  if (!employeeData) {
    return (
      <div className="bg-background font-sans min-h-screen flex items-center justify-center">
        <p className="text-foreground">Cargando información del empleado...</p>
      </div>
    );
  }

  return (
    <div className="bg-background font-sans min-h-screen">
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-start mb-6">
          <SectionTitle icon={FileText} title="Mis Documentos" />
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm">
          {loading ? (
            <p className="text-muted-foreground text-sm">Cargando documentos...</p>
          ) : error ? (
            <p className="text-error text-sm">{error}</p>
          ) : documents.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">
              Todavía no tenés documentos cargados por RRHH.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2">Tipo</th>
                  <th className="py-2">Descripción</th>
                  <th className="py-2">Archivo</th>
                  <th className="py-2">Fecha</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-border">
                    <td className="py-2 text-foreground">{doc.tipo}</td>
                    <td className="py-2 text-foreground">{doc.descripcion || "—"}</td>
                    <td className="py-2 text-foreground">{doc.fileName}</td>
                    <td className="py-2 text-foreground">{formatDate(doc.createdAt)}</td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => handleViewDocument(doc)}
                        className="inline-flex items-center gap-1 text-primary hover:opacity-80"
                      >
                        <Eye size={16} /> Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
