'use client';

import React from 'react';
import {
  Cpu,
  MessageSquare,
  Database,
  HardDrive,
  TrendingUp,
  Activity,
  Zap,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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
} from 'recharts';

const USAGE_TIMELINE = [
  { time: '00:00', aiCalls: 1200, waMessages: 4100 },
  { time: '04:00', aiCalls: 450, waMessages: 1200 },
  { time: '08:00', aiCalls: 5400, waMessages: 18200 },
  { time: '12:00', aiCalls: 9800, waMessages: 34100 },
  { time: '16:00', aiCalls: 12400, waMessages: 42000 },
  { time: '20:00', aiCalls: 7600, waMessages: 26500 },
];

export default function AdminUsagePage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Platform Resource Telemetry</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Global compute metrics for Realty AI token consumption, WhatsApp Meta Cloud throughput, and PostgreSQL multi-tenant storage.
          </p>
        </div>
        <Badge variant="success">All Systems Nominal</Badge>
      </div>

      {/* Top 4 Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card orientation="vertical">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">AI Inferences (MTD)</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-white mt-2">184,500</div>
          <div className="text-xs text-amber-300 mt-1">214M tokens processed</div>
        </Card>

        <Card orientation="vertical">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">WhatsApp Messages Sent</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-white mt-2">432,000</div>
          <div className="text-xs text-emerald-400 mt-1">99.6% delivery success rate</div>
        </Card>

        <Card orientation="vertical">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">PostgreSQL DB Size</span>
            <Database className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-white mt-2">18.4 GB</div>
          <div className="text-xs text-sky-400 mt-1">1,248 isolated tenant schemas</div>
        </Card>

        <Card orientation="vertical">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Average API Latency</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-white mt-2">142 ms</div>
          <div className="text-xs text-emerald-400 mt-1">Under 200ms target SLA</div>
        </Card>
      </div>

      {/* Real-Time Hourly Throughput Chart */}
      <Card orientation="vertical">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">24-Hour Traffic Throughput</h2>
            <p className="text-xs text-neutral-400">Realty AI inferences & WhatsApp Cloud API events by time of day</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> WhatsApp Events
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> AI Prompts
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={USAGE_TIMELINE}>
              <defs>
                <linearGradient id="waGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="time" stroke="#737373" fontSize={11} />
              <YAxis stroke="#737373" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#171717',
                  borderColor: '#404040',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="waMessages"
                name="WhatsApp"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#waGrad)"
              />
              <Area
                type="monotone"
                dataKey="aiCalls"
                name="Realty AI"
                stroke="#F59E0B"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#aiGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top Consuming Tenants */}
      <Card orientation="vertical">
        <h2 className="text-base font-semibold text-white mb-1">Top Resource Consuming Brokerages</h2>
        <p className="text-xs text-neutral-400 mb-4">Tenants with highest API traffic and token consumption this month</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-800 text-neutral-400">
              <tr>
                <th className="pb-3 font-medium">Brokerage Tenant</th>
                <th className="pb-3 font-medium">Plan Tier</th>
                <th className="pb-3 font-medium">AI Inferences</th>
                <th className="pb-3 font-medium">WhatsApp Volume</th>
                <th className="pb-3 font-medium">Storage Used</th>
                <th className="pb-3 font-medium">Quota Usage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {[
                { name: 'Metropolis Prime Properties', tier: 'BUSINESS', ai: '42,100', wa: '112,000', storage: '2.4 GB', quota: '42%' },
                { name: 'Heritage Luxury Estates', tier: 'BUSINESS', ai: '38,400', wa: '94,500', storage: '1.9 GB', quota: '38%' },
                { name: 'Velvet Realty Solutions', tier: 'PROFESSIONAL', ai: '24,200', wa: '58,000', storage: '840 MB', quota: '80%' },
                { name: 'Kovai Urban Lands', tier: 'PROFESSIONAL', ai: '8,400', wa: '21,000', storage: '410 MB', quota: '28%' },
              ].map((tenant, idx) => (
                <tr key={idx} className="hover:bg-neutral-900/40">
                  <td className="py-3 font-medium text-white">{tenant.name}</td>
                  <td className="py-3">
                    <Badge variant={tenant.tier === 'BUSINESS' ? 'gold' : 'info'}>{tenant.tier}</Badge>
                  </td>
                  <td className="py-3 font-mono text-amber-300">{tenant.ai}</td>
                  <td className="py-3 font-mono text-emerald-400">{tenant.wa}</td>
                  <td className="py-3 font-mono text-neutral-300">{tenant.storage}</td>
                  <td className="py-3 font-mono font-semibold text-white">{tenant.quota}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
