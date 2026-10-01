import { create } from 'zustand';

type OfflineState = {
  offline: boolean;
  checking: boolean;
  syncing: boolean;
  snapshotAt: string | null;
  pending: number;
  prepared: boolean;
  setStatus: (online: boolean) => void;
  setChecking: (checking: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setSnapshotAt: (date: string | null) => void;
  setPending: (count: number) => void;
  setPrepared: (prepared: boolean) => void;
};
export const useOfflineStore = create<OfflineState>((set) => ({
  offline: false, checking: true, syncing: false, snapshotAt: null, pending: 0, prepared: false,
  setStatus: (online) => set({ offline: !online, checking: false }),
  setChecking: (checking) => set({ checking }),
  setSyncing: (syncing) => set({ syncing }),
  setSnapshotAt: (snapshotAt) => set({ snapshotAt }),
  setPending: (pending) => set({ pending }),
  setPrepared: (prepared) => set({ prepared }),
}));
