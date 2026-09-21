'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCRMStore } from '@/lib/store';
import { MetricCard } from '@/components/ui/MetricCard';
import { LeadStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatINR, buildWhatsAppUrl } from '@/lib/utils';
import {
  Users,
  CalendarCheck,
  Kanban,
  DollarSign,
  TrendingUp,
  PlusCircle,
  MessageSquare,
  Phone,
  Clock,
  ChevronRight,
  Award,
  Building2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function DashboardPage() {
  const {
    currentOrg,
    currentUser,
    users,
    leads,
    deals,
    siteVisits,
    followUps,
    completeFollowUp,
  } = useCRMStore();

  const [dateRange, setDateRange] = useState<'30D' | 'ThisMonth' | 'AllTime'>('ThisMonth');

  // Dynamic Closed Revenue
  const closedWonRevenue = deals
    .filter((d) => d.stage === 'CLOSED_WON')
    .reduce((sum, d) => sum + d.dealValueINR, 0);

  const activePipelineCount = deals.filter(
    (d) => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST'
  ).length;

  // Revenue Trend Data (Clean fallback)
  const revenueChartData = [
    { month: 'Apr', revenueLakhs: 0, leads: 0 },
    { month: 'May', revenueLakhs: 0, leads: 0 },
    { month: 'Jun', revenueLakhs: 0, leads: 0 },
    { month: 'Jul', revenueLakhs: 0, leads: 0 },
    { month: 'Aug', revenueLakhs: 0, leads: 0 },
    { month: 'Sep', revenueLakhs: closedWonRevenue / 100000, leads: leads.length },
  ];

  // Lead Source Distribution (Dynamic or clean default)
  const sourceCounts: { [key: string]: number } = {};
  leads.forEach((l) => {
    sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
  });

  const leadSourceData =
    leads.length > 0
      ? Object.keys(sourceCounts).map((source, idx) => ({
          name: source,
          value: Math.round((sourceCounts[source] / leads.length) * 100),
          color: ['#2F6B52', '#A374', '#171613', '#C9A45C', '#A87932'][idx % 5],
        }))
      : [{ name: 'Direct Inquiries', value: 100, color: '#A374' }];

  // Filtered Follow-ups & Visits
  const dueTodayFollowUps = followUps.filter(
    (f) => f.status === 'DUE_TODAY' || f.status === 'OVERDUE'
  );
  const upcomingVisits = siteVisits
    .filter((v) => v.status === 'CONFIRMED' || v.status === 'SCHEDULED')
    .slice(0, 4);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto bg-[#F4F0E7] text-[#29251F]">
      {/* ========================================== */}
      {/* HEADER SECTION */}
      {/* ========================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#29251F] tracking-tight font-serif">
            Good morning, {currentUser.name} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#625B51] mt-1">
            Here's what's happening with your real estate business at{' '}
            <strong className="text-[#29251F]">{currentOrg.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-[#FFFDF8] border border-[#DDD4C5] p-1 rounded-xl flex text-xs aurum-card-shadow">
            <button
              onClick={() => setDateRange('30D')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                dateRange === '30D' ? 'bg-[#A374] text-[#171613]' : 'text-[#625B51] hover:text-[#29251F]'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateRange('ThisMonth')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                dateRange === 'ThisMonth' ? 'bg-[#A374] text-[#171613]' : 'text-[#625B51] hover:text-[#29251F]'
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
          value={leads.length.toString()}
          changePercent={leads.length > 0 ? 100 : 0}
          changeLabel={leads.length > 0 ? 'active contacts' : 'No leads yet'}
          icon={<Users className="w-5 h-5 text-[#7A5720]" />}
          variant="gold"
        />

        <MetricCard
          title="Site Visits"
          value={siteVisits.length.toString()}
          changePercent={siteVisits.length > 0 ? 100 : 0}
          changeLabel={siteVisits.length > 0 ? 'scheduled viewings' : 'No visits scheduled'}
          icon={<CalendarCheck className="w-5 h-5 text-[#A87932]" />}
          variant="amber"
        />

        <MetricCard
          title="Active Deals"
          value={activePipelineCount.toString()}
          changePercent={activePipelineCount > 0 ? 100 : 0}
          changeLabel={activePipelineCount > 0 ? 'in sales pipeline' : 'No active deals'}
          icon={<Kanban className="w-5 h-5 text-[#171613]" />}
          variant="charcoal"
        />

        <MetricCard
          title="Revenue"
          value={closedWonRevenue > 0 ? formatINR(closedWonRevenue, true) : '₹0'}
          changePercent={closedWonRevenue > 0 ? 100 : 0}
          changeLabel={closedWonRevenue > 0 ? 'closed transactions' : 'No closed deals yet'}
          icon={<DollarSign className="w-5 h-5 text-[#2F6B52]" />}
          variant="emerald"
        />
      </div>

      {/* ========================================== */}
      {/* CHARTS ROW: REVENUE TREND & SOURCES */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Performance Chart */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#FFFDF8] border border-[#DDD4C5] aurum-card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDD4C5] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#29251F] tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#7A5720]" />
                Revenue Analytics & Growth Trend
              </h3>
              <p className="text-xs text-[#625B51] mt-0.5">
                Monthly closed revenue performance in Lakhs INR
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-[#7A5720] font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A374]" /> Revenue (₹ Lakhs)
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A374" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#A374" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECE6DA" vertical={false} />
                <XAxis dataKey="month" stroke="#625B51" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#625B51"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFDF8',
                    borderColor: '#DDD4C5',
                    borderRadius: '0.75rem',
                    color: '#29251F',
                    fontSize: '12px',
                    boxShadow: '0 4px 14px rgba(36,33,29,0.08)',
                  }}
                  formatter={(value: any) => [`₹${value} Lakhs`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenueLakhs"
                  stroke="#A374"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#goldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Ingestion Sources Donut */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#FFFDF8] border border-[#DDD4C5] aurum-card-shadow space-y-4 flex flex-col justify-between">
          <div className="border-b border-[#DDD4C5] pb-4">
            <h3 className="text-base font-bold text-[#29251F] tracking-tight flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#3D7258]" />
              Lead Channel Breakdown
            </h3>
            <p className="text-xs text-[#625B51] mt-0.5">Top inquiry generation sources</p>
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
                    backgroundColor: '#FFFDF8',
                    borderColor: '#DDD4C5',
                    borderRadius: '0.5rem',
                    color: '#29251F',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="text-xl font-extrabold text-[#29251F]">
                {leads.length > 0 ? `${leads.length}` : '0'}
              </p>
              <p className="text-[10px] text-[#625B51] font-semibold">Total Leads</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            {leadSourceData.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[#29251F] font-medium truncate">{s.name}</span>
                <span className="text-[#625B51] ml-auto font-bold">{s.value}%</span>
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
          <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#DDD4C5] aurum-card-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-[#DDD4C5] pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#F4F0E7] text-[#7A5720] border border-[#DDD4C5]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#29251F] tracking-tight">
                    Today's High-Priority Follow-ups
                  </h3>
                  <p className="text-xs text-[#625B51]">
                    {dueTodayFollowUps.length} follow-ups requiring direct agent action
                  </p>
                </div>
              </div>
              <Link
                href="/app/follow-ups"
                className="text-xs font-bold text-[#7A5720] hover:underline flex items-center gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {dueTodayFollowUps.length === 0 ? (
              <EmptyState
                icon={<Clock className="w-6 h-6 text-[#7A5720]" />}
                title="No follow-ups due today"
                description="You are completely up to date. Schedule follow-ups with your leads to stay on top of client conversations."
              />
            ) : (
              <div className="space-y-3">
                {dueTodayFollowUps.map((fu) => (
                  <div
                    key={fu.id}
                    className="p-4 rounded-xl bg-[#FFFDF8] border border-[#DDD4C5] hover:border-[#A374]/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#29251F] text-sm truncate">{fu.leadName}</span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            fu.status === 'OVERDUE'
                              ? 'bg-[#8B4A4A]/15 text-[#8B4A4A]'
                              : 'bg-[#B87B28]/15 text-[#8A5612]'
                          }`}
                        >
                          {fu.status === 'OVERDUE' ? '⚠️ Overdue' : '⏰ Due Today'}
                        </span>
                      </div>
                      <p className="text-xs text-[#625B51] truncate">
                        {fu.propertyName || 'Inquiry'} • {fu.notes}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={`tel:${fu.customerPhone}`}
                        className="p-2 rounded-xl bg-[#F4F0E7] hover:bg-[#ECE6DA] text-[#29251F] transition-colors text-xs flex items-center gap-1 border border-[#DDD4C5]"
                        title="Call Client"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#A87932]" />
                      </a>

                      <a
                        href={buildWhatsAppUrl(fu.customerPhone, `Hello ${fu.leadName}, following up on ${fu.propertyName || 'your inquiry'}.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-[#3D7258]/10 hover:bg-[#3D7258]/20 text-[#3D7258] border border-[#3D7258]/30 transition-colors text-xs flex items-center gap-1"
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
            )}
          </div>

          {/* Recent Hot Leads */}
          <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#DDD4C5] aurum-card-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-[#DDD4C5] pb-4">
              <h3 className="text-base font-bold text-[#29251F] tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-[#7A5720]" />
                Recent Verified Buyer Leads
              </h3>
              <Link
                href="/app/leads"
                className="text-xs font-bold text-[#7A5720] hover:underline flex items-center gap-1"
              >
                All leads <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {leads.length === 0 ? (
              <EmptyState
                icon={<Users className="w-6 h-6 text-[#7A5720]" />}
                title="No leads yet"
                description="Start by adding your first buyer lead or capture direct inquiries from your WhatsApp CRM and landing page."
                actionLabel="Add First Lead"
                onAction={() => (window.location.href = '/app/leads')}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[#625B51] border-b border-[#DDD4C5] pb-2 font-bold">
                      <th className="pb-2">Lead Name</th>
                      <th className="pb-2">Budget</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Score</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDD4C5]/60">
                    {leads.slice(0, 5).map((l) => (
                      <tr key={l.id} className="hover:bg-[#ECE6DA]/40 transition-colors">
                        <td className="py-3 font-bold text-[#29251F]">
                          <Link href="/app/leads" className="hover:text-[#7A5720]">
                            {l.name}
                          </Link>
                          <p className="text-[10px] text-[#625B51] font-normal">{l.phone}</p>
                        </td>
                        <td className="py-3 text-[#29251F] font-bold font-mono">
                          {l.budgetMaxINR ? formatINR(l.budgetMaxINR, true) : 'Flexible'}
                        </td>
                        <td className="py-3">
                          <LeadStatusBadge status={l.status} />
                        </td>
                        <td className="py-3">
                          <span className="font-extrabold text-[#3D7258]">{l.score}%</span>
                        </td>
                        <td className="py-3 text-right">
                          <a
                            href={buildWhatsAppUrl(l.phone, `Hello ${l.name}, connecting regarding ${l.interestedPropertyName || 'your inquiry'}.`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3D7258] hover:underline"
                          >
                            <MessageSquare className="w-3 h-3" /> WhatsApp
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Site Visits & Team Leaderboard */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Site Visits */}
          <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#DDD4C5] aurum-card-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-[#DDD4C5] pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#F4F0E7] text-[#A87932] border border-[#DDD4C5]">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#29251F] tracking-tight">
                    Upcoming Site Visits
                  </h3>
                  <p className="text-xs text-[#625B51]">Scheduled property walkthroughs</p>
                </div>
              </div>
              <Link
                href="/app/site-visits"
                className="text-xs font-bold text-[#7A5720] hover:underline flex items-center gap-1"
              >
                Schedule <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingVisits.length === 0 ? (
              <EmptyState
                icon={<CalendarCheck className="w-6 h-6 text-[#A87932]" />}
                title="No site visits scheduled"
                description="Coordinate private viewings with prospective buyers to track site visits and feedback."
              />
            ) : (
              <div className="space-y-3">
                {upcomingVisits.map((v) => (
                  <div
                    key={v.id}
                    className="p-3.5 rounded-xl bg-[#F4F0E7] border border-[#DDD4C5] space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#29251F]">{v.propertyName}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#A87932]/15 text-[#7A5720] rounded">
                        {v.timeSlot}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#625B51]">
                      <span>Buyer: <strong className="text-[#29251F]">{v.leadName || 'Client'}</strong></span>
                      <span>Date: <strong className="text-[#29251F]">{v.visitDate}</strong></span>
                    </div>
                    <p className="text-[11px] text-[#625B51] truncate">
                      Assigned: {v.assignedAgentName || currentUser.name} • {v.propertyLocation || 'Venue'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Team Performance Overview */}
          <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#DDD4C5] aurum-card-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-[#DDD4C5] pb-4">
              <h3 className="text-base font-bold text-[#29251F] tracking-tight flex items-center gap-2">
                <Award className="w-4 h-4 text-[#7A5720]" />
                Sales Consultants
              </h3>
              <span className="text-xs text-[#625B51] font-medium">Team Overview</span>
            </div>

            <div className="space-y-3 text-xs">
              {users.map((u, i) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F4F0E7] border border-[#DDD4C5]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#A374]/25 text-[#7A5720] font-bold flex items-center justify-center text-[10px]">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-bold text-[#29251F]">{u.name}</p>
                      <p className="text-[10px] text-[#625B51]">{u.role} • {u.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#7A5720] font-mono">
                      {closedWonRevenue > 0 ? formatINR(closedWonRevenue, true) : '₹0'}
                    </p>
                    <p className="text-[10px] text-[#3D7258] font-bold">Active</p>
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
