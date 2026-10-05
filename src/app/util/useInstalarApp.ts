"use client";

// Saber si la app se puede instalar, y poder disparar el cartel.
//
// En Android el navegador avisa con beforeinstallprompt y el cartel se dispara
// desde la app. En iPhone ese evento no existe: Safari obliga a hacerlo a mano
// desde Compartir, así que ahí lo único que se puede hacer es explicarlo.

import { useEffect, useState } from "react";

// Todavía no está en los tipos del DOM.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type EstadoInstalacion = "no-disponible" | "disponible" | "instrucciones-ios";

export function useInstalarApp() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null);
  const [esIOS, setEsIOS] = useState(false);
  const [yaInstalada, setYaInstalada] = useState(false);

  useEffect(() => {
    const alEvento = (e: Event) => {
      // Sin esto el navegador muestra su propio cartel cuando quiere, en vez
      // de cuando la persona toca el botón.
      e.preventDefault();
      setEvento(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", alEvento);

    // display-mode cubre Android y escritorio; navigator.standalone es la
    // bandera propia de iOS, que no implementa display-mode: standalone.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setYaInstalada(standalone);

    setEsIOS(/iPad|iPhone|iPod/.test(window.navigator.userAgent));

    return () => window.removeEventListener("beforeinstallprompt", alEvento);
  }, []);

  const estado: EstadoInstalacion = yaInstalada
    ? "no-disponible"
    : evento
      ? "disponible"
      : esIOS
        ? "instrucciones-ios"
        : "no-disponible";

  const instalar = async () => {
    if (!evento) return;
    await evento.prompt();
    // El evento es de un solo uso: una vez consumido, el navegador no lo
    // vuelve a emitir hasta la próxima visita.
    setEvento(null);
  };

  return { estado, instalar };
}
