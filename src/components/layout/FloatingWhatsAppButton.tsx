'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { buildWhatsAppUrl, PRIMARY_WHATSAPP_NUMBER } from '@/lib/utils';

export function FloatingWhatsAppButton() {
  const pathname = usePathname();

  // Show floating WhatsApp button on public marketing pages
  const isAppOrAdmin = pathname?.startsWith('/app') || pathname?.startsWith('/admin');
  if (isAppOrAdmin) return null;

  const whatsappUrl = buildWhatsAppUrl(
    '916383395915',
    'Hello, I would like to know more about your Real Estate CRM.'
  );

  return (
    <aside
      aria-label="WhatsApp Contact Widget"
      className="fixed bottom-6 right-6 z-40 flex items-center group"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat on WhatsApp with Velvet Code at ${PRIMARY_WHATSAPP_NUMBER}`}
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#547A61] hover:bg-[#3D7258] text-white font-bold text-xs sm:text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-[#547A61]/40 focus:outline-none focus:ring-2 focus:ring-[#A37432] focus:ring-offset-2"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 fill-current" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#4ADE80] rounded-full border-2 border-[#547A61] animate-pulse" />
        </div>
        <span className="hidden sm:inline font-semibold tracking-wide">
          WhatsApp {PRIMARY_WHATSAPP_NUMBER}
        </span>
        <span className="sm:hidden font-semibold tracking-wide">WhatsApp</span>
      </a>
    </aside>
  );
}
