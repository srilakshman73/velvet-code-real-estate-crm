import React from 'react';
import Link from 'next/link';
import { VelvetCodeLogo } from '@/components/brand/VelvetCodeLogo';
import { buildWhatsAppUrl } from '@/lib/utils';
import {
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';

export function PublicFooter() {
  const whatsappUrl = buildWhatsAppUrl(
    '916383395915',
    'Hello, I would like to know more about your Real Estate CRM.'
  );

  return (
    <footer className="w-full bg-[#1F1D19] border-t border-[#2D2A24] text-[#D4C9B9]/80">
      {/* Official WhatsApp Banner */}
      <div className="border-b border-[#2D2A24] bg-[#29251F] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="p-3.5 rounded-2xl bg-[#3D7258]/20 border border-[#3D7258]/40 text-[#547A61] shadow-lg">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#FFFDF8] tracking-tight">
                Need an Instant Demo or Consultation?
              </h4>
              <p className="text-sm text-[#D4C9B9]/70 mt-0.5">
                Connect directly with our enterprise real estate technology specialists on WhatsApp.
              </p>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-[#3D7258] hover:bg-[#2E5943] text-[#FFFDF8] font-bold text-sm shadow-xl transition-all"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
            <span>Chat on WhatsApp: +91 63833 95915</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <VelvetCodeLogo size="lg" theme="dark" />
            <p className="text-sm text-[#D4C9B9]/70 leading-relaxed max-w-sm">
              The premier Aurum-inspired Real Estate CRM SaaS platform engineered for agencies, brokers, developers, and consultants.
            </p>
            <div className="pt-2 space-y-2 text-xs text-[#D4C9B9]/80">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#A374]" />
                <span>+91 63833 95915</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#A374]" />
                <span>solutions@velvetcode.tech</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#A374]" />
                <span>Chennai • Bangalore • Mumbai, India</span>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-[#E8E1D5] mb-4">
              Platform
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/features" className="hover:text-[#A374] transition-colors">
                  Features Catalog
                </Link>
              </li>
              <li>
                <Link href="/solutions" className="hover:text-[#A374] transition-colors">
                  Solutions by Business
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#A374] transition-colors">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link href="/app/leads" className="hover:text-[#A374] transition-colors">
                  Lead Management CRM
                </Link>
              </li>
              <li>
                <Link href="/app/whatsapp" className="hover:text-[#A374] transition-colors">
                  WhatsApp Engine
                </Link>
              </li>
              <li>
                <Link href="/app/ai" className="hover:text-[#A374] transition-colors">
                  Realty AI Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-[#E8E1D5] mb-4">
              Solutions
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/solutions#agents" className="hover:text-[#A374] transition-colors">
                  For Independent Agents
                </Link>
              </li>
              <li>
                <Link href="/solutions#brokers" className="hover:text-[#A374] transition-colors">
                  For Real Estate Brokers
                </Link>
              </li>
              <li>
                <Link href="/solutions#agencies" className="hover:text-[#A374] transition-colors">
                  For Real Estate Agencies
                </Link>
              </li>
              <li>
                <Link href="/solutions#builders" className="hover:text-[#A374] transition-colors">
                  For Builders & Developers
                </Link>
              </li>
              <li>
                <Link href="/solutions#consultants" className="hover:text-[#A374] transition-colors">
                  For Property Consultants
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-[#E8E1D5] mb-4">
              Company
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-[#A374] transition-colors">
                  About Velvet Code
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#A374] transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#A374] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#A374] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#A374] transition-colors text-xs text-[#A374]">
                  Velvet Code Admin ↗
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[#24221E] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#D4C9B9]/60">
          <p>© {new Date().getFullYear()} Velvet Code. All rights reserved. Technology & Digital Solutions</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-[#3B825E] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              100% Multi-Tenant Data Isolation
            </span>
            <span>Enterprise SLA 99.9%</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
