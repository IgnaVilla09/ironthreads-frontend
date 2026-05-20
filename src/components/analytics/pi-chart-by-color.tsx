'use client';

import { PieChartCard } from './pie-chart-card';
import { ColorDistribution } from '@/types/analytics';
import { COLOR_LABELS, COLOR_HEX } from '@/lib/constants';

interface PieChartByColorProps {
  data: ColorDistribution[];
  isLoading: boolean;
}

export function PieChartByColor({ data, isLoading }: PieChartByColorProps) {
  const chartData = data.map((d) => ({
    name: COLOR_LABELS[d.colorName] ?? d.colorName,
    value: d.totalStock,
    color: COLOR_HEX[d.colorName] ?? '#999',
  }));

  return (
    <PieChartCard
      title="Stock por Color"
      data={chartData}
      isLoading={isLoading}
    />
  );
}
