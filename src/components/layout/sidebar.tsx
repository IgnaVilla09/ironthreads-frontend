'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/ui-store';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  History,
  Settings,
  Plus,
  X,
  ArrowLeftRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navigation = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Ventas',
    href: '/ventas',
    icon: ShoppingCart,
  },
  {
    label: 'Historial',
    href: '/ventas/historial',
    icon: History,
  },
  {
    label: 'Productos',
    href: '/productos',
    icon: Package,
  },
  {
    label: 'Transferencias',
    href: '/transferencias',
    icon: ArrowLeftRight,
  },
  {
    label: 'Configuración',
    href: '/configuracion',
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
          'fixed top-0 left-0 z-50 flex h-full w-64 flex-col border-r bg-white transition-transform duration-300 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm font-bold">
              I
            </div>
            <span className="text-lg font-bold tracking-tight">Iron Stock</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Separator />

        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Separator />

        <div className="p-4">
          <Link href="/productos/nuevo">
            <Button className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Producto
            </Button>
          </Link>
        </div>
      </aside>
    </>
  );
}
