'use client';

import { PieChartCard } from './pie-chart-card';
import { SizeDistribution } from '@/types/analytics';

interface PieChartBySizeProps {
  data: SizeDistribution[];
  isLoading: boolean;
}

export function PieChartBySize({ data, isLoading }: PieChartBySizeProps) {
  const chartData = data.map((d) => ({
    name: d.sizeName,
    value: d.totalStock,
  }));

  return (
    <PieChartCard
      title="Stock por Talle"
      data={chartData}
      isLoading={isLoading}
    />
  );
}
