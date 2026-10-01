import { Suspense } from 'react';
import { OfflineWorkspace } from '@/components/offline/offline-workspace';

export default function OfflinePage() {
  return <Suspense><OfflineWorkspace /></Suspense>;
}
