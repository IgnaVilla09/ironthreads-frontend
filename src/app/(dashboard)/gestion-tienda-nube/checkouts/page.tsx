"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { tiendaNubeApiClient } from "@/lib/tiendanube-api-client";
import { useToastStore } from "@/stores/toast-store";
import { AbandonedCheckout } from "@/types/tiendanube";

type ProductPreview = {
  id: string;
  name: string;
  quantity: string;
  price: string;
  variant: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatMoney(total: string | null, currency: string | null) {
  if (!total) return "-";

  const numericTotal = Number(total);
  if (Number.isNaN(numericTotal)) return total;

  if (!currency) return numericTotal.toFixed(2);

  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(numericTotal);
  } catch {
    return `${numericTotal.toFixed(2)} ${currency}`;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickArray(source: unknown): unknown[] {
  if (Array.isArray(source)) return source;

  const record = asRecord(source);
  if (!record) return [];

  const candidates = [
    record.products,
    record.items,
    record.line_items,
    record.lines,
  ];
  const firstArray = candidates.find(Array.isArray);
  return Array.isArray(firstArray) ? firstArray : [];
}

function getProductPreview(
  productsJson: unknown,
  currency: string | null,
): ProductPreview[] {
  return pickArray(productsJson).map((item, index) => {
    const record = asRecord(item) ?? {};
    const variantParts = [
      record.variant_name,
      record.variant,
      record.size,
      record.color,
    ].filter(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    );

    return {
      id: String(record.id ?? record.product_id ?? index),
      name: String(
        record.name ??
          record.title ??
          record.product_name ??
          `Articulo ${index + 1}`,
      ),
      quantity: String(record.quantity ?? record.qty ?? 1),
      price: formatMoney(
        String(record.price ?? record.unit_price ?? record.subtotal ?? "") ||
          null,
        currency,
      ),
      variant: variantParts.length > 0 ? variantParts.join(" / ") : null,
    };
  });
}

export default function GestionTiendaNubeCheckoutsPage() {
  const addToast = useToastStore((state) => state.addToast);
  const [checkouts, setCheckouts] = useState<AbandonedCheckout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCheckout, setSelectedCheckout] =
    useState<AbandonedCheckout | null>(null);

  const pendingCount = useMemo(
    () =>
      checkouts.filter((checkout) => checkout.status !== "recovered").length,
    [checkouts],
  );

  const selectedProducts = useMemo(
    () =>
      selectedCheckout
        ? getProductPreview(
            selectedCheckout.productsJson,
            selectedCheckout.currency,
          )
        : [],
    [selectedCheckout],
  );

  const loadCheckouts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await tiendaNubeApiClient.getCheckouts();
      setCheckouts(data);
      addToast("Carritos cargados correctamente", "success");
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "No se pudieron cargar los carritos.";
      setError(message);
      addToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCheckouts();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Carritos abandonados"
        description="Listado principal de recovery consumiendo `GET /admin/checkouts`."
      >
        <div className="flex items-center gap-2">
          <Link href="/gestion-tienda-nube">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => void loadCheckouts()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refrescar
          </Button>
        </div>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total de carritos</p>
              <p className="mt-2 text-3xl font-semibold">{checkouts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Pendientes o no recuperados
              </p>
              <p className="mt-2 text-3xl font-semibold">{pendingCount}</p>
            </CardContent>
          </Card>
      </div>

      {isLoading ? <LoadingState count={6} /> : null}

      {!isLoading && error ? (
        <ErrorState message={error} onRetry={() => void loadCheckouts()} />
      ) : null}

      {!isLoading && !error && checkouts.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              title="Todavia no hay datos cargados"
              description="Presiona refrescar para consultar los carritos abandonados disponibles para tu usuario."
            />
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !error && checkouts.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creado</TableHead>
                  <TableHead>Carrito</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Fecha/Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkouts.map((checkout) => (
                  <TableRow
                    key={checkout.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedCheckout(checkout)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedCheckout(checkout);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <TableCell>{formatDate(checkout.createdAt)}</TableCell>
                    <TableCell className="font-medium">
                      {checkout.tiendanubeCheckoutId}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{checkout.contactEmail || "-"}</span>
                        <span className="text-xs text-muted-foreground">
                          {checkout.contactName || "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{checkout.contactPhone || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          checkout.status === "recovered"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {checkout.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatMoney(checkout.total, checkout.currency)}
                    </TableCell>
                    <TableCell>
                      {formatDate(checkout.firstMessageDueAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <Dialog
        open={selectedCheckout !== null}
        onOpenChange={(open) => !open && setSelectedCheckout(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Carrito {selectedCheckout?.tiendanubeCheckoutId}
            </DialogTitle>
            <DialogDescription>
              Acciones disponibles y detalle del carrito abandonado
              seleccionado.
            </DialogDescription>
          </DialogHeader>

          {selectedCheckout ? (
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Contacto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Email:</span>{" "}
                      {selectedCheckout.contactEmail || "-"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Nombre:</span>{" "}
                      {selectedCheckout.contactName || "-"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Telefono:</span>{" "}
                      {selectedCheckout.contactPhone || "-"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Resumen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Estado:</span>{" "}
                      {selectedCheckout.status}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Total:</span>{" "}
                      {formatMoney(
                        selectedCheckout.total,
                        selectedCheckout.currency,
                      )}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Fecha/Hora:</span>{" "}
                      {formatDate(selectedCheckout.firstMessageDueAt)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Acciones</CardTitle>
                    <CardDescription>
                      Preparadas para conectar luego.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <Button variant="outline" disabled>
                      Email
                    </Button>
                    <Button variant="outline" disabled>
                      WhatsApp
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Articulos del carrito
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedProducts.length > 0 ? (
                    <div className="space-y-3">
                      {selectedProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-start justify-between gap-4 rounded-lg border p-3 text-sm"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              {product.name}
                            </p>
                            {product.variant ? (
                              <p className="text-muted-foreground">
                                {product.variant}
                              </p>
                            ) : null}
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-foreground">
                              {product.price}
                            </p>
                            <p className="text-muted-foreground">
                              Cantidad: {product.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Sin información de productos disponible para este carrito.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
