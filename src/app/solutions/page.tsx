import React from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Button } from '@/components/ui/Button';
import { FinalCTASection } from '@/components/marketing/LandingSections';
import {
  User,
  Users2,
  Building2,
  HardHat,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const metadata = {
  title: 'Real Estate CRM Solutions by Business Type — Velvet Code',
  description:
    'Tailored CRM solutions for Real Estate Agents, Brokers, Agencies, Builders, Developers, and Property Consultants.',
};

export default function SolutionsPage() {
  const solutions = [
    {
      id: 'agents',
      title: 'For Independent Real Estate Agents',
      tag: 'Solo Agents & Consultants',
      icon: User,
      desc: 'Close more listings without drowning in administrative follow-ups. Manage client requirements, store inventory on your phone, and automate WhatsApp updates effortlessly.',
      benefits: [
        'Single-user Starter plan at just ₹499/month',
        'Mobile-first responsive CRM with WhatsApp click-to-chat',
        'Automated follow-up reminders so you never forget a client',
        'Realty AI assistant to draft personalized buyer messages',
      ],
    },
    {
      id: 'brokers',
      title: 'For Real Estate Brokers & Consultancies',
      tag: 'Boutique Brokerages',
      icon: Briefcase,
      desc: 'Accelerate deal velocity across luxury residential and commercial properties. Match buyer budgets to seller listings in seconds with automated inventory pairing.',
      benefits: [
        'Multi-stage deal pipeline tracking closing probability',
        'Integrated site visit scheduling and instant GPS check-ins',
        'KYC document vault with client agreement storage',
        'WhatsApp CRM inbox with pre-built broker templates',
      ],
    },
    {
      id: 'agencies',
      title: 'For Real Estate Agencies & Teams',
      tag: 'Expanding Sales Agencies',
      icon: Users2,
      desc: 'Empower your sales managers and agents with unified lead distribution, real-time agent leaderboards, and granular role-based permissions.',
      benefits: [
        'Multi-agent seat management (5 to 15+ agents)',
        'Round-robin lead assignment and SLA tracking',
        'Real-time team performance metrics & commission forecasting',
        'Multi-channel lead ingestion from Meta Ads, Portals, and WhatsApp',
      ],
    },
    {
      id: 'builders',
      title: 'For Builders & Property Developers',
      tag: 'High-Volume Developers',
      icon: HardHat,
      desc: 'Streamline project launches, unit bookings, buyer documentation, and sales lounge site visits across multi-tower residential and commercial developments.',
      benefits: [
        'Unlimited property inventory and tower unit master lists',
        'Visual WhatsApp automation for launch announcements and price updates',
        'Comprehensive marketing ROI and lead source conversion reports',
        'Enterprise SLA, multi-tenant isolation, and dedicated support',
      ],
    },
    {
      id: 'consultants',
      title: 'For Commercial & Wealth Property Consultants',
      tag: 'Advisory & Portfolio Managers',
      icon: Building2,
      desc: 'Manage high-net-worth individual (HNWI) client portfolios, rental yield analyses, and commercial asset transactions with institutional-grade security.',
      benefits: [
        'Detailed client investment requirement profiling',
        'Commercial lease vs capital purchase comparison tracking',
        'Secure document repository for title deeds and structural approvals',
        'Customizable analytics and exportable executive reports',
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0D11] text-zinc-100">
      <PublicHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 text-center max-w-4xl mx-auto px-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Tailored Industry Solutions
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mt-4 tracking-tight">
            Designed for Every Real Estate Business Model
          </h1>
          <p className="text-lg text-zinc-400 mt-4 leading-relaxed max-w-2xl mx-auto">
            Whether you are an independent property broker or a multi-city builder, Velvet Code provides the exact CRM tools required to scale your revenue.
          </p>
        </section>

        {/* Solutions Grid */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {solutions.map((sol) => {
            const Icon = sol.icon;
            return (
              <div
                key={sol.id}
                id={sol.id}
                className="p-8 sm:p-10 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-amber-500/40 transition-all shadow-xl space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        {sol.tag}
                      </span>
                      <h2 className="text-2xl font-bold text-white mt-0.5">{sol.title}</h2>
                    </div>
                  </div>
                  <Link href="/register">
                    <Button variant="gold" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Explore Solution
                    </Button>
                  </Link>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl">
                  {sol.desc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {sol.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <FinalCTASection />
      </main>
      <PublicFooter />
    </div>
  );
}
