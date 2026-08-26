// Copia los temas de PrimeReact que la app alterna en runtime a public/themes/.
//
// PrimeReact no permite cambiar de tema con un import estatico: hay que servir
// los CSS y alternar el <link> segun el modo claro/oscuro (ver
// src/app/Componentes/Shell/PrimeReactTheme.tsx).
//
// Se corre en postinstall para que los archivos sigan a la version instalada de
// primereact en vez de quedar vendorizados y desactualizados en el repo.
// public/themes/ esta en .gitignore.

import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const TEMAS = ["lara-light-teal", "lara-dark-teal"];
const ORIGEN = path.join("node_modules", "primereact", "resources", "themes");
const DESTINO = path.join("public", "themes");

if (!existsSync(ORIGEN)) {
  console.warn(
    `[primereact-themes] No existe ${ORIGEN}; se omite la copia. ` +
      `Corre "npm install" y volve a intentar.`
  );
  process.exit(0);
}

await rm(DESTINO, { recursive: true, force: true });
await mkdir(DESTINO, { recursive: true });

for (const tema of TEMAS) {
  const desde = path.join(ORIGEN, tema);
  if (!existsSync(desde)) {
    console.error(`[primereact-themes] Falta el tema ${tema} en ${ORIGEN}`);
    process.exit(1);
  }
  await cp(desde, path.join(DESTINO, tema), { recursive: true });
  console.log(`[primereact-themes] ${tema} -> ${path.join(DESTINO, tema)}`);
}
