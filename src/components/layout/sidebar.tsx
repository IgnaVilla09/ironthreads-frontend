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
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
    label: "Configuración",
    href: "/configuracion",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUiStore();

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
      {sidebarOpen && (
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
          sidebarOpen ? "visible translate-x-0" : "invisible -translate-x-full",
        )}
      >
        <div className="relative border-b border-white/15 px-5 pb-7 pt-8">
          <Link
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
          </Link>
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
          {navigation.map((item) => {
            const isActive = item.href === "/ventas"
              ? pathname === "/ventas" || pathname.startsWith("/ventas/nueva") || pathname.startsWith("/ventas/puntos-de-venta")
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
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
