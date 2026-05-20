'use client';

import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { ProductForm } from '@/components/products/product-form';

export default function NuevoProductoPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Nuevo Producto"
        description="Completa los campos para crear un nuevo producto"
      />
      <div className="max-w-2xl">
        <ProductForm />
      </div>
    </PageContainer>
  );
}
