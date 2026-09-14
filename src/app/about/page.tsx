import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { VelvetCodeLogoFull } from '@/components/brand/VelvetCodeLogo';
import { FinalCTASection } from '@/components/marketing/LandingSections';
import { Shield, Sparkles, Building, Code2, Users, Cpu, Award } from 'lucide-react';

export const metadata = {
  title: 'About Velvet Code — Technology & Digital Solutions',
  description:
    'Learn about Velvet Code, our mission to build intelligent real estate technology and enterprise SaaS infrastructure.',
};

export default function AboutPage() {
  const values = [
    {
      title: 'Real Estate Specific Architecture',
      desc: 'We do not build generic admin templates. Every screen, workflow, and data structure in Velvet Code is tailored to the nuances of property sales, site visits, and RERA compliance.',
      icon: Building,
    },
    {
      title: 'Institutional Grade Security',
      desc: 'Strict multi-tenant isolation ensures your client lists, deal values, and commission data remain 100% confidential and secure.',
      icon: Shield,
    },
    {
      title: 'Actionable Artificial Intelligence',
      desc: 'Realty AI is built to assist human agents, not replace them. We enforce mandatory human approval on all external communications.',
      icon: Sparkles,
    },
    {
      title: 'Engineering Excellence',
      desc: 'Built with Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL, and Prisma for sub-100ms response times.',
      icon: Code2,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0D11] text-zinc-100">
      <PublicHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 text-center max-w-4xl mx-auto px-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            About Velvet Code
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mt-4 tracking-tight">
            Pioneering Intelligent PropTech Solutions
          </h1>
          <p className="text-lg text-zinc-400 mt-4 leading-relaxed max-w-2xl mx-auto">
            Velvet Code is a dedicated technology & digital solutions company building commercial-grade SaaS infrastructure for the modern real estate industry.
          </p>
        </section>

        {/* Brand Banner Card */}
        <section className="py-12 max-w-4xl mx-auto px-4">
          <VelvetCodeLogoFull />
        </section>

        {/* Mission and Vision */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">Our Mission</h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                To empower every real estate agent, broker, and builder with enterprise-class CRM technology that eliminates missed leads, automates client follow-ups over WhatsApp, and accelerates transaction closures.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">Our Engineering Vision</h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                We believe the future of real estate CRM is deeply integrated with messaging apps and contextual AI. By combining seamless WhatsApp communication with intelligent lead scoring and pipeline management, we give agencies an unfair competitive edge.
              </p>
            </div>
          </div>
        </section>

        {/* Core Principles */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-zinc-800">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-white">Our Core Principles</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3"
                >
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">{v.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <FinalCTASection />
      </main>
      <PublicFooter />
    </div>
  );
}
