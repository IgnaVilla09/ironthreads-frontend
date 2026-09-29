"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProductStore } from "@/stores/product-store";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect, useState } from "react";

export function ProductSearch() {
  const { searchQuery, setSearchQuery } = useProductStore();
  const [query, setQuery] = useState(searchQuery);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (debouncedQuery === query && debouncedQuery !== searchQuery) {
      setSearchQuery(debouncedQuery);
    }
  }, [debouncedQuery, query, searchQuery, setSearchQuery]);

  const handleClear = () => {
    setSearchQuery("");
    setQuery("");
  };

  return (
    <div className="relative w-full sm:w-auto">
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
      />
      <Input
        type="text"
        inputMode="search"
        name="buscar-productos"
        aria-label="Buscar productos por nombre o SKU"
        autoComplete="off"
        placeholder="Buscar por nombre o SKU…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-9 pr-9 sm:w-72"
      />
      {query && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Limpiar búsqueda"
          onClick={handleClear}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
