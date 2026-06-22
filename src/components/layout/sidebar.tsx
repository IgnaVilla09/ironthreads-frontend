"use client";

import Image from "next/image";
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
import { Separator } from "@/components/ui/separator";

const navigation = [
  {
    label: "Dashboard",
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
    label: "Gestion Tienda Nube",
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

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full w-64 flex-col border-r bg-white transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="relative border-b px-4 py-4 sm:px-5 sm:py-5">
          <Link
            href="/dashboard"
            className="flex flex-col items-start gap-0 text-left"
          >
            <Image
              src="/assets/logo.png"
              alt="Iron Stock"
              width={224}
              height={224}
              className="mb-2 h-auto w-40 object-contain sm:mb-4 sm:w-48"
              priority
            />
            <span className="ml-2 text-lg font-bold tracking-tight leading-none sm:-mt-1 sm:text-xl">
              Iron Stock
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
