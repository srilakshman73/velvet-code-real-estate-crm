'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Sliders,
  Edit2,
  Save,
  Users,
  MessageSquare,
  Building,
  Shield,
  Bot,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SAAS_PLANS } from '@/lib/mock-data';
import { PlanLimits } from '@/types';
import { formatINR } from '@/lib/utils';

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanLimits[]>(SAAS_PLANS);
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  const handleSave = () => {
    setEditingTier(null);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight">SaaS Subscription Plans</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Configure pricing tiers, resource limits (Seats, Leads, Properties, AI Tokens), and feature entitlements.
          </p>
        </div>
        {saveToast && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs">
            <CheckCircle2 className="w-4 h-4" />
            Plan configuration saved
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isEditing = editingTier === plan.tier;
          const isPopular = plan.tier === 'PROFESSIONAL';

          return (
            <Card
              key={plan.tier}
              orientation="vertical"
              className={`relative flex flex-col justify-between ${
                isPopular ? 'border-amber-500/50 shadow-lg shadow-amber-500/5' : ''
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-bold text-[10px] uppercase tracking-wider">
                  Top Seller Tier
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-neutral-400 font-mono">TIER: {plan.tier}</p>
                  </div>
                  <Badge variant={plan.tier === 'BUSINESS' ? 'gold' : plan.tier === 'PROFESSIONAL' ? 'info' : 'neutral'}>
                    {plan.tier}
                  </Badge>
                </div>

                {/* Pricing Block */}
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 mb-6 space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-serif text-white">{formatINR(plan.priceMonthlyINR)}</span>
                    <span className="text-xs text-neutral-400">/ month</span>
                  </div>
                  <div className="text-xs text-neutral-400">
                    Annual: <span className="font-mono text-neutral-200">{formatINR(plan.priceAnnualINR)}</span> (save 20%)
                  </div>
                </div>

                {/* Resource Limits List */}
                <div className="space-y-3 text-xs mb-6">
                  <div className="flex items-center justify-between py-1.5 border-b border-neutral-800/60">
                    <span className="text-neutral-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-neutral-500" /> Max User Seats:
                    </span>
                    <span className="font-bold text-white">{plan.maxUsers} seat(s)</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-neutral-800/60">
                    <span className="text-neutral-400 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-neutral-500" /> Max Properties:
                    </span>
                    <span className="font-bold text-white">
                      {plan.maxProperties === -1 ? 'Unlimited' : `${plan.maxProperties} units`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-neutral-800/60">
                    <span className="text-neutral-400 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-amber-400" /> Monthly AI Inferences:
                    </span>
                    <span className="font-bold text-amber-300">
                      {plan.monthlyAIQuota === -1 ? 'Unlimited' : `${plan.monthlyAIQuota.toLocaleString()} queries`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-neutral-800/60">
                    <span className="text-neutral-400 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Integration:
                    </span>
                    <span className={`font-semibold ${plan.hasWhatsAppCRM ? 'text-emerald-400' : 'text-neutral-500'}`}>
                      {plan.hasWhatsAppCRM ? 'Enabled ✓' : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-neutral-800/60">
                    <span className="text-neutral-400 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-purple-400" /> Custom Automations:
                    </span>
                    <span className={`font-semibold ${plan.hasAutomation ? 'text-purple-400' : 'text-neutral-500'}`}>
                      {plan.hasAutomation ? 'Enabled ✓' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* Included Features Bullet Points */}
                <div className="space-y-1.5 mb-6">
                  <span className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider">Features Included:</span>
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-neutral-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800">
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={handleSave}
                  icon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit Plan Parameters
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
