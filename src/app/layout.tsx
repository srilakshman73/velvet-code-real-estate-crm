import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CRMStoreProvider } from '@/lib/store';
import { FloatingWhatsAppButton } from '@/components/layout/FloatingWhatsAppButton';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
});

export const metadata: Metadata = {
  title: 'Velvet Code — Real Estate CRM & Property Operations',
  applicationName: 'Velvet Code Real Estate CRM',
  description:
    'A luxury Champagne Gold-inspired platform for managing real estate leads, properties, clients, deals pipeline, site visits, and WhatsApp CRM with Realty AI.',
  keywords: [
    'Real Estate CRM',
    'Luxury PropTech SaaS',
    'Velvet Code',
    'WhatsApp Real Estate CRM',
    'Realty AI',
    'Property Management Software India',
    'Real Estate Pipeline Management',
    'Gold Luxury Real Estate CRM',
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
      'A luxury platform for managing leads, properties, clients, deals and real-estate operations.',
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
    <html lang="en" className={`${inter.variable} h-full bg-[#E9DFC8] text-[#2C241A]`}>
      <body className="min-h-full flex flex-col font-sans antialiased bg-[#E9DFC8] text-[#2C241A] selection:bg-[#A37432]/20 selection:text-[#2C241A] relative">
        <CRMStoreProvider>
          <div className="relative z-10 flex flex-col min-h-full flex-1">
            {children}
          </div>
          <FloatingWhatsAppButton />
        </CRMStoreProvider>
      </body>
    </html>
  );
}
