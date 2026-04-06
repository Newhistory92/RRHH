// util/authClient.ts
// Funciones de autenticación para usar EXCLUSIVAMENTE en Client Components.
// No importar este archivo en Server Components ni en layout.tsx del servidor.

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

/**
 * Cierra la sesión del usuario desde el client-side:
 * 1. Llama al backend para invalidar el JWT en la blacklist.
 * 2. Limpia todo el estado en localStorage.
 * 3. Elimina la cookie del token vía la API route de Next.js.
 * 4. Redirige al login.
 */
export async function logoutFromClient(): Promise<void> {
  // Obtener token de localStorage (se guardó al hacer login en la página de login)
  const token = localStorage.getItem("token");

  try {
    if (token) {
      // Invalida el token en el backend (lo agrega a la blacklist de la DB)
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch (e) {
    // Si falla la invalidación en el backend, igual limpiamos el cliente
    console.warn("No se pudo invalidar el token en el backend:", e);
  }

  // Limpiar todo el almacenamiento del cliente
  localStorage.removeItem("token");
  localStorage.removeItem("roleName");
  localStorage.removeItem("roleId");
  localStorage.removeItem("usuario");
  localStorage.removeItem("employeeId");

  // Eliminar la cookie httpOnly vía la route handler de Next.js
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (e) {
    console.warn("No se pudo eliminar la cookie del servidor:", e);
  }

  // Redirigir al login
  // Redirección al login tras cerrar sesión
  window.location.href = "/pages/Login";
}
