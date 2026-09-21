'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Building,
  Users,
  CreditCard,
  Cpu,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ExternalLink,
  Layers,
  ChevronRight,
  Activity,
  CheckCircle2,
  Clock,
  Server,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/utils';
import { SAAS_ADMIN_STATS, INITIAL_ORGANIZATIONS } from '@/lib/mock-data';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const MRR_HISTORY = [
  { month: 'Apr', mrr: 0, newOrgs: 0 },
  { month: 'May', mrr: 0, newOrgs: 0 },
  { month: 'Jun', mrr: 0, newOrgs: 0 },
  { month: 'Jul', mrr: 0, newOrgs: 0 },
  { month: 'Aug', mrr: 0, newOrgs: 0 },
  { month: 'Sep', mrr: 0, newOrgs: 1 },
];

const TIER_DISTRIBUTION = [
  { name: 'Starter (₹499)', value: 0, color: '#D8C7A5' },
  { name: 'Professional (₹1,499)', value: 1, color: '#A374' },
  { name: 'Business (₹3,999)', value: 0, color: '#E8DED0' },
];

export default function AdminDashboardPage() {
  const stats = SAAS_ADMIN_STATS;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-serif font-bold text-[#29251F] tracking-tight">SaaS Master Control</h1>
            <Badge variant="gold">Root Admin</Badge>
          </div>
          <p className="text-sm text-[#625B51] mt-1">
            Global metrics, tenant health, financial throughput, and multi-tenant infrastructure status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/organizations">
            <Button variant="secondary" size="sm" icon={<Building className="w-4 h-4" />}>
              Manage Tenants
            </Button>
          </Link>
          <Link href="/admin/plans">
            <Button variant="gold" size="sm" icon={<CreditCard className="w-4 h-4" />}>
              Edit Pricing Plans
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 4 Primary SaaS Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card orientation="vertical" className="bg-[#FFFDF8] border-[#DDD4C5] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#756D61] uppercase tracking-wider font-serif">Monthly Recurring Revenue</span>
            <div className="p-2 rounded-lg bg-[#3D7258]/10 text-[#3D7258] border border-[#3D7258]/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif font-bold text-[#29251F]">{formatINR(stats.monthlyRecurringRevenueINR)}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#3D7258] font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Starting Platform Baseline</span>
            </div>
          </div>
        </Card>

        <Card orientation="vertical" className="bg-[#FFFDF8] border-[#DDD4C5] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#756D61] uppercase tracking-wider font-serif">Active Organizations</span>
            <div className="p-2 rounded-lg bg-[#A374]/15 text-[#7A5720] border border-[#A374]/30">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif font-bold text-[#29251F]">{stats.totalOrganizations.toLocaleString()}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#7A5720] font-semibold">
              <span>+{stats.newCustomersThisMonth} registered tenant</span>
            </div>
          </div>
        </Card>

        <Card orientation="vertical" className="bg-[#FFFDF8] border-[#DDD4C5] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#756D61] uppercase tracking-wider font-serif">Total Active Agents</span>
            <div className="p-2 rounded-lg bg-[#29251F]/10 text-[#29251F] border border-[#DDD4C5]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif font-bold text-[#29251F]">{stats.totalActiveUsers.toLocaleString()}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#857C6E]">
              <span>Master platform owner active</span>
            </div>
          </div>
        </Card>

        <Card orientation="vertical" className="bg-[#FFFDF8] border-[#DDD4C5] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#756D61] uppercase tracking-wider font-serif">Revenue Churn Rate</span>
            <div className="p-2 rounded-lg bg-[#A87932]/10 text-[#A87932] border border-[#A87932]/25">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-serif font-bold text-[#29251F]">{stats.churnRatePercent}%</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#3D7258] font-semibold">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>-0.4% lower than SaaS benchmark</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#FFFDF8] border border-[#DDD4C5] text-xs shadow-2xs">
        <div>
          <span className="text-[#857C6E]">Total Leads Managed:</span>
          <div className="text-base font-bold text-[#29251F] font-mono mt-0.5">{stats.totalLeadsManaged.toLocaleString()}</div>
        </div>
        <div>
          <span className="text-[#857C6E]">Properties Inventory:</span>
          <div className="text-base font-bold text-[#29251F] font-mono mt-0.5">{stats.totalPropertiesListed.toLocaleString()} units</div>
        </div>
        <div>
          <span className="text-[#857C6E]">Realty AI Inferences:</span>
          <div className="text-base font-bold text-[#7A5720] font-mono mt-0.5">{stats.aiRequestsProcessed.toLocaleString()}</div>
        </div>
        <div>
          <span className="text-[#857C6E]">WhatsApp Messages:</span>
          <div className="text-base font-bold text-[#3D7258] font-mono mt-0.5">{stats.whatsappMessagesSent.toLocaleString()}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MRR Growth Chart */}
        <Card orientation="vertical" className="lg:col-span-2 bg-[#FFFDF8] border-[#DDD4C5] shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-serif font-bold text-[#29251F]">MRR Growth Trajectory (INR)</h2>
              <p className="text-xs text-[#857C6E]">Last 6 months revenue performance across subscription plans</p>
            </div>
            <Badge variant="success">+72.2% H1 Growth</Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MRR_HISTORY}>
                <defs>
                  <linearGradient id="adminMrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A374" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#A374" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D3" />
                <XAxis dataKey="month" stroke="#857C6E" fontSize={11} />
                <YAxis
                  stroke="#857C6E"
                  fontSize={11}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFDF8',
                    borderColor: '#DDD4C5',
                    borderRadius: '8px',
                    color: '#29251F',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(90,70,40,0.08)',
                  }}
                  formatter={(val: any) => [formatINR(val), 'MRR']}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="#A374"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#adminMrrGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Plan Tier Distribution */}
        <Card orientation="vertical" className="bg-[#FFFDF8] border-[#DDD4C5] shadow-2xs">
          <h2 className="text-base font-serif font-bold text-[#29251F] mb-1">Paid Tier Distribution</h2>
          <p className="text-xs text-[#857C6E] mb-4">864 Active Paying Tenants</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={TIER_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {TIER_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFDF8',
                    borderColor: '#DDD4C5',
                    borderRadius: '8px',
                    color: '#29251F',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(90,70,40,0.08)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2 pt-2 border-t border-[#DDD4C5] text-xs">
            {TIER_DISTRIBUTION.map((tier, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tier.color }} />
                  <span className="text-[#625B51]">{tier.name}</span>
                </div>
                <span className="font-mono text-[#29251F] font-bold">{tier.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* System Infrastructure Health & Recent Organizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tenants Table */}
        <Card orientation="vertical" className="lg:col-span-2 bg-[#FFFDF8] border-[#DDD4C5] shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-serif font-bold text-[#29251F]">Recent Tenant Registrations</h2>
              <p className="text-xs text-[#857C6E]">Newly onboarded real estate brokerages and consultants</p>
            </div>
            <Link href="/admin/organizations" className="text-xs text-[#7A5720] hover:underline font-semibold">
              View All 1,248 &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DDD4C5] text-[#857C6E]">
                  <th className="pb-3 font-semibold">Organization</th>
                  <th className="pb-3 font-semibold">City</th>
                  <th className="pb-3 font-semibold">Plan</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD4C5]/60">
                {INITIAL_ORGANIZATIONS.map((org) => (
                  <tr key={org.id} className="hover:bg-[#F4EFE6] transition-colors">
                    <td className="py-3 font-medium text-[#29251F]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[#A374]/15 text-[#7A5720] font-serif flex items-center justify-center font-bold text-[10px] border border-[#A374]/30">
                          {org.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-serif font-bold text-[#29251F]">{org.name}</div>
                          <div className="text-[10px] text-[#857C6E]">{org.businessType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-[#625B51]">{org.city || 'Chennai'}</td>
                    <td className="py-3">
                      <Badge variant="gold">PROFESSIONAL</Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant="success">Active</Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Link href={`/admin/organizations`}>
                        <Button variant="ghost" size="xs">
                          Inspect
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Global SaaS Infrastructure Health */}
        <Card orientation="vertical" className="bg-[#FFFDF8] border-[#DDD4C5] shadow-2xs">
          <h2 className="text-base font-serif font-bold text-[#29251F] mb-1">Infrastructure Status</h2>
          <p className="text-xs text-[#857C6E] mb-4">Multi-Tenant Services SLA 99.98%</p>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FFFDF8] border border-[#DDD4C5]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3D7258]" />
                <span className="text-[#29251F] font-medium">PostgreSQL Multi-Tenant DB</span>
              </div>
              <span className="text-[#3D7258] font-mono font-bold">14ms ping</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FFFDF8] border border-[#DDD4C5]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3D7258]" />
                <span className="text-[#29251F] font-medium">Meta WhatsApp Cloud Gateway</span>
              </div>
              <span className="text-[#3D7258] font-mono font-bold">100% Up</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FFFDF8] border border-[#DDD4C5]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3D7258]" />
                <span className="text-[#29251F] font-medium">Google Gemini 1.5 Pro AI API</span>
              </div>
              <span className="text-[#3D7258] font-mono font-bold">240ms Latency</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FFFDF8] border border-[#DDD4C5]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3D7258]" />
                <span className="text-[#29251F] font-medium">Razorpay Webhooks Listener</span>
              </div>
              <span className="text-[#3D7258] font-mono font-bold">0 queued</span>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#DDD4C5]">
            <div className="flex items-center justify-between text-xs text-[#857C6E]">
              <span>Platform Version:</span>
              <span className="font-mono text-[#7A5720] font-bold">v2.4.0-production</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
