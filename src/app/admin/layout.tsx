import { AdminAppShell } from '@/components/layout/AdminAppShell';

export const metadata = {
  title: 'SaaS Master Console | Velvet Code',
  description: 'Velvet Code multi-tenant real estate CRM SaaS administrative headquarters and platform control center.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAppShell>{children}</AdminAppShell>;
}
