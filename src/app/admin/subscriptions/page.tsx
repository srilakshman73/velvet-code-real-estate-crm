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
    organizationName: 'Velvet Realty Solutions',
    tier: 'PROFESSIONAL',
    status: 'ACTIVE',
    billingCycle: 'monthly',
    priceINR: 1499,
    currentPeriodEnd: '2026-10-01',
    paymentMethod: 'UPI AutoPay (Razorpay)',
    autoRenew: true,
  },
  {
    id: 'sub-heritage-02',
    organizationName: 'Heritage Luxury Estates',
    tier: 'BUSINESS',
    status: 'ACTIVE',
    billingCycle: 'annual',
    priceINR: 38390,
    currentPeriodEnd: '2027-06-15',
    paymentMethod: 'Corporate Credit Card',
    autoRenew: true,
  },
  {
    id: 'sub-metro-03',
    organizationName: 'Metropolis Prime Properties',
    tier: 'BUSINESS',
    status: 'ACTIVE',
    billingCycle: 'annual',
    priceINR: 38390,
    currentPeriodEnd: '2027-05-10',
    paymentMethod: 'NetBanking NACH',
    autoRenew: true,
  },
  {
    id: 'sub-skyline-04',
    organizationName: 'Skyline Realtors & Advisors',
    tier: 'STARTER',
    status: 'ACTIVE',
    billingCycle: 'monthly',
    priceINR: 599,
    currentPeriodEnd: '2026-09-30',
    paymentMethod: 'HDFC Debit Card',
    autoRenew: true,
  },
  {
    id: 'sub-coimbatore-05',
    organizationName: 'Kovai Urban Lands & Villas',
    tier: 'PROFESSIONAL',
    status: 'PAST_DUE',
    billingCycle: 'monthly',
    priceINR: 1499,
    currentPeriodEnd: '2026-09-10',
    paymentMethod: 'ICICI UPI',
    autoRenew: false,
  },
  {
    id: 'sub-coastal-06',
    organizationName: 'Coastal Bay Realty',
    tier: 'STARTER',
    status: 'CANCELED',
    billingCycle: 'monthly',
    priceINR: 599,
    currentPeriodEnd: '2026-09-01',
    paymentMethod: 'Axis Card',
    autoRenew: false,
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
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Tenant Subscriptions</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Real-time tracking of Razorpay subscription contracts, renewals, and revenue run-rates.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card orientation="vertical">
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Annualized Run Rate (ARR)</span>
          <div className="text-2xl font-serif font-bold text-white mt-2">₹1.48 Crore</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% compared to last quarter
          </div>
        </Card>

        <Card orientation="vertical">
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Active Paid Subscriptions</span>
          <div className="text-2xl font-serif font-bold text-white mt-2">864 Contracts</div>
          <div className="text-xs text-amber-300 mt-1">94.8% auto-renewal rate</div>
        </Card>

        <Card orientation="vertical">
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Average Revenue Per Tenant (ARPU)</span>
          <div className="text-2xl font-serif font-bold text-white mt-2">₹1,435 / mo</div>
          <div className="text-xs text-sky-400 mt-1">Driven by Professional tier adoption</div>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search subscription by organization or contract ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-neutral-500" />}
          />
        </div>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-300 focus:outline-none"
        >
          <option value="ALL">All Tiers</option>
          <option value="STARTER">Starter Tier</option>
          <option value="PROFESSIONAL">Professional Tier</option>
          <option value="BUSINESS">Business Tier</option>
        </select>
      </div>

      {/* Subscriptions Table */}
      <Card orientation="vertical" className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400">
              <tr>
                <th className="py-3 px-4 font-medium">Contract & Organization</th>
                <th className="py-3 px-4 font-medium">Plan Tier</th>
                <th className="py-3 px-4 font-medium">Billing Cycle</th>
                <th className="py-3 px-4 font-medium">Amount</th>
                <th className="py-3 px-4 font-medium">Next Renewal</th>
                <th className="py-3 px-4 font-medium">Payment Gateway</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredSubs.map((sub) => (
                <tr key={sub.id} className="hover:bg-neutral-900/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-white">
                    <div>
                      <div className="text-sm font-semibold text-white">{sub.organizationName}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{sub.id}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={sub.tier === 'BUSINESS' ? 'gold' : sub.tier === 'PROFESSIONAL' ? 'info' : 'neutral'}>
                      {sub.tier}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 capitalize text-neutral-300">
                    {sub.billingCycle}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-white">
                    ₹{sub.priceINR.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-neutral-300">
                    {sub.currentPeriodEnd}
                  </td>
                  <td className="py-3 px-4 text-neutral-400">
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
