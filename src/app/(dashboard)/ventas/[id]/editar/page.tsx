import { SaleEditor } from '@/components/ventas/sale-editor';

export default async function EditSalePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SaleEditor saleId={id} />;
}
