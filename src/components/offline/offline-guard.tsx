'use client';

import { useOfflineStore } from '@/stores/offline-store';
import { OfflineWorkspace } from './offline-workspace';
import { usePathname } from 'next/navigation';
import { useHydrated } from '@/hooks/use-hydrated';

export function OfflineGuard({ children }: { children: React.ReactNode }) {
  const offline = useOfflineStore((state) => state.offline);
  const hydrated = useHydrated();
  const pathname = usePathname();
  return hydrated && offline ? <OfflineWorkspace embedded initialTab={pathname.startsWith('/ventas') ? pathname.includes('pendientes') ? 'pending' : 'sale' : 'products'} /> : children;
}
