'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { SizeDistribution, ColorDistribution, LowStockVariant, GeneralStats } from '@/types/analytics';

interface AnalyticsState {
  bySize: SizeDistribution[];
  byColor: ColorDistribution[];
  lowStock: LowStockVariant[];
  generalStats: GeneralStats | null;
  isLoading: boolean;
  isError: boolean;
}

export function useAnalytics() {
  const [state, setState] = useState<AnalyticsState>({
    bySize: [],
    byColor: [],
    lowStock: [],
    generalStats: null,
    isLoading: true,
    isError: false,
  });

  useEffect(() => {
    async function fetchAll() {
      try {
        const [sizeRes, colorRes, lowStockRes, statsRes] = await Promise.all([
          apiClient.get<SizeDistribution[]>('/api/v1/analytics/by-size'),
          apiClient.get<ColorDistribution[]>('/api/v1/analytics/by-color'),
          apiClient.get<LowStockVariant[]>('/api/v1/analytics/low-stock'),
          apiClient.get<GeneralStats>('/api/v1/analytics/general-stats'),
        ]);

        setState({
          bySize: sizeRes.data ?? [],
          byColor: colorRes.data ?? [],
          lowStock: lowStockRes.data ?? [],
          generalStats: statsRes.data ?? null,
          isLoading: false,
          isError: false,
        });
      } catch {
        setState((prev) => ({ ...prev, isLoading: false, isError: true }));
      }
    }

    fetchAll();
  }, []);

  return state;
}
