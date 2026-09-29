'use client';

import Link from 'next/link';
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
    title: 'Productos',
    icon: Package,
    getValue: (d: GeneralStats) => d.totalProducts,
  },
  {
    title: 'Unidades en stock',
    icon: Layers,
    getValue: (d: GeneralStats) => d.totalStock,
  },
  {
    title: 'Categorías',
    icon: BarChart3,
    getValue: (d: GeneralStats) => d.categoriesCount,
  },
  {
    title: 'Stock bajo',
    icon: AlertTriangle,
    getValue: (d: GeneralStats) => d.lowStockSum,
    getDetail: (d: GeneralStats) => `${d.lowStockPercentage}% del inventario`,
    href: '/stock-bajo',
  },
];

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid overflow-hidden rounded-xl border border-black/10 bg-white sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-none border-0 border-b border-black/10 sm:border-r xl:border-b-0">
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
      <div className="grid overflow-hidden rounded-xl border border-black/10 bg-white sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const content = (
            <div className="h-full border-b border-black/10 px-6 py-6 sm:border-r xl:border-b-0">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-600">
                  {card.title}
                </span>
                <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              </div>
              <div className="mt-6 text-4xl font-extrabold leading-none tracking-[-0.06em] tabular-nums text-black">{new Intl.NumberFormat('es-AR').format(card.getValue(data))}</div>
              <p className="mt-3 text-xs text-gray-500">{'getDetail' in card && card.getDetail ? card.getDetail(data) : 'Inventario actual'}</p>
            </div>
          );

          if (card.href) {
            return (
              <Link key={card.title} href={card.href} className="block focus-visible:outline-offset-[-3px] hover:bg-accent/60">
                {content}
              </Link>
            );
          }

          return (
            <div key={card.title}>
              {content}
            </div>
          );
        })}
      </div>
  );
}
