'use client';

import { PieChartCard } from './pie-chart-card';
import { BestSellingSize } from '@/types/analytics';

interface BestSellingSizesChartProps {
  data: BestSellingSize[];
  isLoading: boolean;
}

export function BestSellingSizesChart({ data, isLoading }: BestSellingSizesChartProps) {
  if (isLoading) {
    return (
      <PieChartCard title="Talles Más Vendidos" data={[]} isLoading={true} />
    );
  }

  if (data.length === 0) {
    return (
      <PieChartCard
        title="Talles Más Vendidos"
        data={[]}
        isLoading={false}
        emptyMessage="✓ Sin ventas registradas"
      />
    );
  }

  const chartData = data.map((d) => ({
    name: d.sizeName,
    value: d.totalSold,
  }));

  return (
    <PieChartCard
      title="Talles Más Vendidos"
      subtitle={`(top ${data.length} talles)`}
      data={chartData}
      isLoading={false}
    />
  );
}
