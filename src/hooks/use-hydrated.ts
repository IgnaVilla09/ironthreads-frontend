'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

// The first browser render must match the server, even if a client store has
// already been updated by another component's effect or a previous navigation.
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
