"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { StockBadge } from "@/components/shared/stock-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProductStore } from "@/stores/product-store";
import { useInventoryStore } from "@/stores/inventory-store";
import { InventoryItem } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Package, Layers, MapPin, ArrowLeftRight } from "lucide-react";

function ProductImage({ src, name }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  const hasImage = Boolean(src) && !failed;

  return (
    <figure className="w-full max-w-[240px] justify-self-end sm:col-start-2">
      <div className="relative aspect-square overflow-hidden rounded-xl border bg-[#f1f5f5]">
        <Image
          src={hasImage ? src! : "/assets/product-placeholder.svg"}
          alt={hasImage ? name : "Imagen del producto no disponible"}
          fill
          sizes="240px"
          className="object-contain"
          unoptimized
          onError={() => setFailed(true)}
        />
      </div>
      {!hasImage && (
        <figcaption className="mt-2 text-xs text-gray-500">
          Imagen no disponible
        </figcaption>
      )}
    </figure>
  );
}

export default function ProductoPage() {
  const params = useParams();
  const id = params.id as string;
  const {
    selectedProduct,
    isLoading,
    isError,
    fetchProduct,
    resetSelectedProduct,
  } = useProductStore();
  const { fetchInventoryByVariant } = useInventoryStore();
  const [inventoryMap, setInventoryMap] = useState<
    Map<string, InventoryItem[]>
  >(new Map());
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);

  useEffect(() => {
    fetchProduct(id);
    return () => resetSelectedProduct();
  }, [id]);

  useEffect(() => {
    if (!selectedProduct) return;
    const loadInventory = async () => {
      setIsInventoryLoading(true);
      const results = await Promise.all(
        selectedProduct.variants.map((v) => fetchInventoryByVariant(v.id)),
      );
      const map = new Map<string, InventoryItem[]>();
      selectedProduct.variants.forEach((v, i) => map.set(v.id, results[i]));
      setInventoryMap(map);
      setIsInventoryLoading(false);
    };
    loadInventory();
  }, [selectedProduct]);

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

  const totalStock = selectedProduct.variants.reduce(
    (sum, v) => sum + v.stock,
    0,
  );

  return (
    <PageContainer>
      <PageHeader
        title={selectedProduct.name}
        description={`${selectedProduct.category.label} — ${selectedProduct.variants.length} variante${selectedProduct.variants.length !== 1 ? "s" : ""}`}
      >
        <div className="flex gap-2">
          <Link href={`/productos/${selectedProduct.id}/editar`}>
            <Button variant="outline" className="gap-2">
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Link href={`/transferencias?productId=${selectedProduct.id}`}>
            <Button variant="outline" className="gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              Transferir
            </Button>
          </Link>
        </div>
      </PageHeader>

      <div className="w-full min-w-0">
        {selectedProduct.variants.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Este producto no tiene variantes.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2 rounded-xl border bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <Layers className="h-4 w-4" />
              <span className="font-medium">Stock total del producto:</span>
              <span className="font-bold">{totalStock} unidades</span>
            </div>

            <div className="overflow-x-auto rounded-xl border bg-white overscroll-x-contain touch-pan-x lg:overflow-visible">
              <table className="w-full min-w-[780px] lg:table-fixed lg:min-w-0">
                <thead>
                  <tr className="border-b text-left">
                    <th className="w-[18%] px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider xl:px-6">
                      SKU
                    </th>
                    <th className="w-[12%] px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider xl:px-6">
                      Color
                    </th>
                    <th className="w-[8%] px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider xl:px-6">
                      Talle
                    </th>
                    <th className="w-[12%] px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right xl:px-6">
                      Stock Total
                    </th>
                    <th className="w-[34%] px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider xl:px-6">
                      Stock por Ubicación
                    </th>
                    <th className="w-[16%] px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider xl:px-6">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedProduct.variants.map((v) => {
                    const invItems = inventoryMap.get(v.id) ?? [];
                    return (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 xl:px-6">
                          <Badge
                            variant="secondary"
                            className="max-w-full break-all font-mono"
                          >
                            {v.sku}
                          </Badge>
                        </td>
                        <td className="break-words px-3 py-3 text-sm xl:px-6">
                          {v.color.label}
                        </td>
                        <td className="break-words px-3 py-3 text-sm xl:px-6">
                          {v.size.label}
                        </td>
                        <td className="px-3 py-3 text-right xl:px-6">
                          <span
                            className={`text-lg font-bold ${
                              v.stock === 0
                                ? "text-red-600"
                                : v.stock < 3
                                  ? "text-amber-600"
                                  : "text-green-600"
                            }`}
                          >
                            {v.stock}
                          </span>
                        </td>
                        <td className="px-3 py-3 xl:px-6">
                          {isInventoryLoading ? (
                            <div className="flex flex-wrap gap-1.5">
                              <Skeleton className="h-6 w-28 rounded-full" />
                              <Skeleton className="h-6 w-24 rounded-full" />
                            </div>
                          ) : invItems.length === 0 ? (
                            <span className="text-xs text-gray-400">
                              Sin stock asignado
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {invItems.map((inv) => (
                                <Badge
                                  key={inv.id}
                                  variant="outline"
                                  className="max-w-full flex-wrap gap-1 break-words text-xs"
                                >
                                  <MapPin className="h-3 w-3" />
                                  {inv.pointOfSale.label}
                                  {inv.deposito && (
                                    <span className="text-gray-400">
                                      /{inv.deposito.label}
                                    </span>
                                  )}
                                  <span
                                    className={`font-bold ${
                                      inv.stock === 0
                                        ? "text-red-600"
                                        : inv.stock < 3
                                          ? "text-amber-600"
                                          : "text-green-600"
                                    }`}
                                  >
                                    {inv.stock}
                                  </span>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 xl:px-6">
                          <StockBadge stock={v.stock} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_240px] sm:items-start">
              {selectedProduct.description && (
                <p className="min-w-0 max-w-xl justify-self-end text-right text-sm leading-relaxed text-gray-600">
                  Descripción/Detalles: {selectedProduct.description}
                </p>
              )}
              <ProductImage
                key={`${selectedProduct.id}:${selectedProduct.imageUrl ?? ""}`}
                src={selectedProduct.imageUrl}
                name={selectedProduct.name}
              />
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
