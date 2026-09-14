import React from 'react';
import { CRMAppShell } from '@/components/layout/CRMAppShell';

export const metadata = {
  title: 'Workspace CRM — Velvet Code',
  description: 'Manage real estate leads, properties, pipeline, site visits, and WhatsApp CRM.',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <CRMAppShell>{children}</CRMAppShell>;
}
