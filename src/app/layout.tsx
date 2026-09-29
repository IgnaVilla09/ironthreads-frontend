import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastContainer } from '@/components/shared/toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ironthreads | Stock',
  description: 'Sistema de gestión de stock para indumentaria',
};

export const viewport: Viewport = {
  themeColor: '#f7f8f8',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <a href="#contenido-principal" className="sr-only fixed left-4 top-4 z-[110] rounded-md bg-black px-4 py-2 text-white focus:not-sr-only">Saltar al contenido</a>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
