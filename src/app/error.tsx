'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-200">500</h1>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          Error del servidor
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Ocurrió un error inesperado. Por favor, intenta de nuevo.
        </p>
        <Button
          onClick={reset}
          className="mt-6"
        >
          Intentar de nuevo
        </Button>
      </div>
    </div>
  );
}
