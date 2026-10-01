"use client";

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { CloudOff, LogOut, Menu } from "lucide-react";
import { AuthUser } from '@/types/auth';
import { useOfflineStore } from '@/stores/offline-store';
import { offlineDb, OFFLINE_USER_KEY } from '@/lib/offline-db';
import { formatOfflineDateTime } from '@/lib/formatters';
import { useHydrated } from '@/hooks/use-hydrated';

interface HeaderProps {
  user: AuthUser;
}

export function Header({ user }: HeaderProps) {
  const { toggleSidebar } = useUiStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const hydrated = useHydrated();
  const { offline, pending, syncing, snapshotAt, prepared } = useOfflineStore();
  const section = pathname === '/ventas/pendientes' ? 'Sincronización'
    : pathname.startsWith('/productos') ? 'Productos'
    : pathname.startsWith('/ventas') ? 'Ventas'
    : pathname.startsWith('/transferencias') ? 'Transferencias'
    : pathname.startsWith('/gestion-tienda-nube') ? 'Tienda Nube'
    : pathname.startsWith('/configuracion') ? 'Configuración'
    : pathname.startsWith('/stock-bajo') ? 'Stock bajo' : 'Resumen';

  const handleLogout = async () => {
    if (offline || pending > 0) return;
    setIsLoggingOut(true);

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      await offlineDb.clearSnapshot(user.id);
      localStorage.removeItem(OFFLINE_USER_KEY);
      localStorage.removeItem(`iron-offline-draft:${user.id}`);
      router.replace('/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex min-h-16 shrink-0 flex-wrap items-center gap-3 border-b border-black/10 bg-white px-4 py-2 sm:px-8 xl:px-12">
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
      {hydrated && (offline || pending > 0 || syncing) && <div role="status" className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-950">
        <CloudOff className="h-4 w-4" aria-hidden="true" />{offline ? 'Modo offline' : syncing ? 'Sincronizando…' : 'Con conexión'}
        {snapshotAt && <span className="hidden sm:inline">· Datos: {formatOfflineDateTime(snapshotAt)}</span>}
        {pending > 0 && (offline ? <span>· {pending} pendiente(s)</span> : <a className="underline" href="/offline?tab=pending">· {pending} pendiente(s)</a>)}
      </div>}
      {hydrated && !offline && prepared && snapshotAt && <span className="hidden text-xs text-green-700 xl:inline">Datos offline preparados</span>}

      <div className="flex items-center gap-3">
        <div className="hidden min-w-0 text-right sm:block">
          <p className="truncate text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
          <p className="text-xs text-gray-500">@{user.username}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout} title={hydrated && (offline || pending > 0) ? 'Sincronizá tus ventas pendientes antes de salir' : undefined} disabled={!hydrated || isLoggingOut || offline || pending > 0}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Cerrar sesión</span><span className="sm:hidden">Salir</span>
        </Button>
      </div>
    </header>
  );
}
