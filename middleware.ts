import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas que requieren autenticación
const PROTECTED_PATHS = ["/dashboard", "/panel", "/gestion", "/admin"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // Si la ruta es pública, continuar
  if (!PROTECTED_PATHS.some(path => req.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Si no hay token, redirigir a login
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Validar token con el backend FastAPI
    const apiUrl = "http://127.0.0.1:8000/auth/verify"; // endpoint que haremos abajo
    return fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          // Token inválido o expirado → redirigir al login
          const loginUrl = new URL("/login", req.url);
          loginUrl.searchParams.set("expired", "true");
          return NextResponse.redirect(loginUrl);
        }

        // Token válido → permitir paso
        return NextResponse.next();
      })
      .catch(() => {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("error", "verify_failed");
        return NextResponse.redirect(loginUrl);
      });
  } catch  {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("error", "unexpected");
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/panel/:path*", "/gestion/:path*", "/admin/:path*"],
};
