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
        colors: ['#A374', '#3D7258', '#29251F'],
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
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#29251F] tracking-tight flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-[#A374]" />
              Subscription & Workspace Billing
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-[#3D7258]/10 text-[#3D7258] border border-[#3D7258]/20 rounded-full">
              Status: {subscription.status}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#625B51] mt-1">
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
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFDF8] border border-[#D4C9B9] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4C9B9] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#805B25] font-serif">
              Active SaaS Plan
            </span>
            <h2 className="text-3xl font-serif font-bold text-[#29251F] mt-1">
              {currentPlanLimits.name} Plan
            </h2>
            <p className="text-sm text-[#625B51] mt-1">
              ₹{subscription.priceMonthlyINR.toLocaleString('en-IN')}/month • Next renewal on 01 Oct 2026
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="gold"
              size="md"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="font-bold shadow-md"
            >
              Upgrade Plan
            </Button>
          </div>
        </div>

        {/* Real-time Usage Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {/* 1. Users */}
          <div className="space-y-2 p-4 rounded-xl bg-white border border-[#D4C9B9] shadow-2xs">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#625B51]">Agent Seats:</span>
              <span className="text-[#29251F] font-mono">
                {users.length} / {currentPlanLimits.maxUsers}
              </span>
            </div>
            <div className="w-full h-2 bg-[#E8E1D5] rounded-full overflow-hidden border border-[#D4C9B9]/50">
              <div
                className="h-full bg-[#A374] rounded-full"
                style={{ width: `${(users.length / currentPlanLimits.maxUsers) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-[#625B51]">Enforced on backend</p>
          </div>

          {/* 2. Leads */}
          <div className="space-y-2 p-4 rounded-xl bg-white border border-[#D4C9B9] shadow-2xs">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#625B51]">Lead Storage:</span>
              <span className="text-[#29251F] font-mono">
                248 / {currentPlanLimits.maxLeads === -1 ? 'Unlimited' : currentPlanLimits.maxLeads}
              </span>
            </div>
            <div className="w-full h-2 bg-[#E8E1D5] rounded-full overflow-hidden border border-[#D4C9B9]/50">
              <div
                className="h-full bg-[#3D7258] rounded-full"
                style={{
                  width: `${Math.min(
                    (248 / (currentPlanLimits.maxLeads === -1 ? 1000 : currentPlanLimits.maxLeads)) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-[#625B51]">Active buyer records</p>
          </div>

          {/* 3. Properties */}
          <div className="space-y-2 p-4 rounded-xl bg-white border border-[#D4C9B9] shadow-2xs">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#625B51]">Property Listings:</span>
              <span className="text-[#29251F] font-mono">
                {properties.length} /{' '}
                {currentPlanLimits.maxProperties === -1 ? 'Unlimited' : currentPlanLimits.maxProperties}
              </span>
            </div>
            <div className="w-full h-2 bg-[#E8E1D5] rounded-full overflow-hidden border border-[#D4C9B9]/50">
              <div
                className="h-full bg-[#A87932] rounded-full"
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
            <p className="text-[10px] text-[#625B51]">Live active inventory</p>
          </div>

          {/* 4. AI Inferences */}
          <div className="space-y-2 p-4 rounded-xl bg-white border border-[#D4C9B9] shadow-2xs">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#625B51]">Realty AI Quota:</span>
              <span className="text-[#805B25] font-mono">
                {subscription.usage.aiRequestsUsed} / {currentPlanLimits.monthlyAIQuota}
              </span>
            </div>
            <div className="w-full h-2 bg-[#E8E1D5] rounded-full overflow-hidden border border-[#D4C9B9]/50">
              <div
                className="h-full bg-[#A374] rounded-full"
                style={{
                  width: `${(subscription.usage.aiRequestsUsed / currentPlanLimits.monthlyAIQuota) * 100}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-[#625B51]">Resets on next cycle</p>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif font-bold text-[#29251F] tracking-tight flex items-center gap-2">
          <Receipt className="w-5 h-5 text-[#A374]" />
          Invoice & Payment History
        </h3>

        <div className="rounded-2xl border border-[#D4C9B9] bg-[#FFFDF8] overflow-hidden shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#E8E1D5] border-b border-[#D4C9B9] text-[#625B51] font-semibold">
                <th className="p-4">Invoice #</th>
                <th className="p-4">Billing Period</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4C9B9]/60">
              {INITIAL_INVOICES.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#E8E1D5]/60 transition-colors">
                  <td className="p-4 font-bold text-[#29251F] font-mono">{inv.invoiceNumber}</td>
                  <td className="p-4 text-[#625B51]">Monthly SaaS Subscription</td>
                  <td className="p-4 font-extrabold text-[#805B25] font-mono">
                    ₹{inv.totalINR}
                  </td>
                  <td className="p-4 text-[#625B51]">{inv.paymentMethod}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-[#3D7258]/10 text-[#3D7258] rounded border border-[#3D7258]/20">
                      Paid
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => alert(`Downloading Invoice ${inv.invoiceNumber} PDF...`)}
                      className="text-[#805B25] hover:underline font-semibold flex items-center gap-1 ml-auto text-xs"
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
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                  isCurrent
                    ? 'bg-[#A374]/10 border-[#A374] shadow-md'
                    : 'bg-white border-[#D4C9B9]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-serif font-bold text-[#29251F] text-base">{plan.name}</h4>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-[#A374] text-white rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-serif font-extrabold text-[#29251F] mt-2">
                    ₹{plan.priceMonthlyINR}/mo
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-[#625B51]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#A374]" />
                      <span>{plan.maxUsers} User Seat(s)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#A374]" />
                      <span>{plan.maxLeads === -1 ? 'Unlimited' : plan.maxLeads} Leads</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#A374]" />
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
