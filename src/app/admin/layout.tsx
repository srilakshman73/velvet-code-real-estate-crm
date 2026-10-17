import { AdminAppShell } from '@/components/layout/AdminAppShell';
import { getServerSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'SaaS Master Console | Velvet Code',
  description: 'Velvet Code multi-tenant real estate CRM SaaS administrative headquarters and platform control center.',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  // Strict Server-Side Owner Guard
  // Only the verified Master Platform Owner can enter /admin routes
  if (!session || !session.isOwner) {
    redirect('/login?error=admin_unauthorized');
  }

  return <AdminAppShell>{children}</AdminAppShell>;
}
