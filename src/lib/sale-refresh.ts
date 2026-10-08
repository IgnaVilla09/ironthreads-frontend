import { apiClient } from './api-client';
import { offlineDb, offlineUser, type Snapshot } from './offline-db';
import { useOfflineStore } from '@/stores/offline-store';
import { useProductStore } from '@/stores/product-store';

export async function refreshAfterSaleEdit(): Promise<boolean> {
  const products = useProductStore.getState();
  products.resetSelectedProduct();
  void products.fetchProducts(products.pagination?.page ?? 1);
  // Invalidate an in-flight older snapshot in OfflineProvider as well.
  window.dispatchEvent(new Event('iron:inventory-changed'));
  const user = offlineUser();
  if (!user) return true;
  useOfflineStore.getState().setSnapshotAt(null);
  try {
    const result = await apiClient.get<Omit<Snapshot, 'userId'>>('/api/v1/products/offline-snapshot');
    if (!result.data) throw new Error('No se pudo actualizar el respaldo');
    await offlineDb.saveSnapshot({ ...result.data, userId: user.id });
    useOfflineStore.getState().setSnapshotAt(result.data.updatedAt);
    return true;
  } catch { return false; }
}
