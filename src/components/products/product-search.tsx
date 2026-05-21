'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProductStore } from '@/stores/product-store';
import { useDebounce } from '@/hooks/use-debounce';
import { useEffect } from 'react';

export function ProductSearch() {
  const { searchQuery, setSearchQuery, fetchProducts } = useProductStore();
  const debouncedQuery = useDebounce(searchQuery, 400);

  useEffect(() => {
    if (debouncedQuery !== undefined) {
      fetchProducts();
    }
  }, [debouncedQuery]);

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        placeholder="Buscar por nombre o SKU..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9 pr-9 w-full sm:w-72"
      />
      {searchQuery && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
