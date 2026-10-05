"use client";

// Saber si la app se puede instalar, y poder disparar el cartel.
//
// En Android el navegador avisa con beforeinstallprompt y el cartel se dispara
// desde la app. En iPhone ese evento no existe: Safari obliga a hacerlo a mano
// desde Compartir, así que ahí lo único que se puede hacer es explicarlo.
//
// El listener de beforeinstallprompt vive a nivel de módulo, no dentro de un
// efecto de componente: este hook se usa desde el ítem del menú del avatar, y
// el contenido del menú de Radix se desmonta cuando está cerrado. Si el
// listener viviera en un efecto de ese componente, se perdería el evento
// cada vez que Chrome lo dispara con el menú cerrado -- que es casi siempre,
// porque lo dispara una sola vez, apenas la página es instalable.

import { useEffect, useState, useSyncExternalStore } from "react";

// Todavía no está en los tipos del DOM.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type EstadoInstalacion = "no-disponible" | "disponible" | "instrucciones-ios";

let eventoGuardado: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notificar() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    // Sin esto el navegador muestra su propio cartel cuando quiere, en vez
    // de cuando la persona toca el botón.
    e.preventDefault();
    eventoGuardado = e as BeforeInstallPromptEvent;
    notificar();
  });
}

function suscribirse(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function leerEvento() {
  return eventoGuardado;
}

function leerEventoServidor() {
  return null;
}

export function useInstalarApp() {
  const evento = useSyncExternalStore(suscribirse, leerEvento, leerEventoServidor);
  const [esIOS, setEsIOS] = useState(false);
  const [yaInstalada, setYaInstalada] = useState(false);

  useEffect(() => {
    // display-mode cubre Android y escritorio; navigator.standalone es la
    // bandera propia de iOS, que no implementa display-mode: standalone.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setYaInstalada(standalone);

    setEsIOS(/iPad|iPhone|iPod/.test(window.navigator.userAgent));
  }, []);

  const estado: EstadoInstalacion = yaInstalada
    ? "no-disponible"
    : evento
      ? "disponible"
      : esIOS
        ? "instrucciones-ios"
        : "no-disponible";

  const instalar = async () => {
    if (!eventoGuardado) return;
    // Se saca el evento de inmediato, antes de esperar el prompt: así un
    // segundo click mientras el cartel está abierto no dispara otro prompt()
    // sobre un evento ya consumido. Es de un solo uso: una vez consumido, el
    // navegador no lo vuelve a emitir hasta la próxima visita.
    const actual = eventoGuardado;
    eventoGuardado = null;
    notificar();
    try {
      await actual.prompt();
    } catch (error) {
      console.error("No se pudo mostrar el cartel de instalación:", error);
    }
  };

  return { estado, instalar };
}
