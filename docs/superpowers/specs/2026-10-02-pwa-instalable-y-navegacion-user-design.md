# PWA instalable y navegación del USER en el celular

**Fecha:** 2026-10-02
**Estado:** aprobado

## Problema

Desde el celular, el sistema es un sitio web que hay que ir a buscar al
navegador: no se puede instalar. El `manifest.json` existe y declara
`display: standalone`, pero no hay service worker, y sin uno Chrome no ofrece
"Instalar app" en Android. Tampoco hay forma de descubrir la instalación desde
la propia app.

Y cuando el empleado entra, sus opciones están mal repartidas. Un USER tiene
siete destinos —Inicio, Mi Perfil, Mi Asistencia, Licencias, Documentos,
Encuesta y Reubicación— partidos entre dos menús distintos: cuatro en el menú
lateral y cinco en el del avatar. **Documentos aparece en los dos**, y lo que el
menú lateral llama "Asistencia" y el del avatar llama "Mi Asistencia" es, para
un USER, exactamente la misma pantalla: `AsistenciaPage` con
`puedeGestionar=false` renderiza el mismo componente `MiAsistencia`
(`src/app/screens/Asistencia/Screen.tsx`). Son dos nombres y dos lugares para
una sola cosa.

## Alcance

Dos cosas que se prueban juntas en un teléfono:

1. **Que la app se pueda instalar**: arreglos al manifest, un service worker
   propio y un botón "Instalar app" en el menú del avatar.
2. **Que el USER tenga sus destinos bien distribuidos en el celular**: una barra
   inferior de cuatro secciones, y el menú del avatar con el resto, sin repetir
   nada.

**Fuera de alcance:**

- Guardar datos para consultarlos sin conexión. El service worker guarda la app
  (pantallas, estilos, íconos), no las respuestas del servidor.
- Notificaciones push y sincronización en segundo plano.
- Cambiar la duración de la sesión (ver "Consecuencia asumida").
- Una app nativa en las tiendas. Se evaluó y se descartó: exige backend público
  con HTTPS, cuentas de desarrollador institucionales y reconstruir las
  pantallas.
- Cambiar la navegación de los roles de gestión, o la de cualquier rol en
  escritorio.

## Decisiones

| Decisión | Elección | Razón |
|---|---|---|
| Tipo de app | PWA instalable, mismo proyecto | Un solo código y un solo deploy; la app nativa exigía infraestructura y cuentas de tienda |
| Sin conexión | Abre y avisa | En un sistema de RRHH un saldo de licencias viejo en pantalla confunde más que un mensaje honesto |
| Service worker | Propio, priorizando el servidor | Con internet siempre pide al servidor: elimina de raíz la versión vieja clavada y las pantallas en blanco por código desactualizado |
| Descubrimiento | Botón en el menú del avatar | Discreto, no interrumpe el primer uso, y desaparece si ya está instalada |
| Navegación del USER | Barra inferior de 4 + avatar | Barra despejada; el solapamiento se arregla vaciando del avatar lo que está en la barra |
| Quién ve la barra | Quien no tiene permisos de gestión, solo en celular | Los roles de gestión tienen diez o más secciones y no entran en una barra |
| Duración de sesión | Se mantiene en 2 horas | Prudencia: un teléfono perdido queda inutilizable rápido |

## Prerrequisito: HTTPS

La instalación y el service worker solo funcionan en un origen seguro.
`localhost` cuenta, así que todo esto se puede desarrollar y probar en la
máquina local, pero **servido por IP en la red interna sobre HTTP plano el
navegador no va a ofrecer instalar ni registrar el service worker**. Depende del
dominio público con HTTPS que está previsto.

## Consecuencia asumida: la sesión dura 2 horas

El token expira a las 2 horas (`JWT_EXPIRE_HOURS`, por defecto 2, en
`app/routes/auth.py` del backend) y no hay token de refresco. En el navegador se
tolera; en una app instalada significa que va a pedir usuario y contraseña
seguido. **Es una decisión deliberada, no una falla**: queda documentada acá para
que nadie la "arregle" sin saber que se eligió a propósito. Si más adelante
molesta, las salidas son subir la variable de entorno (aplica a todos los roles)
o implementar tokens de refresco (trabajo de backend aparte).

## Arquitectura

### El manifest

`src/app/manifest.json` (convención de App Router: Next lo sirve y le inyecta el
`<link rel="manifest">` solo). Cambios:

- **Nombre**: `name` y `short_name` pasan a `"RRHH"`, para que coincidan con el
  título de la app. Hoy dicen "Meridia".
- **Íconos**: hoy los dos están declarados solo como `purpose: "maskable"`, y
  Chrome, cuando no encuentra un ícono `any`, recorta el maskable. Se declaran
  como `"any maskable"`, que es válido y arregla el recorte con los archivos que
  ya existen. Como están diseñados con el margen que pide el formato maskable,
  usados como `any` se van a ver un poco chicos; si molesta, la mejora posterior
  es agregar un 512 sin margen declarado solo como `any`.
- **`start_url`, `scope` e `id`** explícitos en `/`, para que el navegador no
  trate la app como otra distinta si algún día cambia la URL de arranque.
- **`background_color`** queda en el color de fondo del tema claro: es el color
  del splash, el manifest no admite variantes, y es el precio de no complicarlo.

### Color de la barra de estado y área segura

Se agrega un `export const viewport: Viewport` en `src/app/layout.tsx` con:

- `themeColor` con dos variantes (`prefers-color-scheme: light` y `dark`), así la
  barra de estado del teléfono acompaña al tema de la app en vez de quedar
  blanca siempre.
