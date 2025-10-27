// utils/auth.ts
"use server";

import { cookies } from "next/headers";

export async function loginUser(username: string, password: string) {
  const res = await fetch("http://127.0.0.1:8000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
  });

  if (!res.ok) throw new Error("Login fallido");

  const data = await res.json();

  // Guardar el token en cookie segura
  (await
        // Guardar el token en cookie segura
        cookies()).set("token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 6, // 6 horas
    path: "/",
  });

  return data;
}

export async function logoutUser() {
  const token = (await cookies()).get("token")?.value;
  if (token) {
    await fetch("http://127.0.0.1:8000/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  (await cookies()).delete("token");
}
