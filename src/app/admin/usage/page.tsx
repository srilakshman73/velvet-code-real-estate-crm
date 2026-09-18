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
  { time: '00:00', aiCalls: 0, waMessages: 0 },
  { time: '04:00', aiCalls: 0, waMessages: 0 },
  { time: '08:00', aiCalls: 0, waMessages: 0 },
  { time: '12:00', aiCalls: 0, waMessages: 0 },
  { time: '16:00', aiCalls: 0, waMessages: 0 },
  { time: '20:00', aiCalls: 0, waMessages: 0 },
];

export default function AdminUsagePage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#24211D] tracking-tight">Platform Resource Telemetry</h1>
          <p className="text-sm text-[#766F63] mt-1">
            Global compute metrics for Realty AI token consumption, WhatsApp Meta Cloud throughput, and PostgreSQL multi-tenant storage.
          </p>
        </div>
        <Badge variant="success">All Systems Nominal</Badge>
      </div>

      {/* Top 4 Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card orientation="vertical" className="bg-[#FFFCF6] border-[#DDD4C4] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#766F63] uppercase tracking-wider font-serif">AI Inferences (MTD)</span>
            <Sparkles className="w-4 h-4 text-[#A374]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#24211D] mt-2">0</div>
          <div className="text-xs text-[#8F642B] mt-1 font-medium">0 tokens processed</div>
        </Card>

        <Card orientation="vertical" className="bg-[#FFFCF6] border-[#DDD4C4] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#766F63] uppercase tracking-wider font-serif">WhatsApp Messages Sent</span>
            <MessageSquare className="w-4 h-4 text-[#2E6B4F]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#24211D] mt-2">0</div>
          <div className="text-xs text-[#2E6B4F] mt-1 font-medium">100% delivery reliability</div>
        </Card>

        <Card orientation="vertical" className="bg-[#FFFCF6] border-[#DDD4C4] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#766F63] uppercase tracking-wider font-serif">PostgreSQL DB Size</span>
            <Database className="w-4 h-4 text-[#3B5BDB]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#24211D] mt-2">24 MB</div>
          <div className="text-xs text-[#3B5BDB] mt-1 font-medium">Isolated tenant schema ready</div>
        </Card>

        <Card orientation="vertical" className="bg-[#FFFCF6] border-[#DDD4C4] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#766F63] uppercase tracking-wider font-serif">Average API Latency</span>
            <Zap className="w-4 h-4 text-[#7048E8]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#24211D] mt-2">85 ms</div>
          <div className="text-xs text-[#2E6B4F] mt-1 font-medium">Optimal edge latency</div>
        </Card>
      </div>

      {/* Real-Time Hourly Throughput Chart */}
      <Card orientation="vertical" className="bg-[#FFFCF6] border-[#DDD4C4] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-serif font-bold text-[#24211D]">24-Hour Traffic Throughput</h2>
            <p className="text-xs text-[#766F63]">Realty AI inferences & WhatsApp Cloud API events by time of day</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[#2E6B4F] font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E6B4F]" /> WhatsApp Events
            </span>
            <span className="flex items-center gap-1.5 text-[#8F642B] font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A374]" /> AI Prompts
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={USAGE_TIMELINE}>
              <defs>
                <linearGradient id="waGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E6B4F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2E6B4F" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A374" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#A374" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ECE5D8" />
              <XAxis dataKey="time" stroke="#766F63" fontSize={11} />
              <YAxis stroke="#766F63" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFCF6',
                  borderColor: '#DDD4C4',
                  borderRadius: '8px',
                  color: '#24211D',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(21,21,21,0.08)',
                }}
              />
              <Area
                type="monotone"
                dataKey="waMessages"
                name="WhatsApp"
                stroke="#2E6B4F"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#waGrad)"
              />
              <Area
                type="monotone"
                dataKey="aiCalls"
                name="Realty AI"
                stroke="#A374"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#aiGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top Consuming Tenants */}
      <Card orientation="vertical" className="bg-[#FFFCF6] border-[#DDD4C4] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
        <h2 className="text-base font-serif font-bold text-[#24211D] mb-1">Top Resource Consuming Brokerages</h2>
        <p className="text-xs text-[#766F63] mb-4">Tenants with highest API traffic and token consumption this month</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F3EA] border-b border-[#DDD4C4] text-[#766F63]">
              <tr>
                <th className="py-3 px-4 font-semibold">Brokerage Tenant</th>
                <th className="py-3 px-4 font-semibold">Plan Tier</th>
                <th className="py-3 px-4 font-semibold">AI Inferences</th>
                <th className="py-3 px-4 font-semibold">WhatsApp Volume</th>
                <th className="py-3 px-4 font-semibold">Storage Used</th>
                <th className="py-3 px-4 font-semibold">Quota Usage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD4C4]/60">
              {[
                { name: 'Metropolis Prime Properties', tier: 'BUSINESS', ai: '42,100', wa: '112,000', storage: '2.4 GB', quota: '42%' },
                { name: 'Heritage Luxury Estates', tier: 'BUSINESS', ai: '38,400', wa: '94,500', storage: '1.9 GB', quota: '38%' },
                { name: 'Velvet Realty Solutions', tier: 'PROFESSIONAL', ai: '24,200', wa: '58,000', storage: '840 MB', quota: '80%' },
                { name: 'Kovai Urban Lands', tier: 'PROFESSIONAL', ai: '8,400', wa: '21,000', storage: '410 MB', quota: '28%' },
              ].map((tenant, idx) => (
                <tr key={idx} className="hover:bg-[#F7F3EA]/60 transition-colors">
                  <td className="py-3 px-4 font-medium font-serif text-[#24211D]">{tenant.name}</td>
                  <td className="py-3 px-4">
                    <Badge variant={tenant.tier === 'BUSINESS' ? 'gold' : 'info'}>{tenant.tier}</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#8F642B] font-semibold">{tenant.ai}</td>
                  <td className="py-3 px-4 font-mono text-[#2E6B4F] font-semibold">{tenant.wa}</td>
                  <td className="py-3 px-4 font-mono text-[#766F63]">{tenant.storage}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#24211D]">{tenant.quota}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
