"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/app/util/apiClient";
import { UsuarioObraSocial } from "@/app/Interfas/Interfaces";

interface ResumenImportacion {
  importados: number;
  ya_existian: number;
  errores: { idUsuario: string; motivo: string }[];
}

export function ObraSocialUsuariosTab() {
  const [usuarios, setUsuarios] = useState<UsuarioObraSocial[]>([]);
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [importando, setImportando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumen, setResumen] = useState<ResumenImportacion | null>(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const r = await apiClient.get<{ usuarios: UsuarioObraSocial[] }>(
        "/obrasocial/usuarios",
      );
      setUsuarios(r.usuarios);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los usuarios");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return usuarios;
    return usuarios.filter((u) =>
      [u.idUsuario, u.nombreUsuario, u.nombre, u.apellido, u.dni]
        .filter(Boolean)
        .some((campo) => String(campo).toLowerCase().includes(termino)),
    );
  }, [usuarios, busqueda]);

  const importables = useMemo(
    () => filtrados.filter((u) => !u.vinculado && !u.anulado),
    [filtrados],
  );

  const alternar = (id: string) => {
    setSeleccion((previa) => {
      const siguiente = new Set(previa);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
  };

  const alternarTodos = () => {
    setSeleccion((previa) =>
      previa.size === importables.length
        ? new Set()
        : new Set(importables.map((u) => u.idUsuario)),
    );
  };

  const importar = async () => {
    if (seleccion.size === 0) return;
    setImportando(true);
    setResumen(null);
    try {
      const r = await apiClient.post<ResumenImportacion>("/obrasocial/importar", {
        idUsuarios: Array.from(seleccion),
      });
      setResumen(r);
      setSeleccion(new Set());
      await cargar();
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falló la importación");
    } finally {
      setImportando(false);
    }
  };

  if (cargando) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <i className="pi pi-spin pi-spinner text-2xl mb-2" />
        <p>Cargando usuarios de la institución…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Usuarios de la institución
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Importalos para que RRHH pueda completar sus datos antes de que entren
            por primera vez.
          </p>
        </div>
        <button
          onClick={importar}
          disabled={importando || seleccion.size === 0}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
        >
          {importando ? "Importando…" : `Importar ${seleccion.size} seleccionados`}
        </button>
      </div>

      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por usuario, nombre o DNI…"
        className="w-full sm:w-80 mb-4 px-3 py-2 rounded-md bg-muted border border-border text-foreground text-sm"
      />

      {error && (
        <div className="mb-4 p-3 rounded-md bg-error/10 text-error text-sm">{error}</div>
      )}

      {resumen && (
        <div className="mb-4 p-3 rounded-md bg-muted text-sm text-foreground">
          <p>
            Importados: <strong>{resumen.importados}</strong> · Ya existían:{" "}
            <strong>{resumen.ya_existian}</strong>
          </p>
          {resumen.errores.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-error">
              {resumen.errores.map((e) => (
                <li key={e.idUsuario}>{e.motivo}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="py-2 pr-4 w-10">
                <input
                  type="checkbox"
                  checked={importables.length > 0 && seleccion.size === importables.length}
                  onChange={alternarTodos}
                  disabled={importables.length === 0}
                  aria-label="Seleccionar todos los importables"
                />
              </th>
              <th className="py-2 pr-4">Usuario</th>
              <th className="py-2 pr-4">Nombre</th>
              <th className="py-2 pr-4">DNI</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((u) => {
              const importable = !u.vinculado && !u.anulado;
              return (
                <tr key={u.idUsuario} className="border-b border-border last:border-0">
                  <td className="py-2 pr-4">
                    <input
                      type="checkbox"
                      checked={seleccion.has(u.idUsuario)}
                      onChange={() => alternar(u.idUsuario)}
                      disabled={!importable}
                      aria-label={`Seleccionar ${u.nombreUsuario}`}
                    />
                  </td>
                  <td className="py-2 pr-4 text-foreground">{u.nombreUsuario}</td>
                  <td className="py-2 pr-4">
                    {[u.nombre, u.apellido].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="py-2 pr-4">{u.dni || "—"}</td>
                  <td className="py-2 pr-4">{u.email || "—"}</td>
                  <td className="py-2">
                    {u.anulado ? (
                      <span className="text-error">Dado de baja</span>
                    ) : u.vinculado ? (
                      <span className="text-success">Vinculado</span>
                    ) : (
                      <span className="text-muted-foreground">Pendiente</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  No hay usuarios que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
