'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { SizeDistribution, ColorDistribution, BestSellingSize, GeneralStats } from '@/types/analytics';

interface AnalyticsState {
  bySize: SizeDistribution[];
  byColor: ColorDistribution[];
  bestSellingSizes: BestSellingSize[];
  generalStats: GeneralStats | null;
  isLoading: boolean;
  isError: boolean;
}

export function useAnalytics() {
  const [state, setState] = useState<AnalyticsState>({
    bySize: [],
    byColor: [],
    bestSellingSizes: [],
    generalStats: null,
    isLoading: true,
    isError: false,
  });

  useEffect(() => {
    async function fetchAll() {
      try {
        const [sizeRes, colorRes, bestSellingRes, statsRes] = await Promise.all([
          apiClient.get<SizeDistribution[]>('/api/v1/analytics/by-size'),
          apiClient.get<ColorDistribution[]>('/api/v1/analytics/by-color'),
          apiClient.get<BestSellingSize[]>('/api/v1/analytics/best-selling-sizes'),
          apiClient.get<GeneralStats>('/api/v1/analytics/general-stats'),
        ]);

        setState({
          bySize: sizeRes.data ?? [],
          byColor: colorRes.data ?? [],
          bestSellingSizes: bestSellingRes.data ?? [],
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
