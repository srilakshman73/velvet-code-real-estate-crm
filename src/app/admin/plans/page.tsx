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
          <h1 className="text-3xl font-serif font-bold text-[#3A2930] tracking-tight">SaaS Subscription Plans</h1>
          <p className="text-sm text-[#765D66] mt-1">
            Configure pricing tiers, resource limits (Seats, Leads, Properties, AI Tokens), and feature entitlements.
          </p>
        </div>
        {saveToast && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#4A7C59]/10 border border-[#4A7C59]/20 text-[#4A7C59] rounded-lg text-xs font-medium">
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
              className={`relative flex flex-col justify-between bg-[#FFF9FA] border-[#EBCBD4] shadow-2xs ${
                isPopular ? 'border-[#B86B84] shadow-[0_10px_30px_-5px_rgba(163,116,50,0.15)] ring-1 ring-[#B86B84]/30' : ''
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#B86B84] text-white font-bold text-[10px] uppercase tracking-wider shadow-sm">
                  Top Seller Tier
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#3A2930]">{plan.name}</h3>
                    <p className="text-xs text-[#765D66] font-mono">TIER: {plan.tier}</p>
                  </div>
                  <Badge variant={plan.tier === 'BUSINESS' ? 'gold' : plan.tier === 'PROFESSIONAL' ? 'info' : 'neutral'}>
                    {plan.tier}
                  </Badge>
                </div>

                {/* Pricing Block */}
                <div className="p-4 rounded-xl bg-[#FFF5F7] border border-[#EBCBD4] mb-6 space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-serif text-[#3A2930]">{formatINR(plan.priceMonthlyINR)}</span>
                    <span className="text-xs text-[#765D66]">/ month</span>
                  </div>
                  <div className="text-xs text-[#765D66]">
                    Annual: <span className="font-mono text-[#3A2930] font-bold">{formatINR(plan.priceAnnualINR)}</span> (save 20%)
                  </div>
                </div>

                {/* Resource Limits List */}
                <div className="space-y-3 text-xs mb-6">
                  <div className="flex items-center justify-between py-1.5 border-b border-[#EBCBD4]/60">
                    <span className="text-[#765D66] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#765D66]" /> Max User Seats:
                    </span>
                    <span className="font-bold text-[#3A2930]">{plan.maxUsers} seat(s)</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-[#EBCBD4]/60">
                    <span className="text-[#765D66] flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#765D66]" /> Max Properties:
                    </span>
                    <span className="font-bold text-[#3A2930]">
                      {plan.maxProperties === -1 ? 'Unlimited' : `${plan.maxProperties} units`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-[#EBCBD4]/60">
                    <span className="text-[#765D66] flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-[#B86B84]" /> Monthly AI Inferences:
                    </span>
                    <span className="font-bold text-[#8C455C]">
                      {plan.monthlyAIQuota === -1 ? 'Unlimited' : `${plan.monthlyAIQuota.toLocaleString()} queries`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-[#EBCBD4]/60">
                    <span className="text-[#765D66] flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#4A7C59]" /> WhatsApp Integration:
                    </span>
                    <span className={`font-semibold ${plan.hasWhatsAppCRM ? 'text-[#4A7C59]' : 'text-[#765D66]'}`}>
                      {plan.hasWhatsAppCRM ? 'Enabled âœ“' : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-[#EBCBD4]/60">
                    <span className="text-[#765D66] flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#B86B84]" /> Custom Automations:
                    </span>
                    <span className={`font-semibold ${plan.hasAutomation ? 'text-[#8C455C]' : 'text-[#765D66]'}`}>
                      {plan.hasAutomation ? 'Enabled âœ“' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* Included Features Bullet Points */}
                <div className="space-y-1.5 mb-6">
                  <span className="text-[11px] font-semibold text-[#3A2930] uppercase tracking-wider font-serif">Features Included:</span>
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#765D66]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#B86B84] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#EBCBD4]">
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

