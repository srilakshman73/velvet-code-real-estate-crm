'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { buildWhatsAppUrl, formatINR } from '@/lib/utils';
import {
  ArrowRight,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Users,
  Building2,
  Kanban,
  CheckCircle2,
  Play,
  Bot,
  Zap,
} from 'lucide-react';

export function LandingHero() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'whatsapp' | 'ai'>('dashboard');

  return (
    <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Next-Generation Real Estate CRM SaaS</span>
          </div>
          <a
            href={buildWhatsAppUrl('919443647190', 'Hello Velvet Code, I want to book a live demo of the CRM.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Official WhatsApp: +91 94436 47190</span>
          </a>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Run Your Real Estate Business From{' '}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
              One Intelligent Workspace
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Manage leads, properties, clients, site visits, deals, follow-ups, WhatsApp conversations and team performance from one powerful CRM.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button
                variant="gold"
                size="lg"
                className="w-full sm:w-auto text-base px-8 py-3.5 shadow-2xl shadow-amber-500/30 font-bold"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Start 14-Day Free Trial
              </Button>
            </Link>

            <Link href="/app">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto text-base px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700 font-semibold"
                leftIcon={<Play className="w-4 h-4 text-amber-400 fill-amber-400" />}
              >
                Explore Live CRM Workspace
              </Button>
            </Link>
          </div>

          {/* Key Assurance Micro-Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Multi-Tenant Data Isolation
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Official WhatsApp & Realty AI Ready
            </span>
          </div>
        </div>

        {/* ========================================== */}
        {/* INTERACTIVE LIVE CRM PREVIEW DISPLAY */}
        {/* ========================================== */}
        <div className="mt-14 max-w-5xl mx-auto">
          {/* Tab Selector */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              Executive Dashboard
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'leads'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              Leads Pipeline
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'whatsapp'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              WhatsApp Inbox
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'ai'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              Realty AI Intelligence
            </button>
          </div>

          {/* Mockup Frame */}
          <div className="rounded-2xl border border-zinc-700/80 bg-zinc-950 p-2 sm:p-4 shadow-2xl shadow-black/80">
            {/* Top Browser Dots */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/80 bg-zinc-900/90 rounded-t-xl mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                app.velvetcode.tech/workspace/velvet-apex-realty
              </div>
              <Link
                href="/app"
                className="text-[11px] font-semibold text-amber-400 hover:underline flex items-center gap-1"
              >
                Open Full CRM ↗
              </Link>
            </div>

            {/* TAB 1: EXECUTIVE DASHBOARD PREVIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-4 p-2 sm:p-4 animate-in fade-in">
                {/* Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800">
                    <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                      Total Leads
                    </p>
                    <p className="text-2xl font-bold text-white mt-1">248</p>
                    <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +12.4% vs last mo
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800">
                    <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                      Site Visits
                    </p>
                    <p className="text-2xl font-bold text-white mt-1">42</p>
                    <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +8.2% confirmed
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800">
                    <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                      Active Deals
                    </p>
                    <p className="text-2xl font-bold text-white mt-1">18</p>
                    <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +15.1% pipeline
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900/90 border border-amber-500/30 bg-gradient-to-br from-zinc-900 to-amber-950/20">
                    <p className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">
                      Gross Revenue
                    </p>
                    <p className="text-2xl font-bold text-amber-300 mt-1">₹24.8 Lakhs</p>
                    <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +21.3% closed won
                    </p>
                  </div>
                </div>

                {/* Split Table & Pipeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Recent Hot Inquiries
                      </h4>
                      <span className="text-[10px] text-amber-400 font-medium">Real-time sync</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-850">
                        <div>
                          <p className="font-semibold text-white">Rahul Sharma</p>
                          <p className="text-[11px] text-zinc-400">Emerald Heights 3BHK • ₹1.45 Cr</p>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded">
                          Negotiation (92%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-850">
                        <div>
                          <p className="font-semibold text-white">Dr. Priya Raghavan</p>
                          <p className="text-[11px] text-zinc-400">Sobha Windsor Villa • ₹3.85 Cr</p>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 rounded">
                          Site Visit (88%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Today's High-Priority Follow-ups
                      </h4>
                      <span className="text-[10px] text-rose-400 font-medium">3 Actionable</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-850 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">Call Rahul Sharma (Parking Allotment)</p>
                          <p className="text-[10px] text-zinc-400">Due Today at 03:30 PM • Karthik S</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400">Call Now</span>
                      </div>
                      <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-850 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">WhatsApp Sobha Villa Pin to Dr. Priya</p>
                          <p className="text-[10px] text-zinc-400">Due Today at 04:00 PM • Ananya I</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400">WhatsApp</span>
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
                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-blue-500/30">
                    <p className="font-bold text-blue-400 mb-2">1. Qualified Leads (14)</p>
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                      <p className="font-semibold text-white">Suresh Kumar</p>
                      <p className="text-[10px] text-zinc-400">Prestige Cyber View • ₹92 Lakhs</p>
                      <span className="text-[10px] text-zinc-500">Source: Referral • Score: 79%</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-amber-500/30">
                    <p className="font-bold text-amber-400 mb-2">2. Site Visits Scheduled (8)</p>
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                      <p className="font-semibold text-white">Dr. Priya Raghavan</p>
                      <p className="text-[10px] text-zinc-400">Sobha Windsor Villa • ₹3.85 Cr</p>
                      <span className="text-[10px] text-amber-400">Tomorrow at 11:00 AM</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-emerald-500/30">
                    <p className="font-bold text-emerald-400 mb-2">3. Negotiation & Won (6)</p>
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                      <p className="font-semibold text-white">Rajesh Varma (Closed Won 🏆)</p>
                      <p className="text-[10px] text-zinc-400">Aura Penthouse • ₹5.20 Cr</p>
                      <span className="text-[10px] text-emerald-400">Token ₹25L Received</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: WHATSAPP CRM */}
            {activeTab === 'whatsapp' && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-in fade-in">
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <p className="font-bold text-emerald-400">WhatsApp Cloud CRM Stream</p>
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-emerald-500/30">
                    <p className="font-bold text-white">Rahul Sharma (+91 98401 22334)</p>
                    <p className="text-zinc-300 italic mt-1">
                      "Thanks Karthik, I reviewed the legal agreement. Looks good! Can we confirm the second parking slot?"
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-1">11:42 AM • Read & Verified</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <p className="font-bold text-amber-400">Automated Smart Trigger</p>
                  <p className="text-zinc-300 leading-relaxed">
                    When site visit is confirmed → Velvet Code automatically delivers instant branded confirmation & Google Maps pin.
                  </p>
                  <a
                    href={buildWhatsAppUrl('919443647190', 'Testing WhatsApp integration from Velvet Code.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline font-semibold text-[11px] pt-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Test Official WhatsApp: +91 94436 47190
                  </a>
                </div>
              </div>
            )}

            {/* TAB 4: REALTY AI */}
            {activeTab === 'ai' && (
              <div className="p-4 space-y-3 text-xs animate-in fade-in">
                <div className="p-3 rounded-xl bg-zinc-900/90 border border-amber-500/30 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Realty AI Conversion Analysis</p>
                    <p className="text-zinc-300 mt-1 leading-relaxed">
                      "Rahul Sharma and Dr. Anand Ramanathan have reached <strong>92%+ conversion probability</strong>. Total potential booking value: <strong>₹2.87 Crores</strong>. Recommended action: Issue token application form today."
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
