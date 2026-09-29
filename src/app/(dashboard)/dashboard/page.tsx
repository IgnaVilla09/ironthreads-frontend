'use client';

import dynamic from 'next/dynamic';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCards } from '@/components/analytics/stats-cards';
import { useAnalytics } from '@/hooks/use-analytics';
import { ErrorState } from '@/components/shared/error-state';
import { Skeleton } from '@/components/ui/skeleton';

const chartLoading = () => <Skeleton className="h-[380px] w-full rounded-xl" />;
const PieChartBySize = dynamic(
  () => import('@/components/analytics/pie-chart-by-size').then((mod) => mod.PieChartBySize),
  { loading: chartLoading, ssr: false }
);
const PieChartByColor = dynamic(
  () => import('@/components/analytics/pie-chart-by-color').then((mod) => mod.PieChartByColor),
  { loading: chartLoading, ssr: false }
);
const BestSellingSizesChart = dynamic(
  () => import('@/components/analytics/best-selling-sizes-chart').then((mod) => mod.BestSellingSizesChart),
  { loading: chartLoading, ssr: false }
);

export default function DashboardPage() {
  const { bySize, byColor, bestSellingSizes, generalStats, isLoading, isError } = useAnalytics();

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
        description="Una vista clara de tus productos, stock y movimientos."
      />

      <StatsCards data={generalStats} isLoading={isLoading} />

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        {isLoading ? chartLoading() : <PieChartBySize data={bySize} isLoading={false} />}
        {isLoading ? chartLoading() : <PieChartByColor data={byColor} isLoading={false} />}
      </div>
      <div className="mt-6">
        {isLoading ? chartLoading() : <BestSellingSizesChart data={bestSellingSizes} isLoading={false} />}
      </div>
    </PageContainer>
  );
}
