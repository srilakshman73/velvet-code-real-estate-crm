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
          <h1 className="text-3xl font-serif font-bold text-[#24211D] tracking-tight">SaaS Subscription Plans</h1>
          <p className="text-sm text-[#766F63] mt-1">
            Configure pricing tiers, resource limits (Seats, Leads, Properties, AI Tokens), and feature entitlements.
          </p>
        </div>
        {saveToast && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2E6B4F]/10 border border-[#2E6B4F]/20 text-[#2E6B4F] rounded-lg text-xs font-medium">
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
              className={`relative flex flex-col justify-between bg-[#FFFCF6] border-[#DDD4C4] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)] ${
                isPopular ? 'border-[#A374] shadow-[0_10px_30px_-5px_rgba(163,116,36,0.15)] ring-1 ring-[#A374]/30' : ''
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#A374] text-white font-bold text-[10px] uppercase tracking-wider shadow-sm">
                  Top Seller Tier
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#24211D]">{plan.name}</h3>
                    <p className="text-xs text-[#766F63] font-mono">TIER: {plan.tier}</p>
                  </div>
                  <Badge variant={plan.tier === 'BUSINESS' ? 'gold' : plan.tier === 'PROFESSIONAL' ? 'info' : 'neutral'}>
                    {plan.tier}
                  </Badge>
                </div>

                {/* Pricing Block */}
                <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#DDD4C4] mb-6 space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-serif text-[#24211D]">{formatINR(plan.priceMonthlyINR)}</span>
                    <span className="text-xs text-[#766F63]">/ month</span>
                  </div>
                  <div className="text-xs text-[#766F63]">
                    Annual: <span className="font-mono text-[#24211D] font-bold">{formatINR(plan.priceAnnualINR)}</span> (save 20%)
                  </div>
                </div>

                {/* Resource Limits List */}
                <div className="space-y-3 text-xs mb-6">
                  <div className="flex items-center justify-between py-1.5 border-b border-[#DDD4C4]/60">
                    <span className="text-[#766F63] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#766F63]" /> Max User Seats:
                    </span>
                    <span className="font-bold text-[#24211D]">{plan.maxUsers} seat(s)</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-[#DDD4C4]/60">
                    <span className="text-[#766F63] flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#766F63]" /> Max Properties:
                    </span>
                    <span className="font-bold text-[#24211D]">
                      {plan.maxProperties === -1 ? 'Unlimited' : `${plan.maxProperties} units`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-[#DDD4C4]/60">
                    <span className="text-[#766F63] flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-[#A374]" /> Monthly AI Inferences:
                    </span>
                    <span className="font-bold text-[#8F642B]">
                      {plan.monthlyAIQuota === -1 ? 'Unlimited' : `${plan.monthlyAIQuota.toLocaleString()} queries`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-[#DDD4C4]/60">
                    <span className="text-[#766F63] flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#2E6B4F]" /> WhatsApp Integration:
                    </span>
                    <span className={`font-semibold ${plan.hasWhatsAppCRM ? 'text-[#2E6B4F]' : 'text-[#766F63]'}`}>
                      {plan.hasWhatsAppCRM ? 'Enabled ✓' : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-[#DDD4C4]/60">
                    <span className="text-[#766F63] flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#7048E8]" /> Custom Automations:
                    </span>
                    <span className={`font-semibold ${plan.hasAutomation ? 'text-[#7048E8]' : 'text-[#766F63]'}`}>
                      {plan.hasAutomation ? 'Enabled ✓' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* Included Features Bullet Points */}
                <div className="space-y-1.5 mb-6">
                  <span className="text-[11px] font-semibold text-[#24211D] uppercase tracking-wider font-serif">Features Included:</span>
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#766F63]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#A374] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#DDD4C4]">
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
