'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VelvetCodeLogo } from '@/components/brand/VelvetCodeLogo';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { useCRMStore } from '@/lib/store';
import { SAAS_PLANS } from '@/lib/mock-data';
import { SubscriptionTier, BusinessType } from '@/types';
import {
  Building,
  Users2,
  Sliders,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OnboardingPage() {
  const router = useRouter();
  const { currentOrg, setCurrentOrg, upgradePlan } = useCRMStore();
  const [step, setStep] = useState(1);

  const [onboardingData, setOnboardingData] = useState({
    city: currentOrg.city || 'Chennai',
    state: currentOrg.state || 'Tamil Nadu',
    address: 'Level 5, Capital Park Towers, Anna Salai',
    reraNumber: 'TN/RERA/AG/2026/0189',
    businessType: currentOrg.businessType || ('AGENCY' as BusinessType),
    teamSize: '5-15 Agents',
    enableWhatsApp: true,
    enableAI: true,
    leadSources: ['Website', 'WhatsApp', 'Meta Ads', 'Referral'],
    selectedPlan: 'PROFESSIONAL' as SubscriptionTier,
  });

  const nextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const finishOnboarding = () => {
    // Update store with finalized org profile & plan
    setCurrentOrg({
      ...currentOrg,
      city: onboardingData.city,
      state: onboardingData.state,
      address: onboardingData.address,
      businessType: onboardingData.businessType,
    });

    upgradePlan(onboardingData.selectedPlan);

    // Fire celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#dfb76c', '#10b981', '#ffffff'],
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      router.push('/app');
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#0B0D11] text-zinc-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between py-4">
        <VelvetCodeLogo size="md" />
        <span className="text-xs text-zinc-400 font-medium">
          Step <strong className="text-amber-400">{step}</strong> of 5
        </span>
      </div>

      {/* Progress Bar */}
      <div className="max-w-3xl mx-auto w-full my-4">
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content Box */}
      <div className="max-w-2xl mx-auto w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-10 shadow-2xl my-auto space-y-6 animate-in fade-in">
        {/* STEP 1: BUSINESS PROFILE */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Business Information</h2>
                <p className="text-xs text-zinc-400">
                  Configure your primary real estate office and regulatory details.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Input
                label="City / Metro Hub"
                placeholder="e.g. Chennai / Bangalore"
                value={onboardingData.city}
                onChange={(e) =>
                  setOnboardingData({ ...onboardingData, city: e.target.value })
                }
              />
              <Input
                label="State"
                placeholder="e.g. Tamil Nadu"
                value={onboardingData.state}
                onChange={(e) =>
                  setOnboardingData({ ...onboardingData, state: e.target.value })
                }
              />
            </div>

            <Input
              label="Office Address"
              placeholder="e.g. Level 5, Capital Park Towers, Anna Salai"
              value={onboardingData.address}
              onChange={(e) =>
                setOnboardingData({ ...onboardingData, address: e.target.value })
              }
            />

            <Input
              label="RERA Registration Number (Optional)"
              placeholder="e.g. TN/RERA/AG/2026/0189"
              value={onboardingData.reraNumber}
              onChange={(e) =>
                setOnboardingData({ ...onboardingData, reraNumber: e.target.value })
              }
            />
          </div>
        )}

        {/* STEP 2: BUSINESS TYPE */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Select Your Business Model</h2>
                <p className="text-xs text-zinc-400">
                  This customizes your pipeline stages and default property types.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { id: 'AGENCY', title: 'Real Estate Agency', desc: 'Team selling primary & secondary homes' },
                { id: 'BROKER', title: 'Real Estate Broker', desc: 'Boutique consultancy & luxury portfolios' },
                { id: 'BUILDER', title: 'Builder / Developer', desc: 'Direct project developer & township launches' },
                { id: 'AGENT', title: 'Independent Agent', desc: 'Solo property consultant' },
                { id: 'PROPERTY_CONSULTANT', title: 'Commercial Consultant', desc: 'Commercial & corporate advisory' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    setOnboardingData({ ...onboardingData, businessType: item.id as BusinessType })
                  }
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    onboardingData.businessType === item.id
                      ? 'bg-amber-500/15 border-amber-400 text-white shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-zinc-400 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: TEAM SIZE */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Users2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">How Large is Your Sales Team?</h2>
                <p className="text-xs text-zinc-400">
                  We will configure your initial agent seats and lead distribution rules.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {['Just Me (1)', '2 - 5 Agents', '5 - 15 Agents', '15+ Agents'].map((sz) => (
                <div
                  key={sz}
                  onClick={() => setOnboardingData({ ...onboardingData, teamSize: sz })}
                  className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${
                    onboardingData.teamSize === sz
                      ? 'bg-amber-500/15 border-amber-400 text-white font-bold'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <p className="text-sm text-white">{sz}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: CRM PREFERENCES */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">CRM & Automation Preferences</h2>
                <p className="text-xs text-zinc-400">
                  Enable intelligent channels to accelerate your daily workflow.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Enable WhatsApp Cloud CRM & Automations
                    </p>
                    <p className="text-xs text-zinc-400">
                      Send instant confirmation and reminders on site visits.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={onboardingData.enableWhatsApp}
                  onChange={(e) =>
                    setOnboardingData({ ...onboardingData, enableWhatsApp: e.target.checked })
                  }
                  className="rounded text-amber-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Enable Realty AI Assistant
                    </p>
                    <p className="text-xs text-zinc-400">
                      Auto-score leads and draft personalized follow-ups.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={onboardingData.enableAI}
                  onChange={(e) =>
                    setOnboardingData({ ...onboardingData, enableAI: e.target.checked })
                  }
                  className="rounded text-amber-500 w-4 h-4"
                />
              </label>
            </div>
          </div>
        )}

        {/* STEP 5: SUBSCRIPTION SELECTION */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Select Your Initial Plan</h2>
                <p className="text-xs text-zinc-400">
                  Included in your 14-day free trial. No charge today.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {SAAS_PLANS.map((p) => {
                const isSelected = onboardingData.selectedPlan === p.tier;
                return (
                  <div
                    key={p.tier}
                    onClick={() =>
                      setOnboardingData({ ...onboardingData, selectedPlan: p.tier })
                    }
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 text-white shadow-lg'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-white">{p.name}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <p className="text-base font-extrabold text-white">
                        ₹{p.priceMonthlyINR}/mo
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        {p.maxUsers} Users • {p.maxLeads === -1 ? '∞' : p.maxLeads} Leads
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
          {step > 1 ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={prevStep}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          ) : (
            <button
              onClick={finishOnboarding}
              className="text-xs text-zinc-500 hover:text-zinc-300 underline"
            >
              Skip Setup (Use Defaults)
            </button>
          )}

          <Button
            type="button"
            variant="gold"
            size="md"
            onClick={nextStep}
            className="font-bold px-6 shadow-xl shadow-amber-500/20"
            rightIcon={step === 5 ? <Zap className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          >
            {step === 5 ? 'Launch CRM Workspace 🚀' : 'Continue'}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-3xl mx-auto w-full text-center py-4 text-xs text-zinc-500">
        Velvet Code Real Estate CRM • 14-Day Full Access Trial
      </div>
    </div>
  );
}
