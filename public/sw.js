// Service worker de RRHH. Estrategia: la red manda.
//
// Con internet siempre se le pide al servidor y se guarda una copia; sin
// internet se sirve esa copia. Nunca se prefiere la cache estando online, y
// eso elimina de raiz dos problemas clasicos: quedarse con una version vieja
// clavada, y la pantalla en blanco de un HTML viejo que pide archivos que el
// deploy nuevo ya borro.
//
// No cachea la API: vive en otro origen (puerto 8000) y se filtra por origen.
// Un saldo de licencias viejo en pantalla confunde mas que avisar que no hay
// conexion.

const VERSION = "v1";
const CACHE = `rrhh-${VERSION}`;
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  // Lo unico que se precachea. Con red primero, una pantalla que nunca se
  // visito no esta en la cache, asi que la de respaldo tiene que estar
  // guardada de antemano o no habria nada que mostrar. El bundle de Next no se
  // precachea: sus nombres llevan hash y desde aca no se conocen.
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
  );
});

self.addEventListener("activate", (event) => {
  // Borra las caches de versiones anteriores.
  event.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(
          nombres.filter((nombre) => nombre !== CACHE).map((nombre) => caches.delete(nombre))
        )
      )
  );
});

// Sin skipWaiting a proposito: la version nueva toma el control en el proximo
// arranque en frio, no en medio de una sesion abierta.

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Solo lo propio: la API es otro origen y no se cachea.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((respuesta) => {
        if (respuesta.ok && respuesta.type === "basic") {
          const copia = respuesta.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copia));
        }
        return respuesta;
      })
      .catch(async () => {
        const copia = await caches.match(request);
        if (copia) return copia;
        if (request.mode === "navigate") {
          const offline = await caches.match(OFFLINE_URL);
          if (offline) return offline;
        }
        return Response.error();
      })
  );
});
