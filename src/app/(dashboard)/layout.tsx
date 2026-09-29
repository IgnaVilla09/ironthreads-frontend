import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { getCurrentSession } from '@/lib/server-auth';
import { FloatingChatButton } from '@/components/ui/floating-chat-button';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-[#f7f8f8]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header user={session.user} />
        <main id="contenido-principal" className="flex-1 overflow-y-auto overscroll-contain scroll-p-6">{children}</main>
        <FloatingChatButton />
      </div>
    </div>
  );
}
