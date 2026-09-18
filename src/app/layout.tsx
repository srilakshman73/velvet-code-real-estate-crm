import type { Metadata } from 'next';
import { Playfair_Display, Manrope } from 'next/font/google';
import './globals.css';
import { CRMStoreProvider } from '@/lib/store';
import { FloatingWhatsAppButton } from '@/components/layout/FloatingWhatsAppButton';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Velvet Code — Real Estate CRM & Property Operations',
  applicationName: 'Velvet Code Real Estate CRM',
  description:
    'A premium Aurum-inspired platform for managing real estate leads, luxury properties, clients, deals pipeline, site visits, and WhatsApp CRM with Realty AI.',
  keywords: [
    'Real Estate CRM',
    'Luxury PropTech SaaS',
    'Velvet Code',
    'WhatsApp Real Estate CRM',
    'Realty AI',
    'Property Management Software India',
    'Real Estate Pipeline Management',
    'Aurum Real Estate CRM',
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
      'A premium platform for managing leads, properties, clients, deals and real-estate operations.',
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
    <html lang="en" className={`${playfair.variable} ${manrope.variable} h-full bg-[#F7F3EA] text-[#24211D]`}>
      <body className="min-h-full flex flex-col font-sans antialiased bg-[#F7F3EA] text-[#24211D] selection:bg-[#A374]/30 selection:text-[#24211D]">
        <CRMStoreProvider>
          {children}
          <FloatingWhatsAppButton />
        </CRMStoreProvider>
      </body>
    </html>
  );
}

