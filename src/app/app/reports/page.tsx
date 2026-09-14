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
  const [filter, setFilter] = useState('ThisMonth');

  const leadConversionFunnel = [
    { stage: 'Total Inquiries', count: 248, fill: '#3B82F6' },
    { stage: 'Contacted', count: 184, fill: '#8B5CF6' },
    { stage: 'Qualified Buyers', count: 96, fill: '#F59E0B' },
    { stage: 'Site Visits Scheduled', count: 42, fill: '#EC4899' },
    { stage: 'Negotiation', count: 18, fill: '#EAB308' },
    { stage: 'Closed Won 🏆', count: 6, fill: '#10B981' },
  ];

  const agentPerformance = [
    { name: 'Velvet Code', revenue: 52.0, deals: 1, visits: 3 },
    { name: 'Karthik Subramanian', revenue: 28.7, deals: 2, visits: 8 },
    { name: 'Ananya Iyer', revenue: 38.5, deals: 1, visits: 5 },
    { name: 'Divya Krishnan', revenue: 17.6, deals: 2, visits: 6 },
  ];

  const monthlyRevenue = [
    { month: 'Apr', revenue: 14.2 },
    { month: 'May', revenue: 16.8 },
    { month: 'Jun', revenue: 18.5 },
    { month: 'Jul', revenue: 21.0 },
    { month: 'Aug', revenue: 20.4 },
    { month: 'Sep', revenue: 24.8 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-amber-400" />
              Executive Analytics & Reports
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
              Real-Time Metrics
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Conversion funnels, agent revenue leaderboards, and marketing channel ROI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl flex text-xs">
            {['Today', '7 Days', '30 Days', 'ThisMonth'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filter === t ? 'bg-amber-500 text-black font-semibold' : 'text-zinc-400 hover:text-white'
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
        <div className="lg:col-span-6 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-white tracking-tight">
              Lead Conversion Funnel
            </h3>
            <p className="text-xs text-zinc-400">Visitor inquiry to Closed Won transaction velocity</p>
          </div>

          <div className="space-y-3 pt-2">
            {leadConversionFunnel.map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-300">{step.stage}</span>
                  <span className="text-white font-mono">{step.count} leads</span>
                </div>
                <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(step.count / 248) * 100}%`,
                      backgroundColor: step.fill,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Revenue Leaderboard */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-white tracking-tight">
              Sales Consultant Revenue Contribution
            </h3>
            <p className="text-xs text-zinc-400">Closed commission vs active pipeline in Lakhs INR</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" stroke="#71717a" fontSize={11} tickFormatter={(v) => `₹${v}L`} />
                <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={11} width={130} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#3f3f46',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`₹${val} Lakhs`, 'Contribution']}
                />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
