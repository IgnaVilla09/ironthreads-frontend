import { Suspense } from 'react';
import { OfflineWorkspace } from '@/components/offline/offline-workspace';

export default function PendingSalesPage() {
  return <Suspense><OfflineWorkspace initialTab="pending" /></Suspense>;
}
