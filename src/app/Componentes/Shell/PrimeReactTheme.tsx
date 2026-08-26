"use client";

// Alterna el tema de PrimeReact segun el modo claro/oscuro de la app.
//
// PrimeReact no lee los tokens de globals.css: cada tema es una hoja de estilos
// completa con sus propios colores. Un import estatico deja la tabla, los
// dropdowns y el calendario pintados de claro aunque la app este en oscuro, y
// ahi el texto que usa text-foreground (casi blanco en oscuro) cae sobre las
// superficies blancas de PrimeReact y se vuelve ilegible.
//
// Por eso el <link> se cambia en runtime. Los CSS los sirve public/themes/,
// que llena scripts/copy-primereact-themes.mjs en cada postinstall.

import { useEffect } from "react";
import { useTheme } from "next-themes";

const ID_LINK = "primereact-theme";

function href(modo: "light" | "dark") {
  return `/themes/lara-${modo}-teal/theme.css`;
}

export function PrimeReactTheme() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Antes de que next-themes resuelva el modo, resolvedTheme es undefined.
    // Se arranca en claro para no dejar a PrimeReact sin hoja de estilos.
    const modo = resolvedTheme === "dark" ? "dark" : "light";
    const url = href(modo);

    let link = document.getElementById(ID_LINK) as HTMLLinkElement | null;

    if (!link) {
      link = document.createElement("link");
      link.id = ID_LINK;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    if (link.getAttribute("href") !== url) {
      link.setAttribute("href", url);
    }
  }, [resolvedTheme]);

  return null;
}
