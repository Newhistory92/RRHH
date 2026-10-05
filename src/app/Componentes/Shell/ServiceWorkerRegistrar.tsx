"use client";

// Registra el service worker. Va como componente porque el registro solo
// puede correr en el navegador.

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // En desarrollo el bundle no es el definitivo y cachearlo solo trae
    // confusión; el service worker se prueba con next build && next start.
    if (process.env.NODE_ENV !== "production") return;

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("No se pudo registrar el service worker:", error);
    });
  }, []);

  return null;
}
