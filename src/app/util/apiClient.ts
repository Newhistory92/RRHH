// util/apiClient.ts
// Cliente API centralizado para TODAS las peticiones al backend.
// - Inyecta automáticamente el token Bearer desde localStorage.
// - Intercepta respuestas 401 (token expirado/inválido) y fuerza logout + redirección.
// - Uso EXCLUSIVO en Client Components (usa localStorage y window).

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

/**
 * Limpia todo el estado de autenticación y redirige al login.
 * Se ejecuta automáticamente cuando el backend responde con 401.
 */
async function handleUnauthorized(): Promise<void> {
  // Limpiar todo el almacenamiento local del usuario
  localStorage.removeItem("token");
  localStorage.removeItem("roleName");
  localStorage.removeItem("roleId");
  localStorage.removeItem("usuario");
  localStorage.removeItem("employeeId");

  // Eliminar la cookie httpOnly vía la API route de Next.js
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (e) {
    console.warn("No se pudo eliminar la cookie del servidor:", e);
  }

  // Redirigir al login
  window.location.href = "/pages/Login";
}

/**
 * Función base para todas las peticiones al backend.
 * Inyecta el token y maneja errores 401 automáticamente.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  // Construir headers con token de autorización
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Interceptor: si el backend responde 401, forzar logout
  if (response.status === 401) {
    console.warn("⛔ Token expirado o inválido. Cerrando sesión...");
    await handleUnauthorized();
    // Lanzar error para detener la ejecución del código que llamó
    throw new Error("Sesión expirada. Redirigiendo al login...");
  }

  // Para respuestas sin contenido (204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.detail || errorBody.message || `Error API: ${response.status}`
    );
  }

  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// Métodos de conveniencia para cada verbo HTTP
// ─────────────────────────────────────────────────────────────────────────────

export const apiClient = {
  /** GET — obtener datos */
  get: <T>(endpoint: string): Promise<T> =>
    request<T>(endpoint, { method: "GET" }),

  /** POST — crear recurso */
  post: <T>(endpoint: string, body?: unknown): Promise<T> =>
    request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  /** PUT — actualizar recurso */
  put: <T>(endpoint: string, body?: unknown): Promise<T> =>
    request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  /** DELETE — eliminar recurso */
  delete: <T>(endpoint: string): Promise<T> =>
    request<T>(endpoint, { method: "DELETE" }),

  /** PATCH — actualización parcial recurso */
  patch: <T>(endpoint: string, body?: unknown): Promise<T> =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
};
