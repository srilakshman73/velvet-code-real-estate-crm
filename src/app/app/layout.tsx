import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-server';
import { verifyCustomerAccess } from '@/lib/subscription-gate';
import { CRMAppShell } from '@/components/layout/CRMAppShell';

export const metadata = {
  title: 'Workspace CRM — Velvet Code',
  description: 'Manage real estate leads, properties, pipeline, site visits, and WhatsApp CRM.',
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect('/login?from=/app');
  }

  const access = await verifyCustomerAccess(session);

  return (
    <CRMAppShell serverAccess={access} serverSession={session}>
      {children}
    </CRMAppShell>
  );
}
