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
