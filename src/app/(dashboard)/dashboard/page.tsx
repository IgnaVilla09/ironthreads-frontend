'use client';

import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCards } from '@/components/analytics/stats-cards';
import { PieChartBySize } from '@/components/analytics/pie-chart-by-size';
import { PieChartByColor } from '@/components/analytics/pie-chart-by-color';
import { LowStockChart } from '@/components/analytics/low-stock-chart';
import { useAnalytics } from '@/hooks/use-analytics';
import { ErrorState } from '@/components/shared/error-state';

export default function DashboardPage() {
  const { bySize, byColor, lowStock, generalStats, isLoading, isError } = useAnalytics();

  if (isError) {
    return (
      <PageContainer>
        <ErrorState message="No se pudieron cargar los datos del dashboard." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Resumen general del inventario"
      />

      <StatsCards data={generalStats} isLoading={isLoading} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <PieChartBySize data={bySize} isLoading={isLoading} />
        <PieChartByColor data={byColor} isLoading={isLoading} />
      </div>
      <div className="mt-6">
        <LowStockChart data={lowStock} isLoading={isLoading} />
      </div>
    </PageContainer>
  );
}
