import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { CoreModulesShowcase, FinalCTASection } from '@/components/marketing/LandingSections';
import { Sparkles, CheckCircle2, Zap, ShieldCheck, MessageSquare, Bot, Building2 } from 'lucide-react';

export const metadata = {
  title: 'Features & CRM Capabilities — Velvet Code',
  description:
    'Explore the complete feature suite of Velvet Code Real Estate CRM SaaS: Lead Management, Properties Inventory, Pipeline Kanban, WhatsApp CRM, and Realty AI.',
};

export default function FeaturesPage() {
  const deepDives = [
    {
      title: 'Omnichannel Lead Capture & Automated Scoring',
      desc: 'Never lose a buyer inquiry again. Seamlessly ingest leads across WhatsApp, Meta Ads, Google Ads, property portals, and phone calls. Realty AI automatically calculates a 0-100 conversion probability score based on budget, property match, and response speed.',
      bullets: [
        'Multi-channel real-time ingestion with webhook listeners',
        'Automatic round-robin agent assignment rules',
        'Lead scoring powered by Realty AI',
        'Custom tagging and budget range filters',
      ],
      icon: Zap,
    },
    {
      title: 'Interactive Sales Pipeline & Drag-and-Drop Kanban',
      desc: 'Visualize your entire real estate deal flow from New Lead to Closed Won. Calculate weighted pipeline value and forecast monthly commission revenue with precision.',
      bullets: [
        'Customizable deal stages aligned with Indian real estate workflows',
        'Probability-weighted revenue forecasting',
        'Deal milestone tracking and KYC document attachment',
        'Instant stage transitions with audit logging',
      ],
      icon: Building2,
    },
    {
      title: 'Site Visit GPS Tracking & Feedback Engine',
      desc: 'Eliminate no-shows and missed viewings. Schedule site visits, send location pins automatically over WhatsApp, log agent arrival, and capture client ratings on-site.',
      bullets: [
        'Automated 24-hour and 2-hour WhatsApp reminder triggers',
        'Agent check-in with GPS verification',
        'Post-visit customer feedback rating capture (1-5 Stars)',
        'Site visit conversion rate analytics',
      ],
      icon: CheckCircle2,
    },
    {
      title: 'Integrated WhatsApp Cloud CRM & Visual Automations',
      desc: 'Communicate with high-net-worth buyers on WhatsApp without leaving your CRM. Send brochures, answer inquiries, and deploy automated nurture campaigns.',
      bullets: [
        'Full 3-column WhatsApp inbox with customer CRM sidebar',
        'Pre-approved WhatsApp templates with dynamic variables',
        'Visual trigger-condition-action workflow builder',
        'Click-to-chat integration with +91 94436 47190',
      ],
      icon: MessageSquare,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0D11] text-zinc-100">
      <PublicHeader />
      <main className="flex-1">
        {/* Header */}
        <section className="py-20 text-center max-w-4xl mx-auto px-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Platform Capabilities
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mt-4 tracking-tight">
            The Complete Real Estate Tech Stack
          </h1>
          <p className="text-lg text-zinc-400 mt-4 leading-relaxed max-w-2xl mx-auto">
            Everything your agency needs to capture leads, showcase property inventory, manage site visits, and close multi-crore deals.
          </p>
        </section>

        {/* Feature Highlights */}
        <CoreModulesShowcase />

        {/* Deep Dives */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {deepDives.map((item, idx) => {
            const Icon = item.icon;
            const isEven = idx % 2 === 0;
            return (
              <div
                key={idx}
                className={`flex flex-col lg:flex-row gap-10 items-center ${
                  isEven ? '' : 'lg:flex-row-reverse'
                }`}
              >
                <div className="flex-1 space-y-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit border border-amber-500/30">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {item.title}
                  </h2>
                  <p className="text-sm text-zinc-300 leading-relaxed">{item.desc}</p>
                  <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-zinc-300">
                    {item.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex-1 w-full p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl">
                  <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/20 space-y-3">
                    <div className="flex items-center justify-between text-xs text-amber-400 font-semibold border-b border-zinc-800 pb-2">
                      <span>Feature Spotlight</span>
                      <span className="text-zinc-500">Live in Production</span>
                    </div>
                    <p className="text-xs text-zinc-300 italic">
                      "Velvet Code eliminated our manual spreadsheets and missed WhatsApp inquiries. Our pipeline visibility increased tenfold."
                    </p>
                  </div>
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
