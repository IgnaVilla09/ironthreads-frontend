import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { getCurrentSession } from '@/lib/server-auth';

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}
