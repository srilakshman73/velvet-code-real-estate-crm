'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { SAAS_PLANS } from '@/lib/mock-data';
import { buildWhatsAppUrl } from '@/lib/utils';
import {
  Users,
  Building2,
  Kanban,
  CalendarCheck,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';

// ==========================================
// 2. TRUSTED TECHNOLOGY & STATS
// ==========================================
export function TrustedTechSection() {
  const stats = [
    { value: '₹450+ Cr', label: 'Property Inventory Managed' },
    { value: '84,000+', label: 'Real Estate Leads Processed' },
    { value: '1,240+', label: 'Active Real Estate Agencies' },
    { value: '99.9%', label: 'Cloud Infrastructure SLA' },
  ];

  return (
    <section className="py-16 border-y border-[#DDD4C4] bg-[#EFE8DA]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-[#766F63] mb-10">
          Engineered for High-Performance Real Estate Sales Teams Across India
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#24211D] font-serif">
                {s.value}
              </div>
              <p className="text-xs sm:text-sm text-[#766F63] font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 3. CORE VALUE MODULES SHOWCASE
// ==========================================
export function CoreModulesShowcase() {
  const features = [
    {
      icon: Users,
      title: 'Lead Management Engine',
      description:
        'Capture leads from WhatsApp, Google Ads, Meta Ads, 99acres, MagicBricks, and website inquiries into a unified dashboard. Auto-assign to agents with instant AI lead scoring.',
      tag: 'Zero Lead Leakage',
    },
    {
      icon: Building2,
      title: 'Property Inventory Vault',
      description:
        'Manage residential apartments, luxury villas, plots, and commercial units. Store high-res galleries, floor plans, RERA details, and real-time unit availability.',
      tag: 'Instant Inventory Sync',
    },
    {
      icon: Kanban,
      title: 'Visual Sales Deal Pipeline',
      description:
        'Track opportunities across New Lead, Qualified, Site Visit, Negotiation, Documentation, and Closed Won stages with probability and revenue metrics.',
      tag: 'Drag & Drop Kanban',
    },
    {
      icon: CalendarCheck,
      title: 'Site Visit Management',
      description:
        'Schedule customer property viewings, dispatch Google Maps directions via WhatsApp, log agent GPS check-ins, and capture instant client feedback & ratings.',
      tag: '5x Site Visit Velocity',
    },
    {
      icon: MessageSquare,
      title: 'Official WhatsApp CRM',
      description:
        'Engage clients inside a 3-column WhatsApp inbox. Send rich media brochures, automate site visit reminders, and trigger instant greetings with approved templates.',
      tag: 'Cloud API Integration',
    },
    {
      icon: Sparkles,
      title: 'Realty AI Assistant',
      description:
        'Context-aware AI that analyzes your CRM records to rank high-intent buyers, recommend matching properties under budget, and draft personalized WhatsApp messages.',
      tag: 'PropTech Intelligence',
    },
  ];

  return (
    <section className="py-24 bg-[#F7F3EA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8F642B] bg-[#A374]/15 px-3.5 py-1 rounded-full border border-[#A374]/30">
            Comprehensive CRM Modules
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-[#24211D] mt-4 tracking-tight font-serif">
            Every Tool You Need to Scale Your Real Estate Agency
          </h2>
          <p className="text-base text-[#766F63] mt-4 leading-relaxed">
            Built from the ground up for agents, brokers, builders, and property consultants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="group relative rounded-2xl p-7 bg-[#FFFCF6] border border-[#DDD4C4] hover:border-[#A374] aurum-card-hover aurum-card-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-xl bg-[#F7F3EA] border border-[#DDD4C4] text-[#8F642B] group-hover:scale-105 group-hover:border-[#A374]/50 transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#766F63] bg-[#F7F3EA] px-2.5 py-1 rounded-md border border-[#DDD4C4]">
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#24211D] mb-2 group-hover:text-[#8F642B] transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#766F63] leading-relaxed">
                    {f.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#DDD4C4]/60 flex items-center text-xs font-bold text-[#8F642B] group-hover:text-[#7A5320]">
                  <span>Explore module</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 4. WHATSAPP & REALTY AI DEEP DIVE
// ==========================================
export function WhatsAppAndAIShowcase() {
  return (
    <section className="py-24 border-t border-[#DDD4C4] bg-[#EFE8DA]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Official WhatsApp */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#2E6B4F]/10 border border-[#2E6B4F]/30 text-[#2E6B4F] text-xs font-bold">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Official WhatsApp Business Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#24211D] tracking-tight font-serif">
              Connect With Buyers on India's #1 Messaging App
            </h2>
            <p className="text-sm text-[#766F63] leading-relaxed">
              Real estate deals happen on WhatsApp. Velvet Code gives you a complete 3-column WhatsApp CRM inbox with instant lead capture, automated site visit confirmations, and template broadcasts.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-[#24211D]">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#2E6B4F] flex-shrink-0" />
                <span>Zero message delay — Instant automated response upon inquiry submission</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#2E6B4F] flex-shrink-0" />
                <span>Pre-approved templates with dynamic customer and property variables</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#2E6B4F] flex-shrink-0" />
                <span>Official click-to-chat integration with <strong>+91 63833 95915</strong></span>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href={buildWhatsAppUrl('916383395915', 'Hello, I would like to know more about your Real Estate CRM.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2E6B4F] hover:bg-[#24563F] text-white font-bold text-xs shadow-md transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Test Live WhatsApp Channel (+91 63833 95915)</span>
              </a>
            </div>
          </div>

          {/* Right Column: Realty AI Card */}
          <div className="rounded-2xl border border-[#DDD4C4] bg-[#FFFCF6] p-6 aurum-card-shadow relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-[#DDD4C4]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#A374]/20 text-[#8F642B]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#24211D]">Realty AI in Action</h3>
                  <p className="text-[11px] text-[#766F63]">Contextual CRM Intelligence Engine</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#A374]/20 text-[#7A5320] border border-[#A374]/40 rounded">
                Strict Org Isolation
              </span>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F7F3EA] border border-[#DDD4C4] text-[#24211D]">
                <span className="font-bold text-[#8F642B]">Agent Prompt:</span> "Which leads are most likely to convert this week?"
              </div>
              <div className="p-3.5 rounded-xl bg-[#FFFCF6] border border-[#A374]/40 text-[#24211D] space-y-2">
                <span className="font-bold text-[#2E6B4F] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Realty AI Output:
                </span>
                <p className="text-xs leading-relaxed text-[#766F63]">
                  "1. <strong className="text-[#24211D]">Luxury Villa Inquiry</strong> (92% Conversion Score) — Budget ₹2.50 Cr match. Verified buyer profile.<br/>
                  2. <strong className="text-[#24211D]">Commercial IT Hub Lead</strong> (88% Conversion Score) — Site visit scheduled for tomorrow.<br/>
                  <em>Drafted personalized WhatsApp follow-up ready for agent review.</em>"
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#DDD4C4] flex items-center justify-between text-xs text-[#766F63]">
              <span>Security Rule: Never sends without agent review.</span>
              <Link href="/app/ai" className="text-[#8F642B] font-bold hover:underline">
                Try Realty AI ↗
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 5. SUBSCRIPTION PLANS & PRICING SECTION
// ==========================================
export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-[#F7F3EA] border-t border-[#DDD4C4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8F642B] bg-[#A374]/15 px-3.5 py-1 rounded-full border border-[#A374]/30">
            Transparent SaaS Pricing
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-[#24211D] mt-4 tracking-tight font-serif">
            Plans Built for Solopreneurs to Enterprise Agencies
          </h2>
          <p className="text-base text-[#766F63] mt-4 leading-relaxed">
            All plans include multi-tenant organization isolation and 14-day risk-free trial.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={`text-xs font-bold ${!isAnnual ? 'text-[#24211D]' : 'text-[#766F63]'}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-12 h-6 rounded-full bg-[#DDD4C4] p-1 border border-[#C9A45C]/40 transition-colors"
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#A374] transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-bold flex items-center gap-1.5 ${isAnnual ? 'text-[#24211D]' : 'text-[#766F63]'}`}>
              Annual Billing
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#2E6B4F]/15 text-[#2E6B4F] border border-[#2E6B4F]/30 rounded-full">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {SAAS_PLANS.map((plan) => {
            const isPopular = plan.tier === 'PROFESSIONAL';
            const price = isAnnual
              ? Math.round(plan.priceAnnualINR / 12)
              : plan.priceMonthlyINR;

            return (
              <div
                key={plan.tier}
                className={`relative rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 aurum-card-shadow ${
                  isPopular
                    ? 'bg-[#FFFCF6] border-2 border-[#A374] scale-105 shadow-xl'
                    : 'bg-[#FFFCF6] border border-[#DDD4C4] hover:border-[#A374]/60'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#A374] text-[#151515] text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                    Most Popular Choice
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-[#24211D]">{plan.name}</h3>
                    <span className="text-xs font-semibold text-[#766F63]">
                      {plan.maxUsers} {plan.maxUsers === 1 ? 'User' : 'Users'}
                    </span>
                  </div>

                  <div className="mt-4 mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-[#24211D] font-sans">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-[#766F63] font-medium">/month</span>
                    </div>
                    {isAnnual && (
                      <p className="text-[11px] text-[#2E6B4F] font-bold mt-1">
                        Billed annually (₹{plan.priceAnnualINR.toLocaleString('en-IN')}/yr)
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#DDD4C4] space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#766F63]">
                      Plan Includes:
                    </p>
                    <ul className="space-y-2.5 text-xs text-[#24211D]">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#8F642B] flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#DDD4C4]">
                  <Link href="/register">
                    <Button
                      variant={isPopular ? 'gold' : 'secondary'}
                      size="md"
                      className="w-full font-bold"
                    >
                      Get Started
                    </Button>
                  </Link>
                  <p className="text-[10px] text-center text-[#766F63] mt-2">
                    14-day trial • Cancel anytime
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 6. TESTIMONIALS & CASE STUDIES
// ==========================================
export function TestimonialsSection() {
  const reviews = [
    {
      quote:
        'Velvet Code transformed our OMR luxury sales operations. Our site visit conversion rate jumped by 42% after enabling the automated WhatsApp reminders and lead scoring.',
      author: 'Suresh Narayanan',
      role: 'Managing Director, Apex Realty Chennai',
      properties: '₹85 Cr Portfolio',
    },
    {
      quote:
        'Realty AI is unmatched. Being able to ask "Which leads are most likely to convert?" and get instant data-backed recommendations saves our agents 2 hours every single morning.',
      author: 'Deepa Hegde',
      role: 'Founder & Principal Broker, Bangalore Luxe Spaces',
      properties: '12 Agents Team',
    },
    {
      quote:
        'The WhatsApp CRM integration with official click-to-chat and instant template broadcasts eliminated our lead response delay completely. Best PropTech CRM in India.',
      author: 'Amitabh Sen',
      role: 'Sales Director, Skyline Prime Developers Mumbai',
      properties: '220+ Units Sold',
    },
  ];

  return (
    <section className="py-24 border-t border-[#DDD4C4] bg-[#EFE8DA]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8F642B] bg-[#A374]/15 px-3.5 py-1 rounded-full border border-[#A374]/30">
            Real Estate Leadership
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#24211D] mt-4 tracking-tight font-serif">
            Trusted by Top Real Estate Agencies & Builders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="p-7 rounded-2xl bg-[#FFFCF6] border border-[#DDD4C4] aurum-card-shadow flex flex-col justify-between space-y-6"
            >
              <p className="text-xs sm:text-sm text-[#24211D] leading-relaxed italic">
                "{r.quote}"
              </p>
              <div className="pt-4 border-t border-[#DDD4C4] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#24211D]">{r.author}</h4>
                  <p className="text-[11px] text-[#766F63]">{r.role}</p>
                </div>
                <span className="text-[10px] font-bold text-[#8F642B] bg-[#A374]/15 px-2.5 py-1 rounded-md border border-[#A374]/30">
                  {r.properties}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 7. INTERACTIVE FAQ ACCORDION
// ==========================================
export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the official WhatsApp CRM integration work?',
      a: 'Velvet Code provides a built-in 3-column WhatsApp inbox that integrates with official WhatsApp Cloud API and click-to-chat channels (such as +91 63833 95915). You can send templates, share property brochures, and log all chat history directly under the customer’s CRM profile.',
    },
    {
      q: 'Is my real estate agency data completely isolated from other organizations?',
      a: 'Yes, 100%. Velvet Code enforces multi-tenant organization isolation at the database and server layer with organization_id constraints. Organization A can never query or view Organization B records.',
    },
    {
      q: 'How does Realty AI access and analyze my CRM data?',
      a: 'Realty AI runs securely on authorized server-side API routes scoped strictly to your authenticated workspace. It analyzes lead budgets, property matches, and follow-up urgency without exposing your data publicly or training public models.',
    },
    {
      q: 'Can I import my existing leads and property listings from Excel/CSV?',
      a: 'Absolutely. Velvet Code includes a built-in CSV/Excel Lead Importer that maps names, phone numbers, sources, and budgets directly into your pipeline in seconds.',
    },
    {
      q: 'Are subscription limits enforced automatically?',
      a: 'Yes. Plan restrictions (user seats, lead quotas, property inventory, AI queries) are enforced server-side. You can easily upgrade or downgrade your plan at any time with instant prorated activation.',
    },
  ];

  return (
    <section className="py-24 border-t border-[#DDD4C4] bg-[#F7F3EA]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8F642B] bg-[#A374]/15 px-3.5 py-1 rounded-full border border-[#A374]/30">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#24211D] mt-4 tracking-tight font-serif">
            Everything You Need to Know About Velvet Code CRM
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#DDD4C4] bg-[#FFFCF6] overflow-hidden aurum-card-shadow transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm sm:text-base font-bold text-[#24211D] hover:text-[#8F642B]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#A374] transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#766F63] leading-relaxed border-t border-[#DDD4C4]/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 8. FINAL CONVERSION CTA
// ==========================================
export function FinalCTASection() {
  return (
    <section className="py-24 border-t border-[#DDD4C4] bg-[#EFE8DA] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#A374]/15 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        <h2 className="text-3xl sm:text-5xl font-bold text-[#24211D] tracking-tight leading-tight font-serif">
          Ready to Modernize Your Real Estate Sales Engine?
        </h2>
        <p className="text-base sm:text-lg text-[#766F63] max-w-2xl mx-auto leading-relaxed">
          Join leading real estate agencies, brokers, and developers managing their leads, properties, and deals on Velvet Code.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/register">
            <Button
              variant="gold"
              size="lg"
              className="w-full sm:w-auto font-bold text-base px-8 py-3.5 shadow-xl"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Get Started
            </Button>
          </Link>
          <a
            href={buildWhatsAppUrl('916383395915', 'Hello, I would like to know more about your Real Estate CRM.')}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2E6B4F] hover:bg-[#24563F] text-white font-bold text-base shadow-md transition-all"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Chat on WhatsApp: +91 63833 95915</span>
          </a>
        </div>
      </div>
    </section>
  );
}
