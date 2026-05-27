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
import { formatDate } from '@/lib/formatters';
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

export function ProductTable({ products, pagination }: ProductTableProps) {
  const { deleteProduct, isSubmitting } = useProductStore();
  const addToast = useToastStore((s) => s.addToast);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      addToast('Producto eliminado correctamente', 'success');
      setDeleteTarget(null);
    } catch {
      addToast('Error al eliminar el producto', 'error');
    }
  };

  return (
    <div>
      <div className="rounded-xl border bg-white">
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
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.description && (
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {product.description}
                          </p>
                        )}
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
                  <TableCell className="font-medium">{totalStock}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(product.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/productos/${product.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/productos/${product.id}/editar`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/transferencias?variantId=${product.variants[0]?.id ?? ''}&productId=${product.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Transferir stock">
                          <ArrowLeftRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={() => setDeleteTarget(product)}
                      >
                        <Trash2 className="h-4 w-4" />
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
