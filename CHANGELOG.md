# Historial de versiones — Iron Stock (frontend)

La versión actual es **2.1.0**. Los hitos anteriores se reconstruyeron a partir del
historial de commits del frontend y se alinearon con los del backend. Hasta ahora
`package.json` permanecía en `1.0.0` y **no se crearon etiquetas ni releases** para
estas versiones: las fechas y los hashes indican cuándo se incorporaron los cambios,
no cuándo se publicó formalmente cada versión.

## 2.1.0 — 2026-10-01 · Operación offline

- Panel offline/PWA con service worker, respaldo local de productos, variantes y
  stock por ubicación, y consulta sin descargar imágenes.
- Ventas pendientes en el dispositivo, borrador de venta que sobrevive a una recarga,
  sincronización al reconectar y revisión de conflictos.
- Estados visuales para secciones no disponibles, proxy autenticado de la API y
  pruebas de la página almacenada para uso offline.

Commits: `14d9e99`.

## 2.0.0 — 2026-09-28 a 2026-09-30 · Agent Iron

- Chat de consultas de stock integrado al panel, historial y proxy de solicitudes
  autenticadas al backend.
- Mejoras de accesibilidad y presentación del panel, búsqueda de productos y tablas
  adaptables a pantallas pequeñas.

Commits: `4957768` → `e1ad033`.

## 1.3.0 — 2026-09-10 · Correcciones de variantes

- Ajustes a la eliminación de variantes desde el formulario y la tabla de productos.
- Hito compartido con el backend, que incorporó también notificaciones de pedidos
  por correo durante septiembre.

Commit: `862f96b`.

## 1.2.0 — 2026-06-22 a 2026-07-30 · Acceso y catálogo

- Login y sesión del panel; vistas de Tienda Nube con checkouts y registros.
- Pedidos del catálogo en Ventas de punto de venta, formulario de venta manual
  separado, precios e imágenes con Supabase Storage.
- Vista de stock bajo y mejoras de filtros y carga de productos.

Commits: `89b62cb` → `f53c564`.

## 1.1.0 — 2026-05-21 a 2026-05-30 · Ventas e inventario

- Venta manual e historial, puntos de venta y depósitos.
- Transferencias de stock, exportaciones de inventario y ventas a Excel, y
  estadísticas de talles vendidos.

Commits: `e225557` → `c21419b`.

## 1.0.0 — 2026-05-20 a 2026-05-21 · Base del panel

- Estructura inicial de Next.js con gestión de productos, variantes, configuración
  y dashboard de stock, además de ajustes iniciales de presentación.

Commits: `aa1e17e` → `57adf70`.
