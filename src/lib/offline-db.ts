import type { Product, InventoryItem } from '@/types/product';
import type { CreateSaleInput } from '@/types/venta';
import type { AuthUser } from '@/types/auth';

export type OfflineProduct = Omit<Product, 'variants'> & { variants: (Product['variants'][number] & { locations: Omit<InventoryItem, 'variant'>[] })[] };
export type Snapshot = { userId: string; updatedAt: string; products: OfflineProduct[] };
export type PendingSale = { id: string; userId: string; createdAt: string; status: 'pending' | 'review'; reason?: string; sale: CreateSaleInput & { clientRequestId: string } };
export const OFFLINE_USER_KEY = 'iron-offline-user';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('iron-offline', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('snapshots')) db.createObjectStore('snapshots', { keyPath: 'userId' });
      if (!db.objectStoreNames.contains('sales')) db.createObjectStore('sales', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function operation<T>(store: 'snapshots' | 'sales', mode: IDBTransactionMode, execute: (object: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, mode);
    const request = execute(transaction.objectStore(store));
    transaction.oncomplete = () => { resolve(request.result); db.close(); };
    transaction.onerror = () => { reject(transaction.error); db.close(); };
    transaction.onabort = () => { reject(transaction.error); db.close(); };
  });
}

export const offlineDb = {
  snapshot: async (userId: string) => (await operation<Snapshot | undefined>('snapshots', 'readonly', (store) => store.get(userId))) ?? null,
  saveSnapshot: (snapshot: Snapshot) => operation('snapshots', 'readwrite', (store) => store.put(snapshot)),
  sales: async (userId: string) => ((await operation<PendingSale[]>('sales', 'readonly', (store) => store.getAll())) ?? [])
    .filter((sale) => sale.userId === userId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  saveSale: (sale: PendingSale) => operation('sales', 'readwrite', (store) => store.put(sale)),
  deleteSale: (id: string) => operation('sales', 'readwrite', (store) => store.delete(id)),
  clearSnapshot: (userId: string) => operation('snapshots', 'readwrite', (store) => store.delete(userId)),
};

export function offlineUser(): AuthUser | null {
  try { return JSON.parse(localStorage.getItem(OFFLINE_USER_KEY) ?? 'null') as AuthUser | null; }
  catch { return null; }
}
