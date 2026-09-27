'use client';

import React, { useState, useEffect } from 'react';
import { useCRMStore } from '@/lib/store';
import { SAAS_PLANS } from '@/lib/mock-data';
import { SubscriptionTier, Payment, Invoice } from '@/types';
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
  ShieldCheck,
  RefreshCw,
  Clock,
  ExternalLink,
  Ban,
  ArrowUpRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function BillingPage() {
  const {
    subscription,
    currentPlanLimits,
    cancelSubscription,
    payments,
    invoices,
    fetchBillingData,
    leads,
    properties,
    users,
    currentUser,
    currentOrg,
  } = useCRMStore();

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(subscription.tier);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load Razorpay Checkout standard script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Check for auto-checkout param in URL (e.g. redirected from pricing or registration)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const checkoutTier = params.get('checkout')?.toUpperCase() as SubscriptionTier | null;
      if (checkoutTier && ['STARTER', 'PROFESSIONAL', 'BUSINESS'].includes(checkoutTier)) {
        // Open checkout modal or trigger upgrade
        setSelectedTier(checkoutTier);
        setIsUpgradeModalOpen(true);
      }
    }
  }, []);

  // Initiate Razorpay Subscription Checkout
  const handleInitiateRazorpaySubscription = async (tier: SubscriptionTier) => {
    setIsProcessingCheckout(true);
    setStatusFeedback(null);

    try {
      const res = await fetch('/api/billing/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusFeedback({
          type: 'error',
          message: data.error || 'Failed to initiate Razorpay subscription.',
        });
        setIsProcessingCheckout(false);
        return;
      }

      if (!window.Razorpay) {
        setStatusFeedback({
          type: 'error',
          message: 'Razorpay checkout script is loading. Please try again in a moment.',
        });
        setIsProcessingCheckout(false);
        return;
      }

      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: 'Velvet Code Real Estate CRM',
        description: `${data.planName} Plan Subscription (Test Mode)`,
        image: '/brand/velvet-code-logo.jpeg',
        handler: async function (response: any) {
          setIsProcessingCheckout(true);
          try {
            const verifyRes = await fetch('/api/billing/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
                tier,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              await fetchBillingData();
              setIsUpgradeModalOpen(false);
              setStatusFeedback({
                type: 'success',
                message: `Subscription successfully activated on the ${data.planName} Plan!`,
              });
              try {
                confetti({
                  particleCount: 120,
                  spread: 80,
                  origin: { y: 0.6 },
                  colors: ['#A37432', '#547A61', '#2C241A', '#C39A5B'],
                });
              } catch {
                // ignore
              }
            } else {
              setStatusFeedback({
                type: 'error',
                message: verifyData.error || 'Signature verification failed.',
              });
            }
          } catch {
            setStatusFeedback({
              type: 'error',
              message: 'Failed to complete server payment verification.',
            });
          } finally {
            setIsProcessingCheckout(false);
          }
        },
        prefill: {
          name: currentUser.name,
          email: currentUser.email,
          contact: currentUser.phone || '+916383395915',
        },
        notes: {
          organizationId: currentOrg.id,
          tier,
        },
        theme: {
          color: '#A37432', // Velvet Code Gold luxury theme
        },
        modal: {
          ondismiss: function () {
            setIsProcessingCheckout(false);
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (failedResp: any) {
        setIsProcessingCheckout(false);
        setStatusFeedback({
          type: 'error',
          message: failedResp.error?.description || 'Razorpay payment was declined or failed.',
        });
      });

      rzpInstance.open();
    } catch (err) {
      console.error('Checkout initiation error:', err);
      setStatusFeedback({
        type: 'error',
        message: 'Network error communicating with payment gateway.',
      });
      setIsProcessingCheckout(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      const res = await fetch('/api/billing/cancel-subscription', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        cancelSubscription();
        await fetchBillingData();
        setIsCancelModalOpen(false);
        setStatusFeedback({
          type: 'success',
          message: 'Subscription has been scheduled for cancellation at the end of the billing period.',
        });
      } else {
        setStatusFeedback({
          type: 'error',
          message: data.error || 'Failed to cancel subscription.',
        });
      }
    } catch {
      setStatusFeedback({
        type: 'error',
        message: 'Failed to contact subscription server.',
      });
    } finally {
      setIsCanceling(false);
    }
  };

  const formattedPeriodEnd = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Ongoing';

  const formattedPeriodStart = subscription.currentPeriodStart
    ? new Date(subscription.currentPeriodStart).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Current';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto bg-[#E9DFC8] text-[#2C241A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C241A] tracking-tight flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-[#A37432]" />
              Subscription & Workspace Billing
            </h1>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                subscription.status === 'ACTIVE'
                  ? 'bg-[#547A61]/15 text-[#547A61] border-[#547A61]/30'
                  : subscription.status === 'TRIALING'
                  ? 'bg-[#A37432]/15 text-[#7A5520] border-[#A37432]/30'
                  : 'bg-[#8B4A4A]/15 text-[#8B4A4A] border-[#8B4A4A]/30'
              }`}
            >
              Status: {subscription.status}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6A5A44] mt-1">
            Manage your real estate SaaS plan tier, usage quotas, Razorpay subscription, and tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchBillingData()}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh Billing
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => setIsUpgradeModalOpen(true)}
            icon={<Zap className="w-4 h-4" />}
          >
            Change / Upgrade Plan
          </Button>
        </div>
      </div>

      {statusFeedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-2 ${
            statusFeedback.type === 'success'
              ? 'bg-[#547A61]/15 border-[#547A61]/30 text-[#547A61]'
              : 'bg-[#8B4A4A]/15 border-[#8B4A4A]/30 text-[#8B4A4A]'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusFeedback.message}</span>
          </div>
          <button
            onClick={() => setStatusFeedback(null)}
            className="text-xs font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Current Plan Overview Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FFF9F0] border border-[#D8C7A5] shadow-[0_8px_24px_rgba(120,90,40,0.08)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8C7A5] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7A5520] font-serif">
                Active SaaS Plan
              </span>
              {subscription.cancelAtPeriodEnd && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#8B4A4A]/15 text-[#8B4A4A] border border-[#8B4A4A]/30 rounded">
                  Cancels on renewal
                </span>
              )}
            </div>
            <h2 className="text-3xl font-serif font-bold text-[#2C241A] mt-1">
              {currentPlanLimits.name} Plan
            </h2>
            <p className="text-sm text-[#6A5A44] mt-1 flex flex-wrap items-center gap-2">
              <span>₹{subscription.priceMonthlyINR.toLocaleString('en-IN')}/month</span>
              <span>&bull;</span>
              <span>Billing Period: {formattedPeriodStart} – {formattedPeriodEnd}</span>
              <span>&bull;</span>
              <span>Next Renewal: {formattedPeriodEnd}</span>
            </p>
            {subscription.razorpaySubscriptionId && (
              <p className="text-xs font-mono text-[#8A7A63] mt-2">
                Razorpay Subscription ID: <span className="text-[#2C241A] font-bold">{subscription.razorpaySubscriptionId}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!subscription.cancelAtPeriodEnd && subscription.status === 'ACTIVE' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCancelModalOpen(true)}
                className="text-[#8B4A4A] border-[#8B4A4A]/30 hover:bg-[#8B4A4A]/10"
              >
                Cancel Subscription
              </Button>
            )}
            <Button
              variant="gold"
              size="md"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="font-bold shadow-md"
            >
              Upgrade / Change Tier
            </Button>
          </div>
        </div>

        {/* Real-time Usage Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {/* 1. Users */}
          <div className="space-y-2 p-4 rounded-xl bg-[#F4EAD7] border border-[#D8C7A5] shadow-2xs">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#6A5A44]">Agent Seats:</span>
              <span className="text-[#2C241A] font-mono">
                {users.length} / {currentPlanLimits.maxUsers}
              </span>
            </div>
            <div className="w-full h-2 bg-[#E9DFC8] rounded-full overflow-hidden border border-[#D8C7A5]">
              <div
                className="h-full bg-[#A37432] rounded-full transition-all"
                style={{ width: `${Math.min((users.length / currentPlanLimits.maxUsers) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-[#6A5A44]">Enforced server-side</p>
          </div>

          {/* 2. Leads */}
          <div className="space-y-2 p-4 rounded-xl bg-[#F4EAD7] border border-[#D8C7A5] shadow-2xs">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#6A5A44]">Lead Capacity:</span>
              <span className="text-[#2C241A] font-mono">
                {leads.length} / {currentPlanLimits.maxLeads === -1 ? 'Unlimited' : currentPlanLimits.maxLeads}
              </span>
            </div>
            <div className="w-full h-2 bg-[#E9DFC8] rounded-full overflow-hidden border border-[#D8C7A5]">
              <div
                className="h-full bg-[#547A61] rounded-full transition-all"
                style={{
                  width: `${
                    currentPlanLimits.maxLeads === -1
                      ? 10
                      : Math.min((leads.length / currentPlanLimits.maxLeads) * 100, 100)
                  }%`,
                }}
              />
            </div>
            <p className="text-[10px] text-[#6A5A44]">Active buyer contacts</p>
          </div>

          {/* 3. Properties */}
          <div className="space-y-2 p-4 rounded-xl bg-[#F4EAD7] border border-[#D8C7A5] shadow-2xs">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#6A5A44]">Property Listings:</span>
              <span className="text-[#2C241A] font-mono">
                {properties.length} /{' '}
                {currentPlanLimits.maxProperties === -1 ? 'Unlimited' : currentPlanLimits.maxProperties}
              </span>
            </div>
            <div className="w-full h-2 bg-[#E9DFC8] rounded-full overflow-hidden border border-[#D8C7A5]">
              <div
                className="h-full bg-[#C39A5B] rounded-full transition-all"
                style={{
                  width: `${
                    currentPlanLimits.maxProperties === -1
                      ? 10
                      : Math.min((properties.length / currentPlanLimits.maxProperties) * 100, 100)
                  }%`,
                }}
              />
            </div>
            <p className="text-[10px] text-[#6A5A44]">Active inventory listings</p>
          </div>

          {/* 4. AI Inferences */}
          <div className="space-y-2 p-4 rounded-xl bg-[#F4EAD7] border border-[#D8C7A5] shadow-2xs">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#6A5A44]">Realty AI Quota:</span>
              <span className="text-[#7A5520] font-mono">
                {subscription.usage?.aiRequestsUsed || 0} / {currentPlanLimits.monthlyAIQuota}
              </span>
            </div>
            <div className="w-full h-2 bg-[#E9DFC8] rounded-full overflow-hidden border border-[#D8C7A5]">
              <div
                className="h-full bg-[#A37432] rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    ((subscription.usage?.aiRequestsUsed || 0) / currentPlanLimits.monthlyAIQuota) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-[#6A5A44]">Resets monthly</p>
          </div>
        </div>
      </div>

      {/* Payment History & Invoices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment History */}
        <div className="space-y-4">
          <h3 className="text-lg font-serif font-bold text-[#2C241A] tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#A37432]" />
            Payment History
          </h3>

          <div className="rounded-2xl border border-[#D8C7A5] bg-[#FFF9F0] overflow-hidden shadow-[0_8px_24px_rgba(120,90,40,0.08)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4EAD7] border-b border-[#D8C7A5] text-[#2C241A] font-semibold">
                <tr>
                  <th className="p-3.5">Payment ID</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8C7A5]/60">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[#6A5A44]">
                      <Receipt className="w-7 h-7 text-[#D8C7A5] mx-auto mb-2" />
                      <p className="font-serif font-bold text-sm text-[#2C241A]">No payments yet</p>
                      <p className="text-xs mt-0.5">Your Razorpay subscription transaction receipts will be logged here.</p>
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F7EEDC] transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#2C241A]">{p.razorpayPaymentId}</td>
                      <td className="p-3.5 font-mono font-bold text-[#7A5520]">₹{p.amount.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 text-[#6A5A44]">{p.paymentMethod}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                            p.status === 'CAPTURED'
                              ? 'bg-[#547A61]/15 text-[#547A61] border-[#547A61]/30'
                              : 'bg-[#8B4A4A]/15 text-[#8B4A4A] border-[#8B4A4A]/30'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right text-[#6A5A44]">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* GST Tax Invoices */}
        <div className="space-y-4">
          <h3 className="text-lg font-serif font-bold text-[#2C241A] tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#A37432]" />
            GST Tax Invoices
          </h3>

          <div className="rounded-2xl border border-[#D8C7A5] bg-[#FFF9F0] overflow-hidden shadow-[0_8px_24px_rgba(120,90,40,0.08)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4EAD7] border-b border-[#D8C7A5] text-[#2C241A] font-semibold">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Total Paid</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8C7A5]/60">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-[#6A5A44]">
                      <Receipt className="w-7 h-7 text-[#D8C7A5] mx-auto mb-2" />
                      <p className="font-serif font-bold text-sm text-[#2C241A]">No invoices yet</p>
                      <p className="text-xs mt-0.5">Official GST invoices will be generated upon payment confirmation.</p>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#F7EEDC] transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#2C241A]">{inv.invoiceNumber}</td>
                      <td className="p-3.5 font-mono font-bold text-[#7A5520]">₹{inv.totalINR.toLocaleString('en-IN')}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-[#547A61]/15 text-[#547A61] border border-[#547A61]/30 rounded">
                          {inv.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => alert(`Downloading official Tax Invoice ${inv.invoiceNumber}...`)}
                          className="text-[#7A5520] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Upgrade / Switch Plan Modal with Razorpay Checkout */}
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => !isProcessingCheckout && setIsUpgradeModalOpen(false)}
        title="Select SaaS Subscription Plan"
        description="Choose a monthly subscription plan. Payment is powered by Razorpay Test Mode."
        maxWidth="3xl"
      >
        <div className="space-y-6 my-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SAAS_PLANS.map((plan) => {
              const isCurrent = plan.tier === subscription.tier && subscription.status === 'ACTIVE';
              const isSelected = selectedTier === plan.tier;
              const isPopular = plan.tier === 'PROFESSIONAL';

              return (
                <div
                  key={plan.tier}
                  onClick={() => setSelectedTier(plan.tier)}
                  className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 cursor-pointer transition-all relative ${
                    isSelected
                      ? 'bg-[#A37432]/10 border-[#A37432] shadow-md ring-2 ring-[#A37432]/40'
                      : 'bg-[#FFF9F0] border-[#D8C7A5] hover:border-[#A37432]/60'
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-2.5 right-4 px-2 py-0.5 text-[9px] font-bold bg-[#A37432] text-white rounded-full">
                      Most Popular
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-serif font-bold text-[#2C241A] text-base">{plan.name}</h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-[#547A61] text-white rounded">
                          Current Plan
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl font-serif font-extrabold text-[#2C241A]">
                        ₹{plan.priceMonthlyINR.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-[#8A7A63]"> / month</span>
                    </div>

                    <ul className="mt-4 space-y-2 text-xs text-[#6A5A44]">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#A37432]" />
                        <span>{plan.maxUsers} User Seat(s)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#A37432]" />
                        <span>{plan.maxLeads === -1 ? 'Unlimited' : plan.maxLeads} Leads</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#A37432]" />
                        <span>{plan.maxProperties === -1 ? 'Unlimited' : plan.maxProperties} Properties</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#A37432]" />
                        <span>{plan.monthlyAIQuota} AI Queries</span>
                      </li>
                    </ul>
                  </div>

                  <Button
                    variant={isSelected ? 'gold' : 'secondary'}
                    size="sm"
                    disabled={isProcessingCheckout}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInitiateRazorpaySubscription(plan.tier);
                    }}
                    className="w-full font-bold shadow-xs"
                  >
                    {isCurrent ? 'Renew / Manage' : `Subscribe with Razorpay`}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#D8C7A5] text-xs text-[#8A7A63]">
            <span className="flex items-center gap-1 text-[#547A61] font-semibold">
              <ShieldCheck className="w-4 h-4" /> Razorpay Test Mode Secured
            </span>
            <span>No live charges will be incurred.</span>
          </div>
        </div>
      </Modal>

      {/* Cancel Subscription Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => !isCanceling && setIsCancelModalOpen(false)}
        title="Cancel SaaS Subscription"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-[#8B4A4A]/10 border border-[#8B4A4A]/20 rounded-xl text-[#8B4A4A]">
            <p className="font-bold">Are you sure you want to cancel your workspace subscription?</p>
            <p className="mt-1 text-[#2C241A]">
              Your workspace will remain fully functional until the end of your billing cycle on{' '}
              <strong>{formattedPeriodEnd}</strong>. After this date, your workspace limits will downgrade to the free tier.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCancelModalOpen(false)}
              disabled={isCanceling}
            >
              Keep Subscription
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleCancelSubscription}
              disabled={isCanceling}
            >
              {isCanceling ? 'Canceling...' : 'Confirm Cancellation'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
