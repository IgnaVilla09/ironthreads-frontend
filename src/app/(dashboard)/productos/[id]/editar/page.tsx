'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { ProductForm } from '@/components/products/product-form';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { useProductStore } from '@/stores/product-store';

export default function EditarProductoPage() {
  const params = useParams();
  const id = params.id as string;
  const { selectedProduct, isLoading, isError, fetchProduct, resetSelectedProduct } = useProductStore();

  useEffect(() => {
    fetchProduct(id);
    return () => resetSelectedProduct();
  }, [id]);

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Cargando..." />
        <div className="max-w-2xl">
          <LoadingState count={5} type="form" />
        </div>
      </PageContainer>
    );
  }

  if (isError || !selectedProduct) {
    return (
      <PageContainer>
        <ErrorState message="No se pudo cargar el producto." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={`Editar: ${selectedProduct.name}`}
        description={`${selectedProduct.variants.length} variante${selectedProduct.variants.length !== 1 ? 's' : ''}`}
      />
      <div className="max-w-2xl">
        <ProductForm initialData={selectedProduct} />
      </div>
    </PageContainer>
  );
}
