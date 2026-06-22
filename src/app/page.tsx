import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/server-auth';

export default async function DashboardRedirect() {
  const session = await getCurrentSession();
  redirect(session ? '/dashboard' : '/login');
}
