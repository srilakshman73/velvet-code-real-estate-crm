import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

export const metadata = {
  title: 'Privacy Policy — Velvet Code Real Estate CRM SaaS',
  description: 'Velvet Code multi-tenant data protection and privacy policy.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F0E7] text-[#29251F]">
      <PublicHeader />
      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-sm text-[#625B51] leading-relaxed">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#29251F] tracking-tight font-serif">
              Privacy Policy
            </h1>
            <p className="text-xs text-[#625B51] mt-2">Last updated: September 16, 2026</p>
          </div>

          <section className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#DDD4C5] aurum-card-shadow space-y-3">
            <h2 className="text-lg font-bold text-[#29251F]">1. Commitment to Data Confidentiality</h2>
            <p>
              Velvet Code operates a multi-tenant Real Estate CRM SaaS platform. We strictly isolate all organization data. Under no circumstances is customer, lead, or property inventory data shared across different subscriber organizations.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#DDD4C5] aurum-card-shadow space-y-3">
            <h2 className="text-lg font-bold text-[#29251F]">2. Multi-Tenant Organization Isolation</h2>
            <p>
              Every record created within the application is bounded by an <code className="text-[#7A5720] font-bold">organization_id</code>. Database-level authorization rules prevent cross-tenant queries and ensure that your client lists, deal sizes, and internal notes remain private to your team members only.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#DDD4C5] aurum-card-shadow space-y-3">
            <h2 className="text-lg font-bold text-[#29251F]">3. Realty AI & Model Data Policy</h2>
            <p>
              Realty AI processes CRM context solely in real-time to generate responses for authenticated users within your organization. Your proprietary CRM data is never used to train public foundational AI models.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#DDD4C5] aurum-card-shadow space-y-3">
            <h2 className="text-lg font-bold text-[#29251F]">4. WhatsApp Business API Communication</h2>
            <p>
              All WhatsApp messages sent through the platform adhere to the official WhatsApp Business policies. External WhatsApp messages are never dispatched silently without authorized user approval or explicit automated rules configured by the organization admin.
            </p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
