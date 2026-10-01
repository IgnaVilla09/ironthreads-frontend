'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser } from '@/types/auth';
import { OFFLINE_USER_KEY, offlineDb, offlineUser, type Snapshot } from '@/lib/offline-db';
import { useOfflineStore } from '@/stores/offline-store';

let syncInProgress = false;

export async function syncPending(userId: string) {
  if (syncInProgress) return;
  syncInProgress = true;
  const state = useOfflineStore.getState();
  state.setSyncing(true);
  try {
    for (const entry of await offlineDb.sales(userId)) {
      if (entry.status === 'review') continue;
      try {
        const response = await fetch('/api/backend/ventas', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry.sale),
        });
        if (response.status === 401 || response.status >= 500) break;
        if (!response.ok) {
          const payload = await response.json();
          await offlineDb.saveSale({ ...entry, status: 'review', reason: payload.error?.message ?? 'No se pudo confirmar la venta' });
          continue;
        }
        await offlineDb.deleteSale(entry.id);
      } catch { break; }
    }
  } finally {
    state.setPending((await offlineDb.sales(userId)).length);
    state.setSyncing(false);
    syncInProgress = false;
  }
}

export function OfflineProvider({ user }: { user?: AuthUser }) {
  const router = useRouter();
  useEffect(() => {
    const currentUser = user ?? offlineUser();
    if (!currentUser) return;
    if (user) localStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(user));
    let alive = true;
    let lastSnapshot = 0;
    offlineDb.snapshot(currentUser.id).then((snapshot) => {
      if (alive) useOfflineStore.getState().setSnapshotAt(snapshot?.updatedAt ?? null);
    }).catch(() => {});
    offlineDb.sales(currentUser.id).then((sales) => {
      if (alive) useOfflineStore.getState().setPending(sales.length);
    }).catch(() => {});
    if ('caches' in window) {
      caches.keys().then(async (keys) => {
        const shells = keys.filter((key) => key.startsWith('iron-offline-shell-'));
        const pages = await Promise.all(shells.map(async (key) => (await caches.open(key)).match('/offline')));
        if (alive && pages.some(Boolean)) useOfflineStore.getState().setPrepared(true);
      }).catch(() => {});
    }

    let removeWorkerListener = () => {};
    if ('serviceWorker' in navigator && navigator.onLine) {
      const prepare = (worker: ServiceWorker | null) => {
        if (!worker || !alive) return;
        const channel = new MessageChannel();
        channel.port1.onmessage = (event: MessageEvent<{ ready: boolean }>) => {
          if (alive) useOfflineStore.getState().setPrepared(event.data.ready);
          channel.port1.close();
        };
        worker.postMessage({ type: 'PREPARE_OFFLINE' }, [channel.port2]);
      };
      const onControllerChange = () => {
        useOfflineStore.getState().setPrepared(false);
        prepare(navigator.serviceWorker.controller);
      };
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
      navigator.serviceWorker.register('/sw.js').then(async () => {
        if (!alive) return;
        prepare((await navigator.serviceWorker.ready).active);
        router.prefetch('/offline');
      }).catch(() => {});
      // Removed together with the other provider listeners below.
      removeWorkerListener = () => navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    }

    const check = async () => {
      if (!navigator.onLine) { useOfflineStore.getState().setStatus(false); return; }
      try {
        if (Date.now() - lastSnapshot < 5 * 60_000) {
          const health = await fetch('/api/backend/health', { cache: 'no-store' });
          if (health.status === 401) { useOfflineStore.getState().setChecking(false); return; }
          if (!health.ok) throw new Error('Servidor no disponible');
          useOfflineStore.getState().setStatus(true);
          await syncPending(currentUser.id).catch(() => {});
          return;
        }
        const response = await fetch('/api/backend/products/offline-snapshot', { cache: 'no-store' });
        if (response.status === 401) { useOfflineStore.getState().setChecking(false); return; }
        if (!response.ok) throw new Error('Servidor no disponible');
        const payload = await response.json() as { data: Omit<Snapshot, 'userId'> };
        if (!alive) return;
        useOfflineStore.getState().setStatus(true);
        lastSnapshot = Date.now();
        try {
          await offlineDb.saveSnapshot({ ...payload.data, userId: currentUser.id });
          useOfflineStore.getState().setSnapshotAt(payload.data.updatedAt);
        } catch { useOfflineStore.getState().setPrepared(false); }
        await syncPending(currentUser.id).catch(() => {});
      } catch { if (alive) useOfflineStore.getState().setStatus(false); }
    };
    void check();
    const interval = window.setInterval(() => { if (!document.hidden) void check(); }, 45_000);
    const onOnline = () => { void check(); };
    const onOffline = () => useOfflineStore.getState().setStatus(false);
    const onVisible = () => { if (!document.hidden) void check(); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      removeWorkerListener();
      window.clearInterval(interval);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [user?.id, router]);
  return null;
}
