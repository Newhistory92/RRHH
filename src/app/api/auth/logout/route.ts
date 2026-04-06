// app/api/auth/logout/route.ts
// Route handler de Next.js para eliminar la cookie httpOnly del token JWT.
// Se llama desde el cliente como: fetch('/api/auth/logout', { method: 'POST' })

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // Eliminar la cookie segura del servidor
  (await cookies()).delete("token");

  return NextResponse.json({ ok: true });
}