- `viewportFit: "cover"`, **indispensable** para que `env(safe-area-inset-bottom)`
  devuelva algo distinto de cero: sin eso, la barra inferior queda tapada por el
  indicador de inicio del iPhone.

En `metadata.appleWebApp` se declara `capable: true` explícitamente, que es lo
que hace que en iPhone la app abra sin la barra de Safari.

### El service worker

`public/sw.js` (servido en `/sw.js`, así su alcance es todo el sitio). Sin
dependencias nuevas.

- **Estrategia: red primero.** Con internet, siempre va al servidor y guarda una
  copia de lo que baja. Sin internet, sirve la copia. Nadie queda con código
  viejo porque nunca se prefiere la caché estando online.
- **En `install` precachea una sola cosa: `/offline`.** No intenta precachear el
  bundle de Next, cuyos nombres llevan hash y no se conocen desde el service
  worker; el resto se guarda a medida que se descarga. Precachear la página de
  respaldo sí es obligatorio: con red primero, una pantalla que nunca se visitó
  no está en la caché, así que si no está guardada de antemano no hay nada que
  mostrar.
- **Respaldo de navegación**: si falla una navegación y no hay copia, responde
  `/offline` (ruta nueva, `src/app/offline/page.tsx`) con un mensaje claro de que
  no hay conexión. La consecuencia de no precachear el bundle, dicha derecho: la
  primera vez que alguien abre la app sin conexión ve esa página; a partir de
  haberla usado una vez con internet, abre la app de verdad.
- **Caché versionada**: el nombre lleva una versión y en `activate` se borran las
  viejas.
- **Sin `skipWaiting`**: la versión nueva toma el control en el próximo arranque
  en frío, no en medio de una sesión. Cambiar el código por debajo de una app
  abierta es exactamente cómo se producen las pantallas en blanco.
- **No se cachean las respuestas del backend.** El service worker se limita a
  los archivos de la app; cualquier pedido a la API pasa derecho.

Se registra desde un componente cliente chico montado en el layout, que no
dibuja nada.

### El botón de instalar

Vive en el menú del avatar (`src/app/Componentes/Shell/AppHeader.tsx`).

- En Android se captura el evento `beforeinstallprompt`, se guarda y se
  previene; el ítem del menú aparece solo si ese evento llegó, y al tocarlo
  dispara el cartel nativo.
- En iPhone ese evento no existe. Ahí el mismo ítem abre una hoja de dos líneas
  explicando Compartir → Agregar a inicio.
- Si la app ya corre instalada (`display-mode: standalone`), el ítem no se
  muestra.

### Quién ve la barra inferior

Los cuatro permisos de gestión que `src/app/util/rbac.ts` ya usa sueltos para
ocultar páginas (`rrhh.gestionar`, `estadisticas.ver`, `activos.configurar`,
`admin.gestionar`) pasan a ser una constante con nombre, `PERMISOS_DE_GESTION`,
reusada por los `ocultaSiTienePermiso` que hoy la repiten. La regla es una sola:
**quien no tiene ninguno de esos permisos ve la barra inferior en el celular**.

Hoy eso es exactamente el rol USER. ESTADISTA (tiene `estadisticas.ver`),
TÉCNICO y PATRIMONIO (`activos.configurar`), RRHH (`rrhh.gestionar`) y ADMIN
(comodín) siguen con el cajón lateral deslizante.

### La barra

Componente nuevo, `src/app/Componentes/Shell/AppBottomNav.tsx`, montado por
`AppLayout` igual que el header y el sidebar. Fija abajo, con Inicio,
Asistencia, Licencias y Documentos. El ítem activo se
marca con el color primario de la app. Respeta `env(safe-area-inset-bottom)` para
no quedar debajo del indicador de inicio del iPhone, y el contenido recibe
espacio extra abajo para que la barra no tape nada.

Para quien ve la barra, **el botón de menú de la barra superior desaparece**: ya
no queda nada que abrir. El cajón lateral sigue existiendo para los demás roles.

### El menú del avatar

Para quien ve la barra, queda con: Mi Perfil, Encuesta, Reubicación, Instalar app
y Cerrar sesión. Sin solapamiento con la barra — hoy repite Licencias,
Documentos y "Mi Asistencia", que es el problema que se está arreglando.

Para los roles de gestión el menú no cambia.

### Un detalle que no es obvio

`asistencia` y `mi-asistencia` siguen existiendo las dos en `PAGE_CONFIG`. Para
un USER son la misma pantalla, y por eso solo una entra en la barra. Pero para
RRHH son distintas: `asistencia` le muestra el tablero de gestión y
`mi-asistencia` la suya propia. Así que los ids se mantienen y lo único que
cambia es el menú que ve quien no tiene permisos de gestión.

## Verificación

El frontend no tiene runner de tests, así que:

- **Chequeo de tipos** (`npx tsc --noEmit`): el repo tiene errores previos no
  relacionados; el criterio es no agregar ninguno nuevo.
- **Navegador a 375 px**: que la barra aparezca para un usuario sin permisos de
  gestión y no para uno con ellos, que el botón de menú desaparezca para el
  primero, que el menú del avatar no repita nada de la barra, y que el contenido
  no quede tapado por la barra.
- **Panel Application de Chrome**: manifest sin advertencias, íconos
  reconocidos, service worker registrado y activo, y la app marcada como
  instalable. Esto hay que probarlo con `next build && next start`, no con el
  servidor de desarrollo, donde el service worker se comporta distinto.
- **Sin conexión**: con la pestaña en modo offline, la app abre y muestra el
  aviso en vez de la pantalla de error del navegador.
- **iPhone**: lo tiene que confirmar el usuario en un teléfono real. Safari no se
  puede emular, y la hoja de instrucciones y el `apple-mobile-web-app-capable`
  solo se ven ahí.
