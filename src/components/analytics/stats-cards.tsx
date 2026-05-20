'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GeneralStats } from '@/types/analytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, AlertTriangle, Layers, BarChart3 } from 'lucide-react';

interface StatsCardsProps {
  data: GeneralStats | null;
  isLoading: boolean;
}

const statCards = [
  {
    title: 'Total Productos',
    icon: Package,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    getValue: (d: GeneralStats) => d.totalProducts,
  },
  {
    title: 'Stock Total',
    icon: Layers,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    getValue: (d: GeneralStats) => d.totalStock,
  },
  {
    title: 'Categorías',
    icon: BarChart3,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    getValue: (d: GeneralStats) => d.categoriesCount,
  },
  {
    title: 'Stock Bajo',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    getValue: (d: GeneralStats) => `${d.lowStockCount} (${d.lowStockPercentage}%)`,
  },
];

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="animate-fade-in-up">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.getValue(data)}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
