# Iron Frontend

Panel privado de `Iron Stock`.

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

## Verificacion

```bash
npm run typecheck
node --test offline-shell.test.cjs
```

## Cambios relevantes

- `Ventas` ahora separa:
  - `Venta nueva`
  - `Ventas de punto de venta`
- `Productos` ahora permite cargar:
  - `price`
  - `imageUrl`
  - imagen a `Supabase Storage` en el bucket publico `product-images`

## Integracion con catalogo

Desde este panel se confirma el pago de pedidos creados en `iron-catalog`.

Al confirmar un pedido:

- se crea una `Sale`
- se descuenta stock
- se vincula `saleId` al `CatalogOrder`

## Modo offline

### Preparación y acceso

1. Abrí el panel e iniciá sesión **con conexión**. En `localhost` el service worker
   también se instala con `npm run dev`; en producción se requiere HTTPS.
2. El panel descarga productos, variantes, precios, puntos de venta, depósitos y
   stock en IndexedDB. No descarga imágenes. El service worker guarda la página
   `/offline` y sus recursos. Esperá el indicador **«Datos offline preparados»**
   antes de cortar la conexión: requiere tanto el respaldo de datos como la página.
3. Al perder conexión con el backend, aparece **«Modo offline»**. La disponibilidad
   se vuelve a comprobar al reconectar, al abrir la pestaña y cada 45 segundos
   mientras esté visible. Durante una sesión, el respaldo se actualiza cada 5
   minutos aproximadamente. La fecha del respaldo y de las ventas se muestra en
   formato de 24 horas.

Si recargás o reabrís el sitio sin conexión después de prepararlo, el service worker
muestra la pantalla `/offline` (aunque la URL siga siendo la que recargaste). Allí
se recuperan el catálogo y las ventas pendientes del
dispositivo. Si no se pudo confirmar que la página esté lista para recargar, aparece
una advertencia. También se advierte si el navegador no puede guardar el borrador
de una venta. Cuando vuelve la conexión, `/offline` permite regresar al panel.

### Funciones disponibles

- **Productos:** búsqueda y detalle de variantes con stock por punto de venta y
  depósito. Las cifras indican el **último stock conocido**, no una reserva; las
  imágenes no se cargan offline. No se permite crear, editar ni eliminar productos.
- **Venta nueva:** permite agregar varios artículos de una misma ubicación y
  registrar una venta *pendiente de sincronización*. El carrito, ubicación, medio
  de pago y datos del artículo seleccionado se conservan como borrador local por
  usuario incluso al recargar. La venta todavía no descuenta stock en el servidor.
- **Sincronización:** muestra ventas pendientes y las que **requieren revisión**.
  Cuando regresa la conexión, el panel intenta enviar las pendientes. Si el servidor
  rechaza una venta (por ejemplo, por falta de stock), se conserva para ajustar
  cantidades, reintentar o descartar. La confirmación ocurre únicamente tras la
  respuesta del backend; cada venta tiene un ID para evitar duplicados al reintentar.

Mientras esté offline, **todo el menú lateral queda desactivado**. Usá las pestañas
de la pantalla offline para Productos, Venta nueva y Sincronización. Dashboard,
historial, stock bajo, transferencias, Tienda Nube, configuración, pedidos de punto
de venta y Agent Iron no están disponibles. En el menú online, **Sincronización**
figura justo antes de Configuración. No se puede cerrar sesión con ventas pendientes
o sin conexión.

### Dónde se guardan los datos y cómo probarlo

El catálogo y la cola de ventas viven en **IndexedDB**; el borrador del carrito, en
`localStorage`. Son datos locales a cada navegador/dispositivo y usuario. Borrar los
datos del sitio o desinstalarlo **elimina las ventas aún no sincronizadas y los
borradores**; no afecta a las ventas ya confirmadas en PostgreSQL.

Para probar una recarga: con backend y frontend funcionando, iniciá sesión y esperá
«Datos offline preparados»; activá **Network → Offline** en las herramientas del
navegador, guardá una venta pendiente y recargá. Debe aparecer la pantalla offline con el
catálogo y la venta guardados. Volvé a **Online** para comprobar la sincronización.
Las pruebas automatizadas `offline-shell.test.cjs` verifican que la página se pueda
servir desde la caché y que no se marque preparada si le faltan recursos.

Antes de desplegar esta versión, aplicá a la base correspondiente la migración del
backend `prisma/manual-migrations/20260930_offline_sales.sql` (ver
`backend/README.md`).
