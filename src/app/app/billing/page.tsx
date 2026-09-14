'use client';

import React, { useState } from 'react';
import { useCRMStore } from '@/lib/store';
import { SAAS_PLANS, INITIAL_INVOICES } from '@/lib/mock-data';
import { SubscriptionTier } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatINR } from '@/lib/utils';
import {
  CreditCard,
  Zap,
  CheckCircle2,
  Download,
  AlertCircle,
  Receipt,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BillingPage() {
  const {
    subscription,
    currentPlanLimits,
    upgradePlan,
    cancelSubscription,
    leads,
    properties,
    users,
  } = useCRMStore();

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(subscription.tier);

  const handleUpgrade = (tier: SubscriptionTier) => {
    upgradePlan(tier);
    setIsUpgradeModalOpen(false);
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#ffffff'],
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-amber-400" />
              Subscription & Workspace Billing
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
              Status: {subscription.status}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage your real estate SaaS plan tier, usage quotas, payment gateway, and invoice receipts.
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={() => setIsUpgradeModalOpen(true)}
          leftIcon={<Zap className="w-4 h-4" />}
        >
          Change Plan / Upgrade
        </Button>
      </div>

      {/* Current Plan Overview Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-amber-500/30 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Active SaaS Plan
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              {currentPlanLimits.name} Plan
            </h2>
            <p className="text-sm text-zinc-300 mt-1">
              ₹{subscription.priceMonthlyINR.toLocaleString('en-IN')}/month • Next renewal on 01 Oct 2026
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="gold"
              size="md"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="font-bold shadow-lg shadow-amber-500/20"
            >
              Upgrade Plan
            </Button>
          </div>
        </div>

        {/* Real-time Usage Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {/* 1. Users */}
          <div className="space-y-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-zinc-400">Agent Seats:</span>
              <span className="text-white font-mono">
                {users.length} / {currentPlanLimits.maxUsers}
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${(users.length / currentPlanLimits.maxUsers) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-500">Enforced on backend</p>
          </div>

          {/* 2. Leads */}
          <div className="space-y-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-zinc-400">Lead Storage:</span>
              <span className="text-white font-mono">
                248 / {currentPlanLimits.maxLeads === -1 ? 'Unlimited' : currentPlanLimits.maxLeads}
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{
                  width: `${Math.min(
                    (248 / (currentPlanLimits.maxLeads === -1 ? 1000 : currentPlanLimits.maxLeads)) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-zinc-500">Active buyer records</p>
          </div>

          {/* 3. Properties */}
          <div className="space-y-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-zinc-400">Property Listings:</span>
              <span className="text-white font-mono">
                {properties.length} /{' '}
                {currentPlanLimits.maxProperties === -1 ? 'Unlimited' : currentPlanLimits.maxProperties}
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full"
                style={{
                  width: `${Math.min(
                    (properties.length /
                      (currentPlanLimits.maxProperties === -1 ? 50 : currentPlanLimits.maxProperties)) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-zinc-500">Live active inventory</p>
          </div>

          {/* 4. AI Inferences */}
          <div className="space-y-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-zinc-400">Realty AI Quota:</span>
              <span className="text-amber-300 font-mono">
                {subscription.usage.aiRequestsUsed} / {currentPlanLimits.monthlyAIQuota}
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{
                  width: `${(subscription.usage.aiRequestsUsed / currentPlanLimits.monthlyAIQuota) * 100}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-zinc-500">Resets on next cycle</p>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Receipt className="w-5 h-5 text-amber-400" />
          Invoice & Payment History
        </h3>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-zinc-900/90 border-b border-zinc-800 text-zinc-400 font-semibold">
                <th className="p-4">Invoice #</th>
                <th className="p-4">Billing Period</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {INITIAL_INVOICES.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="p-4 font-bold text-white font-mono">{inv.invoiceNumber}</td>
                  <td className="p-4 text-zinc-300">Monthly SaaS Subscription</td>
                  <td className="p-4 font-extrabold text-amber-300 font-mono">
                    ₹{inv.totalINR}
                  </td>
                  <td className="p-4 text-zinc-300">{inv.paymentMethod}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-400 rounded">
                      Paid
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => alert(`Downloading Invoice ${inv.invoiceNumber} PDF...`)}
                      className="text-amber-400 hover:underline font-semibold flex items-center gap-1 ml-auto text-xs"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade Modal */}
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Change Subscription Tier"
        description="Select a SaaS plan to expand your user seats, lead capacity, and Realty AI quotas."
        maxWidth="3xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-2">
          {SAAS_PLANS.map((plan) => {
            const isCurrent = plan.tier === subscription.tier;
            return (
              <div
                key={plan.tier}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                  isCurrent
                    ? 'bg-amber-500/10 border-amber-400 shadow-lg'
                    : 'bg-zinc-900/70 border-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-white text-base">{plan.name}</h4>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-500 text-black rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-extrabold text-white mt-2">
                    ₹{plan.priceMonthlyINR}/mo
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-zinc-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>{plan.maxUsers} User Seat(s)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>{plan.maxLeads === -1 ? 'Unlimited' : plan.maxLeads} Leads</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>{plan.monthlyAIQuota} AI Queries</span>
                    </li>
                  </ul>
                </div>

                <Button
                  variant={isCurrent ? 'secondary' : 'gold'}
                  size="sm"
                  disabled={isCurrent}
                  onClick={() => handleUpgrade(plan.tier)}
                  className="w-full font-bold"
                >
                  {isCurrent ? 'Active Plan' : `Switch to ${plan.name}`}
                </Button>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
