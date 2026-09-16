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
    { stage: 'Total Inquiries', count: 248, fill: '#3B5BDB' },
    { stage: 'Contacted', count: 184, fill: '#7048E8' },
    { stage: 'Qualified Buyers', count: 96, fill: '#B87B28' },
    { stage: 'Site Visits Scheduled', count: 42, fill: '#A374' },
    { stage: 'Negotiation', count: 18, fill: '#D97706' },
    { stage: 'Closed Won 🏆', count: 6, fill: '#2E6B4F' },
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
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#24211D] tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#A374]" />
              Executive Analytics & Reports
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-[#A374]/15 text-[#8F642B] border border-[#A374]/30 rounded-full">
              Real-Time Metrics
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#766F63] mt-1">
            Conversion funnels, agent revenue leaderboards, and marketing channel ROI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#FFFCF6] border border-[#DDD4C4] p-1 rounded-xl flex text-xs shadow-xs">
            {['Today', '7 Days', '30 Days', 'ThisMonth'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filter === t ? 'bg-[#A374] text-white font-semibold shadow-xs' : 'text-[#766F63] hover:text-[#24211D]'
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
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#FFFCF6] border border-[#DDD4C4] space-y-4 shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
          <div className="border-b border-[#DDD4C4] pb-3">
            <h3 className="text-base font-serif font-bold text-[#24211D] tracking-tight">
              Lead Conversion Funnel
            </h3>
            <p className="text-xs text-[#766F63]">Visitor inquiry to Closed Won transaction velocity</p>
          </div>

          <div className="space-y-3 pt-2">
            {leadConversionFunnel.map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#24211D]">{step.stage}</span>
                  <span className="text-[#8F642B] font-mono">{step.count} leads</span>
                </div>
                <div className="w-full h-3 bg-[#F7F3EA] rounded-full overflow-hidden border border-[#DDD4C4]/50">
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
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#FFFCF6] border border-[#DDD4C4] space-y-4 shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
          <div className="border-b border-[#DDD4C4] pb-3">
            <h3 className="text-base font-serif font-bold text-[#24211D] tracking-tight">
              Sales Consultant Revenue Contribution
            </h3>
            <p className="text-xs text-[#766F63]">Closed commission vs active pipeline in Lakhs INR</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ECE5D8" horizontal={false} />
                <XAxis type="number" stroke="#766F63" fontSize={11} tickFormatter={(v) => `₹${v}L`} />
                <YAxis dataKey="name" type="category" stroke="#24211D" fontSize={11} width={130} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFCF6',
                    borderColor: '#DDD4C4',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#24211D',
                    boxShadow: '0 10px 25px -5px rgba(21,21,21,0.08)',
                  }}
                  formatter={(val: any) => [`₹${val} Lakhs`, 'Contribution']}
                />
                <Bar dataKey="revenue" fill="#A374" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
