"use client";

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { AuthUser } from '@/types/auth';

interface HeaderProps {
  user: AuthUser;
}

export function Header({ user }: HeaderProps) {
  const { toggleSidebar } = useUiStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const section = pathname.startsWith('/productos') ? 'Productos'
    : pathname.startsWith('/ventas') ? 'Ventas'
    : pathname.startsWith('/transferencias') ? 'Transferencias'
    : pathname.startsWith('/gestion-tienda-nube') ? 'Tienda Nube'
    : pathname.startsWith('/configuracion') ? 'Configuración'
    : pathname.startsWith('/stock-bajo') ? 'Stock bajo' : 'Resumen';

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.replace('/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-black/10 bg-white px-4 sm:px-8 xl:px-12">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Abrir menú de navegación"
        className="lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>

      <div className="min-w-0 flex-1 truncate text-sm font-semibold text-black/65">Ironthreads <span className="mx-2 text-primary">/</span> {section}</div>

      <div className="flex items-center gap-3">
        <div className="hidden min-w-0 text-right sm:block">
          <p className="truncate text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
          <p className="text-xs text-gray-500">@{user.username}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout} disabled={isLoggingOut}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Cerrar sesión</span><span className="sm:hidden">Salir</span>
        </Button>
      </div>
    </header>
  );
}
