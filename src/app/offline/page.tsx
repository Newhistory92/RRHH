// Pantalla de respaldo cuando no hay conexión. El service worker la precachea
// y la devuelve ante cualquier navegación que falle sin copia en caché.
//
// No hace ninguna llamada a la API a propósito: es la pantalla del caso en que
// la red no está.

export const metadata = {
  title: "Sin conexión",
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-sm text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
          Sin conexión
        </h1>
        <p className="text-sm text-muted-foreground">
          No pudimos contactar al servidor. Los datos de licencias, asistencia y
          documentos se consultan en vivo, así que hace falta conexión para
          verlos.
        </p>
        <p className="text-sm text-muted-foreground mt-3">
          Cuando vuelvas a tener señal, volvé a abrir la app.
        </p>
      </div>
    </main>
  );
}
