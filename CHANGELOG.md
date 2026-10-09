# Historial de versiones - Iron Stock (frontend)

Version actual: **2.4.0**.

Los hitos anteriores se reconstruyeron a partir del historial de commits del frontend y se alinearon con los del backend. No se crearon etiquetas ni releases para todas estas versiones: las fechas y los hashes indican cuando se incorporaron los cambios, no necesariamente cuando se publicaron formalmente.

## 2.4.0 - 2026-10-09 - Aplicacion nativa con Tauri v2

- Empaquetado del panel como aplicacion de escritorio (Windows) y movil (Android) con Tauri v2.
- La app carga el frontend publicado en Vercel; el backend sigue en Render y los Route Handlers de Vercel actuan como BFF.
- Configuracion sin APIs nativas expuestas al contenido remoto (`capabilities` vacias) y `productName` `Iron Stock` con titulo `Iron Stock | Gestion Iron Threads`.
- Version nativa derivada de `package.json` para mantener la sincronizacion semantica.

Cambios sobre `727c0e0`. Mejora compatible; no requiere cambios adicionales del backend.

## 2.3.0 - 2026-10-09 - Login y navegacion persistente

- Mejora responsive del login, con la frase de marca integrada en el panel oscuro de pantallas pequenas.
- Control accesible para mostrar la contrasena unicamente mientras se mantiene presionado o activado desde el teclado.
- Persistencia durante la sesion de la pagina seleccionada en Productos, respetando la combinacion actual de filtros y busqueda.
- Persistencia independiente de la pagina seleccionada en el historial de ventas.
- Recuperacion automatica de la ultima pagina valida si disminuye la cantidad de resultados.

Cambios sobre `727c0e0`. Mejora compatible del frontend; no requiere cambios adicionales del backend.

## 2.2.0 - 2026-10-08 - Edicion de ventas y mejoras de interfaz

- Incorporacion del precio unitario acordado en ventas nuevas, con validacion y calculo del total.
- Edicion de ventas mediante devolucion y entrega de articulos, registro de diferencias, motivo obligatorio e historial de cambios.
- Acceso a la edicion desde el historial y desde las ventas asociadas a pedidos de punto de venta.
- Reintentos protegidos contra duplicados y actualizacion del respaldo offline despues de editar una venta.
- Mejoras compatibles de tablas, paginacion y Agent Iron descritas previamente bajo 2.1.1.

Commit: `727c0e0`. Los cambios de 2.1.1 no tuvieron un commit o release independiente.

## 2.1.1 - 2026-10-07 - Tablas, paginacion y Agent Iron

- Correccion del bloqueo de scroll vertical al iniciar gestos tactiles sobre las tablas, conservando el desplazamiento horizontal de columnas.
- Ajuste del contenedor del dashboard y del scroll anidado de tablas en dialogos.
- Paginacion compacta compartida por productos, transferencias e historial de ventas en desktop y movil.
- Campo de navegacion directa con validacion, navegacion al 404 para valores invalidos y controles accesibles.
- Boton de Agent Iron compacto en movil, con espacio inferior para acceder a la paginacion por encima del boton flotante.
- Saludo sutil de Agent Iron que se desactiva al interactuar, abrir el chat, estar offline o preferir movimiento reducido.

Estos cambios quedaron incluidos en `727c0e0` y en la version 2.2.0.

## 2.1.0 - 2026-10-01 - Operacion offline

- Panel offline/PWA con service worker, respaldo local de productos, variantes y stock por ubicacion, y consulta sin descargar imagenes.
- Ventas pendientes en el dispositivo, borrador que sobrevive a una recarga, sincronizacion al reconectar y revision de conflictos.
- Estados visuales para secciones no disponibles, proxy autenticado de la API y pruebas de la pagina almacenada para uso offline.

Commit: `14d9e99`.

## 2.0.0 - 2026-09-28 a 2026-09-30 - Agent Iron

- Chat de consultas de stock integrado al panel, historial y proxy de solicitudes autenticadas al backend.
- Mejoras de accesibilidad y presentacion del panel, busqueda de productos y tablas adaptables a pantallas pequenas.

Commits: `4957768` a `e1ad033`.

## 1.3.0 - 2026-09-10 - Correcciones de variantes

- Ajustes a la eliminacion de variantes desde el formulario y la tabla de productos.
- Hito compartido con el backend, que incorporo notificaciones de pedidos por correo durante septiembre.

Commit: `862f96b`.

## 1.2.0 - 2026-06-22 a 2026-07-30 - Acceso y catalogo

- Login y sesion del panel; vistas de Tienda Nube con checkouts y registros.
- Pedidos del catalogo en Ventas de punto de venta, formulario de venta manual separado, precios e imagenes con Supabase Storage.
- Vista de stock bajo y mejoras de filtros y carga de productos.

Commits: `89b62cb` a `f53c564`.

## 1.1.0 - 2026-05-21 a 2026-05-30 - Ventas e inventario

- Venta manual e historial, puntos de venta y depositos.
- Transferencias de stock, exportaciones de inventario y ventas a Excel, y estadisticas de talles vendidos.

Commits: `e225557` a `c21419b`.

## 1.0.0 - 2026-05-20 a 2026-05-21 - Base del panel

- Estructura inicial de Next.js con gestion de productos, variantes, configuracion y dashboard de stock.
- Ajustes iniciales de presentacion.

Commits: `aa1e17e` a `57adf70`.
