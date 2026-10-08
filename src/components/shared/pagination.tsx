'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const router = useRouter();
  const inputId = useId();
  const [pageInput, setPageInput] = useState('');

  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let page = Math.max(1, currentPage - 1); page <= Math.min(totalPages, currentPage + 1); page++) {
    pages.push(page);
  }
  const lastVisiblePage = pages[pages.length - 1];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = pageInput.trim();
    const page = Number(value);
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(page) || page < 1 || page > totalPages) {
      router.push('/404');
      return;
    }
    onPageChange(page);
    setPageInput('');
  }

  return (
    <nav aria-label="Paginación" className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
        <Button
          type="button"
          aria-label="Página anterior"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((p) => (
          <Button
            type="button"
            aria-label={`Página ${p}`}
            aria-current={p === currentPage ? 'page' : undefined}
            key={p}
            variant={p === currentPage ? 'default' : 'outline'}
            size="sm"
            className="min-w-9"
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}

        {lastVisiblePage < totalPages - 1 && <span aria-hidden="true" className="px-1">…</span>}
        {lastVisiblePage < totalPages && (
          <Button type="button" variant="outline" size="sm" aria-label={`Última página, ${totalPages}`} onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </Button>
        )}

        <Button
          type="button"
          aria-label="Página siguiente"
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <form onSubmit={handleSubmit} noValidate className="flex items-center gap-2">
        <label htmlFor={inputId} className="text-sm text-gray-600">Ir a página</label>
        <Input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={pageInput}
          onChange={(event) => setPageInput(event.target.value)}
          placeholder={`1–${totalPages}`}
          className="h-9 w-20"
        />
        <Button type="submit" variant="outline" size="sm">Ir</Button>
      </form>
    </nav>
  );
}
