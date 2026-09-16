'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { VelvetCodeLogo } from '@/components/brand/VelvetCodeLogo';
import { Button } from '@/components/ui/Button';
import { buildWhatsAppUrl } from '@/lib/utils';
import { Menu, X, MessageSquare, ArrowRight } from 'lucide-react';

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: 'Features', href: '/features' },
    { label: 'Solutions', href: '/solutions' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#DDD4C4] bg-[#F7F3EA]/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <VelvetCodeLogo href="/" size="md" theme="light" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold tracking-wide transition-colors ${
                  isActive
                    ? 'text-[#8F642B] border-b-2 border-[#A374] pb-0.5'
                    : 'text-[#24211D] hover:text-[#8F642B]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3.5">
          <a
            href={buildWhatsAppUrl('919443647190', 'Hello Velvet Code, I want to inquire about your Real Estate CRM SaaS.')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-[#2E6B4F] bg-[#2E6B4F]/10 hover:bg-[#2E6B4F]/15 border border-[#2E6B4F]/30 rounded-lg transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            +91 94436 47190
          </a>

          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>

          <Link href="/register">
            <Button variant="gold" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-2">
          <Link href="/register">
            <Button variant="gold" size="xs">
              Get Started
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#24211D] hover:text-[#8F642B] rounded-lg hover:bg-[#EFE8DA]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#DDD4C4] bg-[#FFFCF6] p-5 space-y-4 animate-in slide-in-from-top-2 shadow-xl">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-[#24211D] hover:text-[#8F642B] py-1 border-b border-[#DDD4C4]/40"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-[#DDD4C4] space-y-3">
            <a
              href={buildWhatsAppUrl('919443647190', 'Hello Velvet Code, I want to inquire about your Real Estate CRM SaaS.')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-[#2E6B4F] bg-[#2E6B4F]/10 border border-[#2E6B4F]/30 rounded-xl"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp: +91 94436 47190
            </a>

            <div className="grid grid-cols-2 gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="gold" size="sm" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
