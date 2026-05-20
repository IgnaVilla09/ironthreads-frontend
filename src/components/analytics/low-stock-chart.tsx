'use client';

import { PieChartCard } from './pie-chart-card';
import { LowStockVariant } from '@/types/analytics';

interface LowStockChartProps {
  data: LowStockVariant[];
  isLoading: boolean;
}

export function LowStockChart({ data, isLoading }: LowStockChartProps) {
  if (isLoading) {
    return (
      <PieChartCard title="Variantes con Stock Bajo" data={[]} isLoading={true} />
    );
  }

  if (data.length === 0) {
    return (
      <PieChartCard
        title="Variantes con Stock Bajo"
        data={[]}
        isLoading={false}
        emptyMessage="✓ Todas las variantes tienen stock suficiente"
      />
    );
  }

  const chartData = data.slice(0, 10).map((d) => ({
    name: d.sku,
    value: d.stock,
  }));

  return (
    <PieChartCard
      title="Variantes con Stock Bajo"
      subtitle={`(${data.length} variantes)`}
      data={chartData}
      isLoading={false}
    />
  );
}
