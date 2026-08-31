// util/markdownLite.tsx
// Renderer minimo para las respuestas del chatbot de IA: Gemini devuelve
// texto con **negrita**, listas "* " o "1. " y parrafos separados por
// saltos de linea. No es un parser de Markdown completo a proposito -no
// hace falta traer una libreria entera para esto- solo lo que el modelo
// realmente produce en sus respuestas.

import React from "react";

function renderInline(texto: string, keyPrefix: string): React.ReactNode[] {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
  return partes.map((parte, i) => {
    if (parte.startsWith("**") && parte.endsWith("**") && parte.length > 4) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-semibold">
          {parte.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={`${keyPrefix}-${i}`}>{parte}</React.Fragment>;
  });
}

export function MarkdownLite({ texto }: { texto: string }) {
  const lineas = texto.split("\n");
  const bloques: React.ReactNode[] = [];
  let itemsActuales: string[] = [];
  let tipoActual: "ul" | "ol" | null = null;

  const cerrarLista = () => {
    if (!tipoActual || itemsActuales.length === 0) return;
    const ordenada = tipoActual === "ol";
    const items = itemsActuales;
    bloques.push(
      ordenada ? (
        <ol key={`lista-${bloques.length}`} className="list-decimal pl-5 space-y-1.5 my-2 marker:text-current marker:opacity-60">
          {items.map((item, i) => (
            <li key={i}>{renderInline(item, `li-${bloques.length}-${i}`)}</li>
          ))}
        </ol>
      ) : (
        <ul key={`lista-${bloques.length}`} className="space-y-1.5 my-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-current opacity-50 shrink-0" />
              <span>{renderInline(item, `li-${bloques.length}-${i}`)}</span>
            </li>
          ))}
        </ul>
      )
    );
    itemsActuales = [];
    tipoActual = null;
  };

  lineas.forEach((linea, idx) => {
    const bullet = linea.match(/^\s*[*-]\s+(.*)/);
    const numerada = linea.match(/^\s*\d+[.)]\s+(.*)/);

    if (bullet) {
      if (tipoActual !== "ul") cerrarLista();
      tipoActual = "ul";
      itemsActuales.push(bullet[1]);
      return;
    }
    if (numerada) {
      if (tipoActual !== "ol") cerrarLista();
      tipoActual = "ol";
      itemsActuales.push(numerada[1]);
      return;
    }
    cerrarLista();
    if (linea.trim() !== "") {
      bloques.push(
        <p key={`p-${idx}`} className="leading-relaxed">
          {renderInline(linea, `p-${idx}`)}
        </p>
      );
    }
  });
  cerrarLista();

  return <div className="space-y-1.5">{bloques}</div>;
}
