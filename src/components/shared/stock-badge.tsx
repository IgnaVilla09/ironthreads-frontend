import { Badge } from '@/components/ui/badge';

interface StockBadgeProps {
  stock: number;
}

export function StockBadge({ stock }: StockBadgeProps) {
  if (stock === 0) {
    return <Badge variant="destructive">Sin stock</Badge>;
  }

  if (stock < 3) {
    return (
      <Badge
        variant="outline"
        className="border-amber-300 text-amber-700 bg-amber-50"
      >
        Stock bajo
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
      En stock
    </Badge>
  );
}
