"use client";

// Mantiene <meta name="theme-color"> igual al tema que la app está mostrando,
// que es lo que pinta la barra de estado del teléfono en la app instalada.
//
// No se usan las variantes por prefers-color-scheme del viewport de Next
// porque este proyecto no sigue el tema del sistema: el ThemeProvider corre
// con enableSystem={false} y el tema lo elige la persona.

import { useEffect } from "react";
import { useTheme } from "next-themes";

const COLORES = {
  light: "#F6F7F4",
  dark: "#24232A",
};

export function ThemeColorMeta() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const color = resolvedTheme === "dark" ? COLORES.dark : COLORES.light;
    // El viewport.themeColor de layout.tsx ya deja este meta tag en el HTML
    // servido; lo normal es encontrarlo y solo actualizar su content. Crearlo
    // acá es un respaldo defensivo, no el camino esperado.
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = color;
  }, [resolvedTheme]);

  return null;
}
