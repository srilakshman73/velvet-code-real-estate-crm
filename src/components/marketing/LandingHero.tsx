'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { buildWhatsAppUrl } from '@/lib/utils';
import {
  ArrowRight,
  Sparkles,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Play,
  Bot,
} from 'lucide-react';

export function LandingHero() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'whatsapp' | 'ai'>('dashboard');

  return (
    <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden bg-[#E9DFC8]">
      {/* Subtle Luxury Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#A37432]/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-[#C39A5B]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF9F0] border border-[#D8C7A5] text-[#7A5520] text-xs font-bold aurum-card-shadow">
            <Sparkles className="w-3.5 h-3.5 text-[#A37432]" />
            <span className="tracking-wide uppercase text-[11px]">VELVET CODE &bull; REAL ESTATE CRM</span>
          </div>
          <a
            href={buildWhatsAppUrl('916383395915', 'Hello, I would like to know more about your Real Estate CRM.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF9F0] border border-[#547A61]/40 text-[#547A61] text-xs font-bold hover:bg-[#547A61]/10 transition-colors aurum-card-shadow"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Official WhatsApp: +91 63833 95915</span>
          </a>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#2C241A] leading-[1.12] font-serif">
            Run Your Real Estate Business From{' '}
            <span className="gold-gradient-text italic font-serif">
              One Intelligent Workspace
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[#6A5A44] max-w-2xl mx-auto leading-relaxed font-normal">
            A premium platform for managing leads, properties, clients, deals and real-estate operations.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button
                variant="gold"
                size="lg"
                className="w-full sm:w-auto text-base px-8 py-3.5 font-bold shadow-[0_6px_24px_-2px_rgba(163,116,50,0.35)]"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Get Started
              </Button>
            </Link>

            <Link href="/app">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto text-base px-7 py-3.5 font-bold"
                leftIcon={<Play className="w-4 h-4 text-[#7A5520] fill-[#7A5520]" />}
              >
                Explore CRM
              </Button>
            </Link>
          </div>

          {/* Key Assurance Micro-Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#6A5A44] font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#547A61]" />
              No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#547A61]" />
              Strict Multi-Tenant Isolation
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#547A61]" />
              Official WhatsApp & Realty AI Ready
            </span>
          </div>
        </div>

        {/* ========================================== */}
        {/* INTERACTIVE LIVE CRM PREVIEW DISPLAY */}
        {/* ========================================== */}
        <div className="mt-16 max-w-5xl mx-auto">
          {/* Tab Selector */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#A37432] text-[#FFF9F0] shadow-sm'
                  : 'bg-[#FFF9F0] text-[#6A5A44] hover:text-[#2C241A] border border-[#D8C7A5]'
              }`}
            >
              Executive Dashboard
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'leads'
                  ? 'bg-[#A37432] text-[#FFF9F0] shadow-sm'
                  : 'bg-[#FFF9F0] text-[#6A5A44] hover:text-[#2C241A] border border-[#D8C7A5]'
              }`}
            >
              Leads Pipeline
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'whatsapp'
                  ? 'bg-[#547A61] text-[#FFF9F0] shadow-sm'
                  : 'bg-[#FFF9F0] text-[#6A5A44] hover:text-[#2C241A] border border-[#D8C7A5]'
              }`}
            >
              WhatsApp Inbox
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'ai'
                  ? 'bg-[#A37432] text-[#FFF9F0] shadow-sm'
                  : 'bg-[#FFF9F0] text-[#6A5A44] hover:text-[#2C241A] border border-[#D8C7A5]'
              }`}
            >
              Realty AI Intelligence
            </button>
          </div>

          {/* Mockup Frame */}
          <div className="rounded-2xl border border-[#D8C7A5] bg-[#FFF9F0] p-2 sm:p-4 aurum-card-shadow">
            {/* Top Browser Dots */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#D8C7A5] bg-[#F4EAD7] rounded-t-xl mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#8B4A4A]/80" />
                <span className="w-3 h-3 rounded-full bg-[#A37432]/80" />
                <span className="w-3 h-3 rounded-full bg-[#547A61]/80" />
              </div>
              <div className="text-[11px] font-mono text-[#8A7A63] flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#547A61] animate-pulse" />
                app.velvetcode.tech/workspace/velvet-apex-realty
              </div>
              <Link
                href="/app"
                className="text-[11px] font-bold text-[#7A5520] hover:underline flex items-center gap-1"
              >
                Open Full CRM ↗
              </Link>
            </div>

            {/* TAB 1: EXECUTIVE DASHBOARD PREVIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-4 p-2 sm:p-4 animate-in fade-in">
                {/* Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-4 rounded-xl bg-[#FFF9F0] border border-[#D8C7A5]">
                    <p className="text-[11px] uppercase tracking-wider text-[#8A7A63] font-bold">
                      Total Leads
                    </p>
                    <p className="text-2xl font-extrabold text-[#2C241A] mt-1">248</p>
                    <p className="text-xs text-[#547A61] font-bold mt-1 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +12.4% vs last mo
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FFF9F0] border border-[#D8C7A5]">
                    <p className="text-[11px] uppercase tracking-wider text-[#8A7A63] font-bold">
                      Site Visits
                    </p>
                    <p className="text-2xl font-extrabold text-[#2C241A] mt-1">42</p>
                    <p className="text-xs text-[#547A61] font-bold mt-1 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +8.2% confirmed
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FFF9F0] border border-[#D8C7A5]">
                    <p className="text-[11px] uppercase tracking-wider text-[#8A7A63] font-bold">
                      Active Deals
                    </p>
                    <p className="text-2xl font-extrabold text-[#2C241A] mt-1">18</p>
                    <p className="text-xs text-[#547A61] font-bold mt-1 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +15.1% pipeline
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FFF9F0] border border-[#A37432]/60">
                    <p className="text-[11px] uppercase tracking-wider text-[#7A5520] font-bold">
                      Gross Revenue
                    </p>
                    <p className="text-2xl font-extrabold text-[#7A5520] mt-1 font-mono">₹24.8 Lakhs</p>
                    <p className="text-xs text-[#547A61] font-bold mt-1 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +21.3% closed won
                    </p>
                  </div>
                </div>

                {/* Split Table & Pipeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#FFF9F0] border border-[#D8C7A5]">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-[#2C241A] uppercase tracking-wider">
                        Recent Hot Inquiries
                      </h4>
                      <span className="text-[10px] text-[#7A5520] font-bold">Real-time sync</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F4EAD7] border border-[#D8C7A5]">
                        <div>
                          <p className="font-bold text-[#2C241A]">High-Intent Luxury Buyer</p>
                          <p className="text-[11px] text-[#6A5A44]">Emerald Heights 3BHK • ₹1.45 Cr</p>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-[#A37432]/20 text-[#7A5520] rounded">
                          Negotiation (92%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F4EAD7] border border-[#D8C7A5]">
                        <div>
                          <p className="font-bold text-[#2C241A]">Sea-Facing Villa Buyer</p>
                          <p className="text-[11px] text-[#6A5A44]">Sobha Windsor Villa • ₹3.85 Cr</p>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-[#D8C7A5]/40 text-[#7A5520] rounded">
                          Site Visit (88%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FFF9F0] border border-[#D8C7A5]">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-[#2C241A] uppercase tracking-wider">
                        Today's High-Priority Follow-ups
                      </h4>
                      <span className="text-[10px] text-[#8B4A4A] font-bold">Active Tasks</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-[#F4EAD7] border border-[#D8C7A5] flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[#2C241A]">Call Villa Buyer (Parking Allotment)</p>
                          <p className="text-[10px] text-[#6A5A44]">Due Today at 03:30 PM • Client Priority</p>
                        </div>
                        <span className="text-[10px] font-bold text-[#547A61]">Call Now</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#F4EAD7] border border-[#D8C7A5] flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[#2C241A]">WhatsApp Villa Brochure & Pin</p>
                          <p className="text-[10px] text-[#6A5A44]">Due Today at 04:00 PM • Instant Send</p>
                        </div>
                        <span className="text-[10px] font-bold text-[#547A61]">WhatsApp</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LEADS PIPELINE */}
            {activeTab === 'leads' && (
              <div className="p-4 space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#FFF9F0] border border-[#D8C7A5]">
                    <p className="font-bold text-[#7A5520] mb-2">1. Qualified Leads</p>
                    <div className="p-2.5 rounded-lg bg-[#F4EAD7] border border-[#D8C7A5] space-y-1">
                      <p className="font-bold text-[#2C241A]">Qualified Penthouse Lead</p>
                      <p className="text-[10px] text-[#6A5A44]">Prestige Cyber View • ₹92 Lakhs</p>
                      <span className="text-[10px] text-[#8A7A63]">Source: Website • Score: 85%</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FFF9F0] border border-[#A37432]/50">
                    <p className="font-bold text-[#7A5520] mb-2">2. Site Visits Scheduled</p>
                    <div className="p-2.5 rounded-lg bg-[#F4EAD7] border border-[#D8C7A5] space-y-1">
                      <p className="font-bold text-[#2C241A]">Luxury Villa Client</p>
                      <p className="text-[10px] text-[#6A5A44]">Sobha Windsor Villa • ₹3.85 Cr</p>
                      <span className="text-[10px] text-[#7A5520] font-semibold">Tomorrow at 11:00 AM</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FFF9F0] border border-[#547A61]/40">
                    <p className="font-bold text-[#547A61] mb-2">3. Negotiation & Won</p>
                    <div className="p-2.5 rounded-lg bg-[#F4EAD7] border border-[#D8C7A5] space-y-1">
                      <p className="font-bold text-[#2C241A]">Commercial Investor (Closed Won 🏆)</p>
                      <p className="text-[10px] text-[#6A5A44]">Aura Penthouse • ₹5.20 Cr</p>
                      <span className="text-[10px] text-[#547A61] font-bold">Token ₹25L Received</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: WHATSAPP CRM */}
            {activeTab === 'whatsapp' && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-in fade-in">
                <div className="p-3.5 rounded-xl bg-[#FFF9F0] border border-[#D8C7A5] space-y-2">
                  <p className="font-bold text-[#547A61]">WhatsApp Cloud CRM Stream</p>
                  <div className="p-2.5 rounded-lg bg-[#F4EAD7] border border-[#547A61]/30">
                    <p className="font-bold text-[#2C241A]">Verified Contact (+91 63833 95915)</p>
                    <p className="text-[#6A5A44] italic mt-1">
                      "I reviewed the property specification sheet. Looks great! Can we confirm the private viewing time?"
                    </p>
                    <p className="text-[10px] text-[#8A7A63] mt-1 font-semibold">11:42 AM • Read & Verified</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FFF9F0] border border-[#D8C7A5] space-y-2">
                  <p className="font-bold text-[#7A5520]">Automated Smart Trigger</p>
                  <p className="text-[#6A5A44] leading-relaxed">
                    When site visit is confirmed → Velvet Code automatically delivers instant branded confirmation & Google Maps pin.
                  </p>
                  <a
                    href={buildWhatsAppUrl('916383395915', 'Hello, I would like to know more about your Real Estate CRM.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#547A61] hover:underline font-bold text-[11px] pt-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Test Official WhatsApp: +91 63833 95915
                  </a>
                </div>
              </div>
            )}

            {/* TAB 4: REALTY AI */}
            {activeTab === 'ai' && (
              <div className="p-4 space-y-3 text-xs animate-in fade-in">
                <div className="p-3.5 rounded-xl bg-[#FFF9F0] border border-[#A37432]/50 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#A37432]/20 text-[#7A5520]">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#2C241A]">Realty AI Conversion Analysis</p>
                    <p className="text-[#6A5A44] mt-1 leading-relaxed">
                      "Active buyer inquiries have reached <strong>92%+ conversion probability</strong>. Total potential booking value: <strong>₹2.87 Crores</strong>. Recommended action: Issue booking application form today."
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
