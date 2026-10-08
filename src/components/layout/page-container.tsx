import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('mx-auto w-full max-w-[1600px] px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-8 sm:py-8 xl:px-12 xl:py-10', className)}>
      {children}
    </div>
  );
}
