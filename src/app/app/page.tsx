'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCRMStore } from '@/lib/store';
import { MetricCard } from '@/components/ui/MetricCard';
import { LeadStatusBadge, PriorityBadge, DealStageBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR, formatRelativeTime, buildWhatsAppUrl } from '@/lib/utils';
import {
  Users,
  CalendarCheck,
  Kanban,
  DollarSign,
  TrendingUp,
  PlusCircle,
  MessageSquare,
  Sparkles,
  Phone,
  Clock,
  CheckCircle2,
  ChevronRight,
  Building,
  ArrowUpRight,
  ExternalLink,
  Award,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function DashboardPage() {
  const {
    currentOrg,
    currentUser,
    leads,
    properties,
    deals,
    siteVisits,
    followUps,
    completeFollowUp,
    snoozeFollowUp,
    activityLogs,
    subscription,
    users,
  } = useCRMStore();

  const [dateRange, setDateRange] = useState<'30D' | 'ThisMonth' | 'AllTime'>('ThisMonth');

  // Computed Real-time Metrics
  const totalLeads = leads.length;
  const totalSiteVisits = siteVisits.length;
  const activeDeals = deals.filter((d) => d.stage !== 'CLOSED_LOST' && d.stage !== 'CLOSED_WON').length;
  const wonDealsValue = deals
    .filter((d) => d.stage === 'CLOSED_WON')
    .reduce((acc, d) => acc + d.dealValueINR, 0);

  // Revenue Trend Data (Past 6 Months in Lakhs INR)
  const revenueChartData = [
    { month: 'Apr', revenueLakhs: 14.2, leads: 110 },
    { month: 'May', revenueLakhs: 16.8, leads: 145 },
    { month: 'Jun', revenueLakhs: 18.5, leads: 180 },
    { month: 'Jul', revenueLakhs: 21.0, leads: 205 },
    { month: 'Aug', revenueLakhs: 20.4, leads: 220 },
    { month: 'Sep', revenueLakhs: 24.8, leads: 248 },
  ];

  // Lead Source Distribution
  const leadSourceData = [
    { name: 'WhatsApp', value: 38, color: '#10B981' },
    { name: 'Website', value: 28, color: '#F59E0B' },
    { name: 'Referral', value: 16, color: '#3B82F6' },
    { name: 'Meta Ads', value: 12, color: '#8B5CF6' },
    { name: 'Walk-in', value: 6, color: '#EC4899' },
  ];

  // Pipeline Stage Distribution
  const pipelineData = [
    { stage: 'New Lead', count: deals.filter((d) => d.stage === 'NEW_LEAD').length },
    { stage: 'Qualified', count: deals.filter((d) => d.stage === 'QUALIFIED').length },
    { stage: 'Site Visit', count: deals.filter((d) => d.stage === 'SITE_VISIT').length },
    { stage: 'Negotiation', count: deals.filter((d) => d.stage === 'NEGOTIATION').length },
    { stage: 'Documentation', count: deals.filter((d) => d.stage === 'DOCUMENTATION').length },
    { stage: 'Closed Won', count: deals.filter((d) => d.stage === 'CLOSED_WON').length },
  ];

  // Filtered Follow-ups
  const dueTodayFollowUps = followUps.filter((f) => f.status === 'DUE_TODAY' || f.status === 'OVERDUE');
  const upcomingVisits = siteVisits.filter((v) => v.status === 'CONFIRMED' || v.status === 'SCHEDULED').slice(0, 4);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* ========================================== */}
      {/* HEADER SECTION */}
      {/* ========================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Good morning, {currentUser.name} 👋
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Here's what's happening with your real estate business at <strong className="text-zinc-200">{currentOrg.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl flex text-xs">
            <button
              onClick={() => setDateRange('30D')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                dateRange === '30D' ? 'bg-amber-500 text-black font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateRange('ThisMonth')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                dateRange === 'ThisMonth' ? 'bg-amber-500 text-black font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              This Month
            </button>
          </div>

          <Link href="/app/leads">
            <Button variant="gold" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Add Lead
            </Button>
          </Link>
        </div>
      </div>

      {/* ========================================== */}
      {/* 4 PRIMARY EXECUTIVE KPI CARDS */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Leads"
          value="248"
          changePercent={12.4}
          changeLabel="vs last month"
          icon={<Users className="w-5 h-5 text-blue-400" />}
          variant="blue"
        />

        <MetricCard
          title="Site Visits"
          value="42"
          changePercent={8.2}
          changeLabel="confirmed viewings"
          icon={<CalendarCheck className="w-5 h-5 text-purple-400" />}
          variant="purple"
        />

        <MetricCard
          title="Active Deals"
          value="18"
          changePercent={15.1}
          changeLabel="active in pipeline"
          icon={<Kanban className="w-5 h-5 text-amber-400" />}
          variant="gold"
        />

        <MetricCard
          title="Revenue (This Month)"
          value="₹24.8L"
          changePercent={21.3}
          changeLabel="closed commissions"
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
          variant="emerald"
        />
      </div>

      {/* ========================================== */}
      {/* CHARTS ROW: REVENUE TREND & SOURCES */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Performance Chart */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-zinc-950 border border-zinc-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Revenue Analytics & Growth Trend
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Monthly closed revenue performance in Lakhs INR
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Revenue (₹ Lakhs)
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#3f3f46',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`₹${value} Lakhs`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenueLakhs"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#goldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Ingestion Sources Donut */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-zinc-950 border border-zinc-800/90 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="border-b border-zinc-800/80 pb-4">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Lead Channel Breakdown
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Top inquiry generation sources</p>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadSourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {leadSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#3f3f46',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="text-xl font-extrabold text-white">38%</p>
              <p className="text-[10px] text-zinc-400">WhatsApp CRM</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            {leadSourceData.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-zinc-300 font-medium truncate">{s.name}</span>
                <span className="text-zinc-500 ml-auto">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2-COLUMN OPERATIONAL CRM GRID */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Follow-ups & Hot Leads */}
        <div className="lg:col-span-7 space-y-6">
          {/* Actionable Follow-ups */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/90 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Today's High-Priority Follow-ups
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {dueTodayFollowUps.length} follow-ups requiring direct agent action
                  </p>
                </div>
              </div>
              <Link
                href="/app/follow-ups"
                className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {dueTodayFollowUps.map((fu) => (
                <div
                  key={fu.id}
                  className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm truncate">{fu.leadName}</span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          fu.status === 'OVERDUE'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {fu.status === 'OVERDUE' ? '⚠️ Overdue' : '⏰ Due Today'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate">
                      {fu.propertyName || 'Inquiry'} • {fu.notes}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={`tel:${fu.customerPhone}`}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors text-xs flex items-center gap-1"
                      title="Call Client"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-400" />
                    </a>

                    <a
                      href={buildWhatsAppUrl(fu.customerPhone, `Hello ${fu.leadName}, following up on ${fu.propertyName || 'your inquiry'}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors text-xs flex items-center gap-1"
                      title="Send WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>

                    <Button
                      variant="gold"
                      size="xs"
                      onClick={() => completeFollowUp(fu.id)}
                    >
                      Complete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Hot Leads */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/90 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                Recent Verified Buyer Leads
              </h3>
              <Link
                href="/app/leads"
                className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
              >
                All leads <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-zinc-400 border-b border-zinc-800 pb-2">
                    <th className="pb-2 font-semibold">Lead Name</th>
                    <th className="pb-2 font-semibold">Budget</th>
                    <th className="pb-2 font-semibold">Status</th>
                    <th className="pb-2 font-semibold">Score</th>
                    <th className="pb-2 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {leads.slice(0, 5).map((l) => (
                    <tr key={l.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 font-semibold text-white">
                        <Link href="/app/leads" className="hover:text-amber-300">
                          {l.name}
                        </Link>
                        <p className="text-[10px] text-zinc-500 font-normal">{l.phone}</p>
                      </td>
                      <td className="py-3 text-zinc-300 font-medium">
                        {l.budgetMaxINR ? formatINR(l.budgetMaxINR, true) : 'Flexible'}
                      </td>
                      <td className="py-3">
                        <LeadStatusBadge status={l.status} />
                      </td>
                      <td className="py-3">
                        <span className="font-bold text-emerald-400">{l.score}%</span>
                      </td>
                      <td className="py-3 text-right">
                        <a
                          href={buildWhatsAppUrl(l.phone, `Hello ${l.name}, connecting regarding ${l.interestedPropertyName || 'your inquiry'}.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:underline"
                        >
                          <MessageSquare className="w-3 h-3" /> WhatsApp
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Site Visits & Team Leaderboard */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Site Visits */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/90 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Upcoming Site Visits
                  </h3>
                  <p className="text-xs text-zinc-400">Scheduled property walkthroughs</p>
                </div>
              </div>
              <Link
                href="/app/site-visits"
                className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
              >
                Schedule <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingVisits.map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{v.propertyName}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 rounded">
                      {v.timeSlot}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Buyer: <strong className="text-zinc-200">{v.leadName || 'Client'}</strong></span>
                    <span>Date: <strong className="text-zinc-200">{v.visitDate}</strong></span>
                  </div>
                  <p className="text-[11px] text-zinc-500 truncate">
                    Assigned: {v.assignedAgentName} • {v.propertyLocation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Performance Leaderboard */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/90 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Top Sales Consultants
              </h3>
              <span className="text-xs text-zinc-500">September Leaderboard</span>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { name: 'Velvet Code', deals: '₹5.20 Cr', count: '1 Closed', visits: 3, role: 'Owner' },
                { name: 'Karthik Subramanian', deals: '₹2.87 Cr (Pipe)', count: '2 In Neg.', visits: 8, role: 'Manager' },
                { name: 'Ananya Iyer', deals: '₹3.85 Cr (Pipe)', count: '1 Scheduled', visits: 5, role: 'Admin' },
                { name: 'Divya Krishnan', deals: '₹1.76 Cr (Pipe)', count: '2 Qualified', visits: 6, role: 'Agent' },
              ].map((agent, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-850"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px]">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{agent.name}</p>
                      <p className="text-[10px] text-zinc-500">{agent.role} • {agent.visits} visits</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-300">{agent.deals}</p>
                    <p className="text-[10px] text-emerald-400">{agent.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
