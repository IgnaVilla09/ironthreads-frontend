# Iron Frontend

Panel privado de `Iron Stock`.

Version actual: **2.4.0**. Ver [historial de versiones](CHANGELOG.md).

La version 2.4.0 agrega el empaquetado nativo con Tauri v2 para Windows y Android, que carga el frontend publicado en Vercel y mantiene el backend en Render. Incluye ademas las mejoras de login y la persistencia de paginacion de 2.3.0. No requiere cambios adicionales del backend.

## Instruccion para OpenCode: revision de versiones

Cuando analices este proyecto, revisa `CHANGELOG.md`, los commits posteriores al ultimo hito documentado y los cambios pendientes. Determina si una correccion importante, una mejora significativa o un cambio incompatible justifican aumentar la version; no des por hecho que el numero de `package.json` ya refleja el codigo.

Si corresponde subirla, usa versionado semantico: **patch** para correcciones compatibles, **minor** para funcionalidades o mejoras compatibles y **major** para cambios incompatibles. Actualiza `package.json`, los campos `version` de la raiz y de `packages[""]` en `package-lock.json`, `CHANGELOG.md` con los commits relacionados y la version indicada en este README. Si el cambio forma parte de un hito conjunto con el backend, coordina la version en ambos repositorios. Si todavia no corresponde subirla, explica brevemente el motivo en el analisis.

## Stack

- Next.js 15
- React 19
- Tailwind CSS
- Zustand

## Variables de entorno

Crear `iron/frontend/.env.local` con:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
BACKEND_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
```

## Desarrollo

```bash
npm install
npm run dev
```

## Aplicacion de escritorio y movil (Tauri v2)

Este frontend tambien se empaqueta como aplicacion nativa con Tauri v2 para Windows y Android. La app carga el frontend publicado en Vercel (`https://ironthreads-frontend.vercel.app`); el backend sigue en Render y los Route Handlers de Vercel actuan como BFF. No se expone ninguna API nativa al contenido remoto (`capabilities` vacias).

- Nombre visible: `Iron Stock | Gestion Iron Threads`
- Identificador: `com.ironthreads.ironstock`
- Version nativa: se toma de `package.json` (`build.version` -> `../package.json`), por lo que permanece sincronizada con la version semantica del frontend.

Requisitos en Windows: Rust (toolchain MSVC) y WebView2. Para Android: Rust con los targets de Android instalados, Android SDK/NDK y un JDK.

```bash
# Escritorio (Windows): abre el frontend remoto
npm run tauri:dev
npm run tauri:build

# Android (una sola vez, genera src-tauri/gen/android)
npm run tauri:android:init

# Android en emulador o dispositivo conectado
npm run tauri:android:dev

# APK de depuracion
npx tauri android build --debug --apk
```

`npm run tauri:build` genera instaladores en `src-tauri/target/release/bundle/`:

- NSIS: `nsis/Iron Stock_<version>_x64-setup.exe`
- MSI: `msi/Iron Stock_<version>_x64_en-US.msi`

Se instalan con doble clic. Al no estar firmados, Windows SmartScreen puede advertir; para pruebas locales se continua con **Mas informacion > Ejecutar de todos modos**. El primer uso instala WebView2 si falta.

Para cambiar los iconos (Windows y Android) desde un PNG cuadrado con transparencia:

```bash
npx tauri icon src/app/icon.png
```

Regenera `src-tauri/icons/` y los `mipmap` de `src-tauri/gen/android`. Luego recompila (`npm run tauri:build` y/o `npx tauri android build`).

Notas:

- En Windows, la creacion de symlinks requiere **Modo de desarrollador** activado; sin el, el build Android falla con `Creation symbolic link is not allowed for this system`.
- Si el proyecto y el registro de Cargo quedan en unidades distintas, `src-tauri/gen/android/gradle.properties` incluye `kotlin.incremental=false` para evitar el fallo del daemon de Kotlin. Debe reaplicarse si se regenera `gen/android`.
- La app depende de conexion para cargar Vercel. El modo offline debe verificarse por separado dentro del WebView.

