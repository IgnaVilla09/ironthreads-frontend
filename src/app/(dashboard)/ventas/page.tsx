'use client';

import Link from 'next/link';
import { ShoppingBag, Store, ArrowRight } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const options = [
  {
    title: 'Venta nueva',
    description: 'Usá el flujo actual para registrar ventas manuales desde el stand.',
    href: '/ventas/nueva',
    icon: ShoppingBag,
  },
  {
    title: 'Ventas de punto de venta',
    description: 'Revisá pedidos del catálogo web y confirmá los pagos para descontar stock.',
    href: '/ventas/puntos-de-venta',
    icon: Store,
  },
];

export default function VentasHomePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Ventas"
        description="Elegí si querés registrar una venta manual o gestionar compras del catálogo web"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {options.map((option) => (
          <Card key={option.href} className="border-2 transition-colors hover:border-primary/30">
            <CardHeader className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <option.icon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>{option.title}</CardTitle>
                <p className="mt-2 text-sm text-gray-600">{option.description}</p>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={option.href}>
                <Button className="gap-2">
                  Abrir
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
