'use client';

import React, { useState, useEffect } from 'react';
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
  Shield,
  ExternalLink,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatINR } from '@/lib/utils';
import { SubscriptionTier, SubscriptionStatus } from '@/types';

interface ExtendedSub {
  id: string;
  organizationId: string;
  organizationName: string;
  customerName: string;
  customerEmail: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billingCycle: string;
  priceMonthlyINR: number;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  razorpaySubscriptionId?: string;
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<ExtendedSub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/subscriptions');
      if (res.ok) {
        const data = await res.json();
        setSubs(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const filteredSubs = subs.filter((s) => {
    const matchesSearch =
      s.organizationName.toLowerCase().includes(search.toLowerCase()) ||
      s.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      (s.razorpaySubscriptionId && s.razorpaySubscriptionId.toLowerCase().includes(search.toLowerCase())) ||
      s.id.includes(search);
    const matchesTier = tierFilter === 'ALL' || s.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const activeCount = subs.filter((s) => s.status === 'ACTIVE').length;
  const mrr = subs
    .filter((s) => s.status === 'ACTIVE')
    .reduce((acc, curr) => acc + (curr.priceMonthlyINR || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2C241A] tracking-tight">Tenant Subscriptions</h1>
          <p className="text-sm text-[#6A5A44] mt-1">
            Real-time tracking of Razorpay subscription contracts, renewals, and revenue run-rates.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchSubscriptions}
          icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Refresh Live Data
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card orientation="vertical" className="bg-[#FFF9F0] border-[#D8C7A5] shadow-2xs">
          <span className="text-xs font-semibold text-[#6A5A44] uppercase tracking-wider font-serif">Annualized Run Rate (ARR)</span>
          <div className="text-2xl font-serif font-bold text-[#2C241A] mt-2">₹{(mrr * 12).toLocaleString('en-IN')}</div>
          <div className="text-xs text-[#547A61] mt-1 flex items-center gap-1 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" /> Live active run-rate
          </div>
        </Card>

        <Card orientation="vertical" className="bg-[#FFF9F0] border-[#D8C7A5] shadow-2xs">
          <span className="text-xs font-semibold text-[#6A5A44] uppercase tracking-wider font-serif">Active Paid Subscriptions</span>
          <div className="text-2xl font-serif font-bold text-[#2C241A] mt-2">{activeCount} Contract{activeCount === 1 ? '' : 's'}</div>
          <div className="text-xs text-[#7A5520] mt-1 font-medium">{subs.length} total tenant subscriptions</div>
        </Card>

        <Card orientation="vertical" className="bg-[#FFF9F0] border-[#D8C7A5] shadow-2xs">
          <span className="text-xs font-semibold text-[#6A5A44] uppercase tracking-wider font-serif">Monthly Recurring Revenue (MRR)</span>
          <div className="text-2xl font-serif font-bold text-[#7A5520] mt-2">₹{mrr.toLocaleString('en-IN')} / mo</div>
          <div className="text-xs text-[#8A7A63] mt-1 font-medium">Starter, Pro & Business tiers</div>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by organization, customer email, or Razorpay subscription ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-[#6A5A44]" />}
          />
        </div>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="bg-[#FFF9F0] border border-[#D8C7A5] rounded-lg px-3 py-2 text-xs text-[#2C241A] focus:outline-none focus:border-[#A37432]"
        >
          <option value="ALL">All Tiers</option>
          <option value="STARTER">Starter Tier (₹1,999)</option>
          <option value="PROFESSIONAL">Professional Tier (₹5,999)</option>
          <option value="BUSINESS">Business Tier (₹9,999)</option>
        </select>
      </div>

      {/* Subscriptions Table */}
      <Card orientation="vertical" className="p-0 overflow-hidden bg-[#FFF9F0] border-[#D8C7A5] shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4EAD7] border-b border-[#D8C7A5] text-[#6A5A44]">
              <tr>
                <th className="py-3 px-4 font-semibold">Tenant & Customer</th>
                <th className="py-3 px-4 font-semibold">Plan Tier</th>
                <th className="py-3 px-4 font-semibold">Razorpay Sub ID</th>
                <th className="py-3 px-4 font-semibold">Monthly Amount</th>
                <th className="py-3 px-4 font-semibold">Billing Period</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8C7A5]/60">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6A5A44]">
                    <Layers className="w-8 h-8 text-[#D8C7A5] mx-auto mb-2" />
                    <p className="font-serif font-bold text-sm text-[#2C241A]">No active customer subscriptions</p>
                    <p className="text-xs">When customers subscribe in Razorpay, their live contract details will appear here.</p>
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#F7EEDC] transition-colors">
                    <td className="py-3 px-4 font-medium text-[#2C241A]">
                      <div>
                        <div className="text-sm font-serif font-bold text-[#2C241A]">{sub.organizationName}</div>
                        <div className="text-[11px] text-[#6A5A44]">{sub.customerEmail}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={sub.tier === 'BUSINESS' ? 'gold' : sub.tier === 'PROFESSIONAL' ? 'info' : 'neutral'}>
                        {sub.tier}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#2C241A]">
                      {sub.razorpaySubscriptionId || (
                        <span className="text-[#8A7A63] text-[10px]">TRIAL_MODE</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#7A5520]">
                      ₹{sub.priceMonthlyINR?.toLocaleString('en-IN') || 1999}/mo
                    </td>
                    <td className="py-3 px-4 text-[#6A5A44]">
                      {sub.currentPeriodEnd
                        ? new Date(sub.currentPeriodEnd).toLocaleDateString('en-IN')
                        : '14-day trial'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          sub.status === 'ACTIVE'
                            ? 'success'
                            : sub.status === 'TRIALING'
                            ? 'info'
                            : sub.status === 'PAST_DUE'
                            ? 'warning'
                            : 'error'
                        }
                      >
                        {sub.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
