'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Pencil, Trash2, Eye, Package, ArrowLeftRight } from 'lucide-react';
import { useProductStore } from '@/stores/product-store';
import { useToastStore } from '@/stores/toast-store';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { PaginationMeta } from '@/types/api';

interface ProductTableProps {
  products: Product[];
  pagination: PaginationMeta | null;
  onPageChange?: (page: number) => void;
}

export function ProductTable({ products }: ProductTableProps) {
  const { deleteProduct, isSubmitting } = useProductStore();
  const addToast = useToastStore((s) => s.addToast);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      addToast('Producto eliminado correctamente', 'success');
      setDeleteTarget(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar el producto';
      addToast(message, 'error');
    }
  };

  return (
    <div>
      <div className="overflow-hidden rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Variantes</TableHead>
              <TableHead>Stock Total</TableHead>
              <TableHead>Actualizado</TableHead>
              <TableHead className="w-40">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const totalStock = product.variants.reduce(
                (sum, v) => sum + v.stock,
                0
              );
              return (
                <TableRow key={product.id}>
                  <TableCell>
                     <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                       <div className="min-w-0">
                         <p className="max-w-[260px] truncate font-semibold" title={product.name}>{product.name}</p>
                        {product.description && (
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {product.description}
                          </p>
                        )}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span>
                            {product.price != null ? formatCurrency(product.price) : 'Sin precio catálogo'}
                          </span>
                          <span>{product.imageUrl ? 'Con imagen' : 'Sin imagen'}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {product.category.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.variants.length}</Badge>
                  </TableCell>
                   <TableCell className="font-semibold tabular-nums">{new Intl.NumberFormat('es-AR').format(totalStock)}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(product.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                       <Link href={`/productos/${product.id}`} aria-label={`Ver ${product.name}`} className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent focus-visible:outline-offset-2">
                         <Eye className="h-4 w-4" aria-hidden="true" />
                       </Link>
                       <Link href={`/productos/${product.id}/editar`} aria-label={`Editar ${product.name}`} className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent focus-visible:outline-offset-2">
                         <Pencil className="h-4 w-4" aria-hidden="true" />
                       </Link>
                       <Link href={`/transferencias?variantId=${product.variants[0]?.id ?? ''}&productId=${product.id}`} aria-label={`Transferir stock de ${product.name}`} className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent focus-visible:outline-offset-2">
                         <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
                       </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                         aria-label={`Eliminar ${product.name}`}
                         className="h-9 w-9 text-red-600 hover:text-red-700"
                        onClick={() => setDeleteTarget(product)}
                      >
                         <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {products.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">
            No se encontraron productos
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Eliminar producto"
          description={`¿Estás seguro de eliminar ${deleteTarget.name}? También se eliminarán todas sus variantes (${deleteTarget.variants.length}). Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          variant="destructive"
          onConfirm={handleDelete}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}
