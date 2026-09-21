'use client';

import React, { useState } from 'react';
import {
  Layers,
  Search,
  TrendingUp,
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatINR } from '@/lib/utils';
import { SubscriptionTier, SubscriptionStatus } from '@/types';

interface GlobalSub {
  id: string;
  organizationName: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billingCycle: 'monthly' | 'annual';
  priceINR: number;
  currentPeriodEnd: string;
  paymentMethod: string;
  autoRenew: boolean;
}

const MOCK_SUBS: GlobalSub[] = [
  {
    id: 'sub-apex-01',
    organizationName: 'Velvet Code Realty',
    tier: 'PROFESSIONAL',
    status: 'ACTIVE',
    billingCycle: 'monthly',
    priceINR: 1499,
    currentPeriodEnd: '2026-10-01',
    paymentMethod: 'UPI AutoPay (Razorpay)',
    autoRenew: true,
  },
];

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<GlobalSub[]>(MOCK_SUBS);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  const filteredSubs = subs.filter((s) => {
    const matchesSearch = s.organizationName.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search);
    const matchesTier = tierFilter === 'ALL' || s.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#29251F] tracking-tight">Tenant Subscriptions</h1>
          <p className="text-sm text-[#625B51] mt-1">
            Real-time tracking of Razorpay subscription contracts, renewals, and revenue run-rates.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card orientation="vertical" className="bg-[#FFFDF8] border-[#DDD4C5] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
          <span className="text-xs font-semibold text-[#625B51] uppercase tracking-wider font-serif">Annualized Run Rate (ARR)</span>
          <div className="text-2xl font-serif font-bold text-[#29251F] mt-2">₹0</div>
          <div className="text-xs text-[#3D7258] mt-1 flex items-center gap-1 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" /> Starting Platform Baseline
          </div>
        </Card>

        <Card orientation="vertical" className="bg-[#FFFDF8] border-[#DDD4C5] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
          <span className="text-xs font-semibold text-[#625B51] uppercase tracking-wider font-serif">Active Paid Subscriptions</span>
          <div className="text-2xl font-serif font-bold text-[#29251F] mt-2">{subs.length} Contract</div>
          <div className="text-xs text-[#7A5720] mt-1 font-medium">100% renewal baseline</div>
        </Card>

        <Card orientation="vertical" className="bg-[#FFFDF8] border-[#DDD4C5] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
          <span className="text-xs font-semibold text-[#625B51] uppercase tracking-wider font-serif">Average Revenue Per Tenant (ARPU)</span>
          <div className="text-2xl font-serif font-bold text-[#29251F] mt-2">₹0 / mo</div>
          <div className="text-xs text-[#A87932] mt-1 font-medium">Professional & Business tiers</div>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search subscription by organization or contract ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-[#625B51]" />}
          />
        </div>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="bg-white border border-[#DDD4C5] rounded-lg px-3 py-2 text-xs text-[#29251F] focus:outline-none focus:border-[#A374]"
        >
          <option value="ALL">All Tiers</option>
          <option value="STARTER">Starter Tier</option>
          <option value="PROFESSIONAL">Professional Tier</option>
          <option value="BUSINESS">Business Tier</option>
        </select>
      </div>

      {/* Subscriptions Table */}
      <Card orientation="vertical" className="p-0 overflow-hidden bg-[#FFFDF8] border-[#DDD4C5] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F0E7] border-b border-[#DDD4C5] text-[#625B51]">
              <tr>
                <th className="py-3 px-4 font-semibold">Contract & Organization</th>
                <th className="py-3 px-4 font-semibold">Plan Tier</th>
                <th className="py-3 px-4 font-semibold">Billing Cycle</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Next Renewal</th>
                <th className="py-3 px-4 font-semibold">Payment Gateway</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD4C5]/60">
              {filteredSubs.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#F4F0E7]/60 transition-colors">
                  <td className="py-3 px-4 font-medium text-[#29251F]">
                    <div>
                      <div className="text-sm font-serif font-bold text-[#29251F]">{sub.organizationName}</div>
                      <div className="text-[10px] text-[#625B51] font-mono">{sub.id}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={sub.tier === 'BUSINESS' ? 'gold' : sub.tier === 'PROFESSIONAL' ? 'info' : 'neutral'}>
                      {sub.tier}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 capitalize text-[#625B51]">
                    {sub.billingCycle}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#29251F]">
                    ₹{sub.priceINR.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-[#625B51]">
                    {sub.currentPeriodEnd}
                  </td>
                  <td className="py-3 px-4 text-[#625B51]">
                    {sub.paymentMethod}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={sub.status === 'ACTIVE' ? 'success' : sub.status === 'PAST_DUE' ? 'warning' : 'error'}>
                      {sub.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="xs">
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
