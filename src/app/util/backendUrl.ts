// util/backendUrl.ts
// Resuelve la URL del backend para código que corre en el navegador.
// Si NEXT_PUBLIC_BACKEND_URL está definida (build), se usa esa.
// Si no, se deriva del host actual (mismo host, puerto 8000) en vez de
// asumir 127.0.0.1 — así funciona desde cualquier PC de la red que
// acceda al frontend por IP, no solo desde la máquina donde corre el backend.
export function getBackendUrl(): string {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:8000`;
  }
  return "http://127.0.0.1:8000";
}
