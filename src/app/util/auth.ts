// util/auth.ts
// Funciones de autenticación:
// - loginUser: Server Action para login (guarda cookie httpOnly)
// - logoutUser: función SERVER (no usar desde Client Components directamente)
// - logoutFromClient: función CLIENT para cerrar sesión desde el navegador
"use server";

import { cookies } from "next/headers";

export async function loginUser(username: string, password: string) {
  const res = await fetch("http://127.0.0.1:8000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username: username, password: password })
  });

  if (!res.ok) throw new Error("Login fallido");

  const data = await res.json();

  // Guardar el token en cookie segura (HttpOnly)
  const cookieStore = await cookies();
  cookieStore.set("token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 6, // 6 horas
    path: "/",
  });

  return data;
}

// Cierre de sesión del lado del SERVIDOR (para Server Actions / API routes)
export async function logoutUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (token) {
    await fetch("http://127.0.0.1:8000/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  cookieStore.delete("token");
}
