'use client';

import React, { useState } from 'react';
import { useCRMStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Users,
  Building2,
  CalendarCheck,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function ReportsPage() {
  const { leads, deals, siteVisits, users } = useCRMStore();
  const [filter, setFilter] = useState('ThisMonth');

  const totalInquiries = leads.length;
  const contactedLeads = leads.filter((l) => l.status !== 'NEW').length;
  const qualifiedLeads = leads.filter(
    (l) => l.status === 'QUALIFIED' || l.status === 'SITE_VISIT' || l.status === 'NEGOTIATION' || l.status === 'WON'
  ).length;
  const siteVisitsCount = siteVisits.length;
  const inNegotiationCount = deals.filter((d) => d.stage === 'NEGOTIATION' || d.stage === 'DOCUMENTATION').length;
  const closedWonCount = deals.filter((d) => d.stage === 'CLOSED_WON').length;

  const leadConversionFunnel = [
    { stage: 'Total Inquiries', count: totalInquiries, fill: '#765D66' },
    { stage: 'Contacted', count: contactedLeads, fill: '#D98FA5' },
    { stage: 'Qualified Buyers', count: qualifiedLeads, fill: '#B8893C' },
    { stage: 'Site Visits Scheduled', count: siteVisitsCount, fill: '#B86B84' },
    { stage: 'Negotiation', count: inNegotiationCount, fill: '#8C455C' },
    { stage: 'Closed Won ðŸ†', count: closedWonCount, fill: '#4A7C59' },
  ];

  const maxFunnelCount = Math.max(...leadConversionFunnel.map((s) => s.count), 1);

  const agentPerformance = users.map((u) => {
    const userDeals = deals.filter((d) => d.assignedAgentId === u.id);
    const userWonRev = userDeals
      .filter((d) => d.stage === 'CLOSED_WON')
      .reduce((sum, d) => sum + d.dealValueINR, 0);
    const userVisits = siteVisits.filter((v) => v.assignedAgentId === u.id).length;
    return {
      name: u.name,
      revenue: userWonRev / 100000,
      deals: userDeals.length,
      visits: userVisits,
    };
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto bg-[#FCECEF] text-[#3A2930]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A2930] tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#B86B84]" />
              Executive Analytics & Reports
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-[#B86B84]/15 text-[#8C455C] border border-[#B86B84]/30 rounded-full">
              Real-Time Metrics
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#765D66] mt-1">
            Conversion funnels, agent revenue leaderboards, and marketing channel ROI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#FFF9FA] border border-[#EBCBD4] p-1 rounded-xl flex text-xs shadow-xs">
            {['Today', '7 Days', '30 Days', 'ThisMonth'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  filter === t ? 'bg-[#B86B84] text-white font-semibold shadow-xs' : 'text-[#765D66] hover:text-[#3A2930]'
                }`}
              >
                {t === 'ThisMonth' ? 'This Month' : t}
              </button>
            ))}
          </div>

          <Button
            variant="subtle"
            size="sm"
            onClick={() => alert('Exporting Executive Analytics PDF...')}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Conversion Funnel & Agent Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Conversion Funnel */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#FFF9FA] border border-[#EBCBD4] space-y-4 shadow-[0_8px_24px_rgba(120,90,40,0.08)]">
          <div className="border-b border-[#EBCBD4] pb-3">
            <h3 className="text-base font-serif font-bold text-[#3A2930] tracking-tight">
              Lead Conversion Funnel
            </h3>
            <p className="text-xs text-[#765D66]">Visitor inquiry to Closed Won transaction velocity</p>
          </div>

          <div className="space-y-3 pt-2">
            {leadConversionFunnel.map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#3A2930]">{step.stage}</span>
                  <span className="text-[#8C455C] font-mono">{step.count} leads</span>
                </div>
                <div className="w-full h-3 bg-[#FFF5F7] rounded-full overflow-hidden border border-[#EBCBD4]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: step.count > 0 ? `${(step.count / maxFunnelCount) * 100}%` : '0%',
                      backgroundColor: step.fill,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Revenue Leaderboard */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#FFF9FA] border border-[#EBCBD4] space-y-4 shadow-[0_8px_24px_rgba(120,90,40,0.08)]">
          <div className="border-b border-[#EBCBD4] pb-3">
            <h3 className="text-base font-serif font-bold text-[#3A2930] tracking-tight">
              Sales Consultant Revenue Contribution
            </h3>
            <p className="text-xs text-[#765D66]">Closed commission vs active pipeline in Lakhs INR</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F2DAE1" horizontal={false} />
                <XAxis type="number" stroke="#765D66" fontSize={11} tickFormatter={(v) => `â‚¹${v}L`} />
                <YAxis dataKey="name" type="category" stroke="#3A2930" fontSize={11} width={130} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF9FA',
                    borderColor: '#EBCBD4',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#3A2930',
                    boxShadow: '0 8px 24px rgba(120,90,40,0.12)',
                  }}
                  formatter={(val: any) => [`â‚¹${val} Lakhs`, 'Contribution']}
                />
                <Bar dataKey="revenue" fill="#B86B84" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

