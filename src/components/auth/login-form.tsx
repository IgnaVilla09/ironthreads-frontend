'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error?.message || 'No se pudo iniciar sesión');
      }

      router.replace('/dashboard');
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main id="contenido-principal" className="grid min-h-dvh bg-[#f7f8f8] lg:grid-cols-[minmax(360px,1fr)_minmax(420px,1fr)]">
      <div className="flex flex-col justify-between bg-black px-7 py-9 text-white sm:px-12 lg:px-16 lg:py-14">
        <Image src="/assets/logo.png" alt="Ironthreads" width={554} height={139} className="h-auto w-48" priority />
        <div className="hidden max-w-lg lg:block">
          <div className="mb-8 h-1 w-16 bg-primary" />
          <p className="text-5xl font-extrabold leading-[1.05] tracking-[-0.06em] xl:text-6xl">Cada prenda.<br />Cada movimiento.<br />En orden.</p>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-white/60">El centro de operaciones de tu inventario.</p>
        </div>
        <p className="hidden text-xs text-white/45 lg:block">Ironthreads / Gestión de stock</p>
      </div>
      <div className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 h-1 w-12 bg-primary" />
          <h1 className="text-4xl font-extrabold tracking-[-0.05em] text-black">Iniciar sesión</h1>
          <p className="mt-3 text-sm text-gray-600">Ingresá con tu usuario y contraseña para continuar.</p>
          <form className="mt-9 space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" name="username" required spellCheck={false} value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" aria-describedby={error ? 'login-error' : undefined} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" aria-describedby={error ? 'login-error' : undefined} />
            </div>

            {error ? <p id="login-error" role="alert" className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {isLoading ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