## Verificacion

```bash
npm run typecheck
node --test offline-shell.test.cjs
```

## Cambios relevantes

- El login adapta su composicion a pantallas pequenas y permite mostrar la contrasena solo mientras se mantiene presionado el control correspondiente.
- Productos y el historial de ventas recuerdan durante la sesion la ultima pagina visitada. Productos asocia la pagina a los filtros y la busqueda activos.
- Las tablas permiten desplazar la pagina verticalmente al iniciar el gesto sobre ellas, conservando el desplazamiento horizontal de columnas.
- Productos, transferencias e historial de ventas comparten paginacion compacta con navegacion directa y controles adaptables a movil.
- Agent Iron tiene un boton compacto en movil y una animacion que respeta la preferencia de movimiento reducido.
- `Ventas` separa `Venta nueva` y `Ventas de punto de venta`.
- `Productos` permite cargar `price`, `imageUrl` e imagenes a Supabase Storage en el bucket publico `product-images`.

## Integracion con catalogo

Desde este panel se confirma el pago de pedidos creados en `iron-catalog`.

Al confirmar un pedido:

- se crea una `Sale`;
- se descuenta stock;
- se vincula `saleId` al `CatalogOrder`.

## Modo offline

### Preparacion y acceso

1. Abri el panel e inicia sesion con conexion. En `localhost` el service worker tambien se instala con `npm run dev`; en produccion se requiere HTTPS.
2. El panel descarga productos, variantes, precios, puntos de venta, depositos y stock en IndexedDB. No descarga imagenes. El service worker guarda la pagina `/offline` y sus recursos. Espera el indicador `Datos offline preparados` antes de cortar la conexion.
3. Al perder conexion con el backend aparece `Modo offline`. La disponibilidad se comprueba al reconectar, al abrir la pestana y cada 45 segundos mientras este visible. Durante una sesion, el respaldo se actualiza aproximadamente cada 5 minutos.

Si recargas o reabres el sitio sin conexion despues de prepararlo, el service worker muestra la pantalla `/offline`, aunque la URL conserve la ruta recargada. Alli se recuperan el catalogo y las ventas pendientes del dispositivo. Cuando vuelve la conexion, `/offline` permite regresar al panel.

### Funciones disponibles

- **Productos:** busqueda y detalle de variantes con el ultimo stock conocido por punto de venta y deposito. Las imagenes no se cargan y no se permite crear, editar ni eliminar productos sin conexion.
- **Venta nueva:** permite registrar ventas pendientes desde una misma ubicacion. El carrito, la ubicacion, el medio de pago y el articulo seleccionado se conservan por usuario en el dispositivo.
- **Sincronizacion:** permite revisar, reintentar o descartar ventas pendientes. Cada venta utiliza un identificador para evitar duplicados al reintentar.

Mientras el panel esta offline, el menu lateral queda desactivado. Dashboard, historial, stock bajo, transferencias, Tienda Nube, configuracion, pedidos de punto de venta y Agent Iron no estan disponibles. Tampoco se puede cerrar sesion con ventas pendientes o sin conexion.

### Donde se guardan los datos y como probarlo

El catalogo y la cola de ventas viven en IndexedDB; el borrador del carrito, en `localStorage`. Borrar los datos del sitio o desinstalarlo elimina las ventas aun no sincronizadas y los borradores, pero no afecta las ventas confirmadas en PostgreSQL.

Para probar una recarga, inicia sesion con backend y frontend activos, espera `Datos offline preparados`, activa **Network > Offline** en las herramientas del navegador, guarda una venta pendiente y recarga. Debe aparecer la pantalla offline con el catalogo y la venta guardados. Vuelve a **Online** para comprobar la sincronizacion.

Las pruebas `offline-shell.test.cjs` verifican que la pagina pueda servirse desde la cache y que no se marque como preparada si faltan recursos.

Antes de desplegar el hito offline, aplica la migracion del backend `prisma/manual-migrations/20260930_offline_sales.sql` indicada en `backend/README.md`.
