"use client";

import Image from "next/image";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  History,
  Settings,
  X,
  ArrowLeftRight,
  Store,
  RefreshCw,
  LockKeyhole,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOfflineStore } from '@/stores/offline-store';
import { useHydrated } from '@/hooks/use-hydrated';

const navigation = [
  {
    label: "Resumen",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Ventas",
    href: "/ventas",
    icon: ShoppingCart,
  },
  {
    label: "Historial",
    href: "/ventas/historial",
    icon: History,
  },
  {
    label: "Productos",
    href: "/productos",
    icon: Package,
  },
  {
    label: "Transferencias",
    href: "/transferencias",
    icon: ArrowLeftRight,
  },
  {
    label: "Tienda Nube",
    href: "/gestion-tienda-nube",
    icon: Store,
  },
  {
    label: "Sincronización",
    href: "/ventas/pendientes",
    icon: RefreshCw,
  },
  {
    label: "Configuración",
    href: "/configuracion",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const hydrated = useHydrated();
  const isOffline = useOfflineStore((state) => state.offline);
  const checking = useOfflineStore((state) => state.checking);
  const navigationUnavailable = hydrated && (isOffline || checking);
  const offline = hydrated && isOffline;

  useEffect(() => {
    if (!sidebarOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <>
      {hydrated && sidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú de navegación"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        aria-label="Navegación principal"
        className={cn(
          "fixed left-0 top-0 z-50 flex h-dvh w-64 flex-col overflow-y-auto overscroll-contain border-r border-white/10 bg-black text-white transition-transform duration-300 lg:static lg:visible lg:translate-x-0",
          hydrated && sidebarOpen ? "visible translate-x-0" : "invisible -translate-x-full",
        )}
      >
        <div className="relative border-b border-white/15 px-5 pb-7 pt-8">
          {navigationUnavailable ? <div className="flex flex-col items-start gap-1" aria-label="Ironthreads: navegación no disponible">
            <Image src="/assets/logo.png" alt="Ironthreads" width={554} height={139} className="h-auto w-44 object-contain" priority />
            <span className="ml-1 text-xs font-semibold tracking-[0.18em] text-white/65">STOCK / OPERACIONES</span>
          </div> : <Link
            href="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex flex-col items-start gap-1 rounded-sm text-left focus-visible:outline-offset-4"
          >
            <Image
              src="/assets/logo.png"
              alt="Ironthreads"
              width={554}
              height={139}
              className="h-auto w-44 object-contain"
              priority
            />
            <span className="ml-1 text-xs font-semibold tracking-[0.18em] text-white/65">
              STOCK / OPERACIONES
            </span>
          </Link>}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cerrar menú"
            className="absolute right-3 top-3 text-white hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <nav aria-label="Secciones" className="flex-1 space-y-1 px-3 py-6">
          {navigationUnavailable && <p className="mb-4 px-3 text-xs leading-relaxed text-amber-200">{offline ? 'Modo offline: usá las pestañas de la ventana principal.' : 'Comprobando conexión…'}</p>}
          {navigation.map((item) => {
            const isActive = item.href === "/ventas"
              ? pathname === "/ventas" || pathname.startsWith("/ventas/nueva") || pathname.startsWith("/ventas/puntos-de-venta")
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return navigationUnavailable ? (
              <span key={item.href} aria-disabled="true" aria-label={`${item.label}: ${offline ? 'requiere conexión' : 'comprobando conexión'}`} title={offline ? 'Requiere conexión' : 'Comprobando conexión'} className="flex min-h-11 cursor-not-allowed items-center gap-3 rounded-md border-l-[3px] border-transparent px-3 py-2.5 text-sm text-white/35">
                <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />{item.label}<LockKeyhole className="ml-auto h-3 w-3" aria-hidden="true" />
              </span>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-md border-l-[3px] px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-offset-[-2px]",
                  isActive
                    ? "border-primary bg-white/10 text-white"
                    : "border-transparent text-white/65 hover:bg-white/10 hover:text-white",
                )}
              >
                <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-primary")} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/15 px-6 py-5 text-xs text-white/45">Ironthreads / Gestión de inventario</div>
      </aside>
    </>
  );
}
