'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { PricingSection, FAQSection, FinalCTASection } from '@/components/marketing/LandingSections';
import { SAAS_PLANS } from '@/lib/mock-data';
import { Button } from '@/components/ui/Button';
import { Check, X as XIcon, HelpCircle } from 'lucide-react';

export default function PricingPage() {
  const comparisonFeatures = [
    { name: 'User Seats Included', starter: '1 User', pro: '5 Users', biz: '15 Users (Expandable)' },
    { name: 'Lead Capacity', starter: '100 Active Leads', pro: '1,000 Active Leads', biz: 'Unlimited Leads' },
    { name: 'Property Listings', starter: '25 Properties', pro: 'Unlimited Properties', biz: 'Unlimited Properties' },
    { name: 'Realty AI Queries', starter: '100 / month', pro: '1,000 / month', biz: '5,000 / month' },
    { name: 'Interactive Kanban Deals Pipeline', starter: true, pro: true, biz: true },
    { name: 'Site Visit GPS Tracking & Feedback', starter: false, pro: true, biz: true },
    { name: 'WhatsApp Cloud CRM & Live Inbox', starter: false, pro: true, biz: true },
    { name: 'Visual WhatsApp Automation Workflows', starter: false, pro: true, biz: true },
    { name: 'Lead Import / Export (CSV & Excel)', starter: true, pro: true, biz: true },
    { name: 'KYC & Document Vault', starter: '1 GB', pro: '10 GB', biz: '100 GB' },
    { name: 'Advanced Conversion & Revenue Analytics', starter: false, pro: true, biz: true },
    { name: 'Role-Based Access Control (RBAC)', starter: false, pro: true, biz: true },
    { name: 'Dedicated Account Manager & SLA Support', starter: false, pro: false, biz: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0D11] text-zinc-100">
      <PublicHeader />
      <main className="flex-1">
        {/* Header */}
        <section className="py-20 text-center max-w-4xl mx-auto px-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Simple & Predictable Pricing
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mt-4 tracking-tight">
            Choose the Perfect Plan for Your Real Estate Business
          </h1>
          <p className="text-lg text-zinc-400 mt-4 leading-relaxed max-w-2xl mx-auto">
            Scale your listings, leads, and agent team without hidden fees. Upgrade or cancel anytime.
          </p>
        </section>

        {/* Pricing Cards */}
        <PricingSection />

        {/* Detailed Feature Matrix Table */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-zinc-800">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Compare Plan Features
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Detailed technical breakdown of all Velvet Code SaaS subscriptions.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-2xl">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80">
                  <th className="p-4 sm:p-5 font-bold text-white">Feature</th>
                  <th className="p-4 sm:p-5 font-bold text-zinc-300 text-center w-1/4">
                    Starter (₹499/mo)
                  </th>
                  <th className="p-4 sm:p-5 font-bold text-amber-400 text-center w-1/4 bg-amber-500/5">
                    Professional (₹1,499/mo)
                  </th>
                  <th className="p-4 sm:p-5 font-bold text-white text-center w-1/4">
                    Business (₹3,999/mo)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {comparisonFeatures.map((row, i) => (
                  <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="p-4 sm:p-5 font-medium text-zinc-200">{row.name}</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-300">
                      {typeof row.starter === 'boolean' ? (
                        row.starter ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <XIcon className="w-4 h-4 text-zinc-600 mx-auto" />
                        )
                      ) : (
                        row.starter
                      )}
                    </td>
                    <td className="p-4 sm:p-5 text-center font-semibold text-amber-300 bg-amber-500/5">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? (
                          <Check className="w-4 h-4 text-amber-400 mx-auto" />
                        ) : (
                          <XIcon className="w-4 h-4 text-zinc-600 mx-auto" />
                        )
                      ) : (
                        row.pro
                      )}
                    </td>
                    <td className="p-4 sm:p-5 text-center font-semibold text-white">
                      {typeof row.biz === 'boolean' ? (
                        row.biz ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <XIcon className="w-4 h-4 text-zinc-600 mx-auto" />
                        )
                      ) : (
                        row.biz
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <FAQSection />
        <FinalCTASection />
      </main>
      <PublicFooter />
    </div>
  );
}
