import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

export const metadata = {
  title: 'Terms of Service — Velvet Code Real Estate CRM SaaS',
  description: 'Velvet Code Real Estate CRM SaaS commercial terms of service.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0D11] text-zinc-100">
      <PublicHeader />
      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-sm text-zinc-300 leading-relaxed">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs text-zinc-400 mt-2">Effective Date: September 14, 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. SaaS Subscription Agreement</h2>
            <p>
              By accessing Velvet Code, you agree to these commercial SaaS terms. Subscriptions are billed on a monthly or annual recurring cycle according to your chosen plan tier (Starter, Professional, or Business).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Subscription Quotas & Fair Use</h2>
            <p>
              Subscription quotas for user seats, lead records, property listings, and Realty AI inferences are enforced server-side. Workspace admins may upgrade or adjust tiers at any time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Official Branding Protection</h2>
            <p>
              The Velvet Code trademark, gold visual identity, and proprietary CRM workflows remain the exclusive intellectual property of Velvet Code.
            </p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
