import type { Metadata } from 'next';
import './globals.css';
import { CRMStoreProvider } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Velvet Code — Real Estate CRM',
  applicationName: 'Velvet Code Real Estate CRM',
  description:
    'Run your real estate business from one intelligent workspace. Manage leads, properties, clients, site visits, deals, follow-ups, WhatsApp CRM and Realty AI from Velvet Code.',
  keywords: [
    'Real Estate CRM',
    'PropTech SaaS',
    'Velvet Code',
    'WhatsApp Real Estate CRM',
    'Realty AI',
    'Property Management Software India',
    'Real Estate Pipeline Management',
  ],
  authors: [{ name: 'Velvet Code' }],
  icons: {
    icon: '/brand/velvet-code-logo.jpeg',
    shortcut: '/brand/velvet-code-logo.jpeg',
    apple: '/brand/velvet-code-logo.jpeg',
  },
  openGraph: {
    title: 'Velvet Code — Real Estate CRM SaaS',
    description:
      'Run your real estate business from one intelligent workspace. Manage leads, properties, deals, site visits, and WhatsApp conversations with Realty AI.',
    siteName: 'Velvet Code',
    images: [
      {
        url: '/brand/velvet-code-logo.jpeg',
        width: 800,
        height: 800,
        alt: 'Velvet Code Real Estate CRM SaaS',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-[#0B0D11] text-zinc-100">
      <body className="min-h-full flex flex-col antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <CRMStoreProvider>{children}</CRMStoreProvider>
      </body>
    </html>
  );
}
