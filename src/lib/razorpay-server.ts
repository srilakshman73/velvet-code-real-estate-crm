import crypto from 'crypto';
import { SubscriptionTier } from '@/types';

// ============================================================
// SERVER-SIDE RAZORPAY CONFIGURATION (CONFIDENTIAL & SECURE)
// ============================================================

export interface AuthoritativePlanConfig {
  tier: SubscriptionTier;
  name: string;
  amountPaise: number;
  amountINR: number;
  period: 'monthly' | 'yearly';
  interval: number;
  maxUsers: number;
  maxLeads: number;
  maxProperties: number;
  monthlyAIQuota: number;
  description: string;
}

export const AUTHORITATIVE_PLANS: Record<SubscriptionTier, AuthoritativePlanConfig> = {
  STARTER: {
    tier: 'STARTER',
    name: 'Starter',
    amountPaise: 199900,
    amountINR: 1999,
    period: 'monthly',
    interval: 1,
    maxUsers: 1,
    maxLeads: 100,
    maxProperties: 25,
    monthlyAIQuota: 100,
    description: 'Velvet Code Starter Monthly Subscription',
  },
  PROFESSIONAL: {
    tier: 'PROFESSIONAL',
    name: 'Professional',
    amountPaise: 599900,
    amountINR: 5999,
    period: 'monthly',
    interval: 1,
    maxUsers: 5,
    maxLeads: 1000,
    maxProperties: -1, // Unlimited
    monthlyAIQuota: 1000,
    description: 'Velvet Code Professional Monthly Subscription',
  },
  BUSINESS: {
    tier: 'BUSINESS',
    name: 'Business',
    amountPaise: 999900,
    amountINR: 9999,
    period: 'monthly',
    interval: 1,
    maxUsers: 15,
    maxLeads: -1, // Unlimited
    maxProperties: -1, // Unlimited
    monthlyAIQuota: 5000,
    description: 'Velvet Code Business Monthly Subscription',
  },
};

export const DEFAULT_RAZORPAY_PLAN_IDS: Record<SubscriptionTier, string> = {
  STARTER: 'plan_TmTRbhyJaA79AW',
  PROFESSIONAL: 'plan_TmTT05HGnKjDq3',
  BUSINESS: 'plan_TmTTrXM6JxkG6k',
};

/**
 * Returns server-side Razorpay credentials.
 * Never expose RAZORPAY_KEY_SECRET to client bundles.
 */
export function getRazorpayCredentials() {
  const keyId =
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    'rzp_test_TfOz0NdbxVaGbx';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'FZepi0Iq38BdVrY2agtk55Uf';
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'velvet_webhook_secret_test_2026';

  return {
    keyId: keyId.trim(),
    keySecret: keySecret.trim(),
    webhookSecret: webhookSecret.trim(),
  };
}

function getAuthHeader(keyId: string, keySecret: string) {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
}

/**
 * Resolves the Razorpay Plan ID for a given tier.
 * Priority:
 * 1. Environment variable (e.g. RAZORPAY_STARTER_PLAN_ID)
 * 2. Default existing Plan IDs (Starter: plan_TmTRbhyJaA79AW, Pro: plan_TmTT05HGnKjDq3, Biz: plan_TmTTrXM6JxkG6k)
 */
export async function getOrCreateRazorpayPlanId(tier: SubscriptionTier): Promise<string> {
  const envMap: Record<SubscriptionTier, string | undefined> = {
    STARTER: process.env.RAZORPAY_STARTER_PLAN_ID?.trim(),
    PROFESSIONAL: process.env.RAZORPAY_PROFESSIONAL_PLAN_ID?.trim(),
    BUSINESS: process.env.RAZORPAY_BUSINESS_PLAN_ID?.trim(),
  };

  const envPlanId = envMap[tier];
  if (envPlanId) {
    return envPlanId;
  }

  return DEFAULT_RAZORPAY_PLAN_IDS[tier] || '';
}

/**
 * Creates a Razorpay Subscription instance via Razorpay API.
 */
export async function createRazorpaySubscription(params: {
  tier: SubscriptionTier;
  organizationId: string;
  organizationName: string;
  customerEmail?: string;
  customerPhone?: string;
}): Promise<{
  subscriptionId: string;
  planId: string;
  amountINR: number;
  keyId: string;
}> {
  const { keyId, keySecret } = getRazorpayCredentials();
  const planConfig = AUTHORITATIVE_PLANS[params.tier];
  const planId = await getOrCreateRazorpayPlanId(params.tier);

  if (!planId) {
    throw new Error(`Razorpay Plan ID not configured for tier: ${params.tier}`);
  }

  const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(keyId, keySecret),
    },
    body: JSON.stringify({
      plan_id: planId,
      total_count: 120, // 10-year monthly subscription
      quantity: 1,
      customer_notify: 1,
      notes: {
        organizationId: params.organizationId,
        organizationName: params.organizationName,
        tier: params.tier,
      },
    }),
  });

  if (response.ok) {
    const data = await response.json();
    return {
      subscriptionId: data.id,
      planId: data.plan_id || planId,
      amountINR: planConfig.amountINR,
      keyId,
    };
  }

  const errorData = await response.json().catch(() => ({}));
  const errorDesc = errorData.error?.description || response.statusText;
  throw new Error(`Razorpay subscription creation failed: ${errorDesc}`);
}

/**
 * Verifies Razorpay Subscription Payment signature.
 * Formula: HMAC_SHA256(payment_id + "|" + subscription_id, secret) == signature
 */
export function verifySubscriptionSignature(params: {
  razorpayPaymentId: string;
  razorpaySubscriptionId: string;
  razorpaySignature: string;
}): boolean {
  const { keySecret } = getRazorpayCredentials();
  if (!keySecret || !params.razorpaySignature) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${params.razorpayPaymentId}|${params.razorpaySubscriptionId}`)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'utf-8'),
      Buffer.from(params.razorpaySignature, 'utf-8')
    );
  } catch {
    return false;
  }
}

/**
 * Resolves subscription tier enum from a Razorpay Plan ID.
 */
export function getTierFromPlanId(planId: string): SubscriptionTier {
  const starterId = process.env.RAZORPAY_STARTER_PLAN_ID?.trim() || DEFAULT_RAZORPAY_PLAN_IDS.STARTER;
  const proId = process.env.RAZORPAY_PROFESSIONAL_PLAN_ID?.trim() || DEFAULT_RAZORPAY_PLAN_IDS.PROFESSIONAL;
  const bizId = process.env.RAZORPAY_BUSINESS_PLAN_ID?.trim() || DEFAULT_RAZORPAY_PLAN_IDS.BUSINESS;

  if (planId === starterId) return 'STARTER';
  if (planId === proId) return 'PROFESSIONAL';
  if (planId === bizId) return 'BUSINESS';
  return 'STARTER';
}

/**
 * Fetches subscription details from Razorpay API.
 */
export async function fetchRazorpaySubscription(subscriptionId: string): Promise<any | null> {
  const { keyId, keySecret } = getRazorpayCredentials();
  try {
    const response = await fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}`, {
      headers: {
        Authorization: getAuthHeader(keyId, keySecret),
      },
    });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Non-fatal if offline/mock environment
  }
  return null;
}

/**
 * Validates Razorpay Webhook signature using RAZORPAY_WEBHOOK_SECRET.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const { webhookSecret } = getRazorpayCredentials();

  if (!webhookSecret) {
    console.warn('RAZORPAY_WEBHOOK_SECRET is not configured.');
    return false;
  }

  if (!signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  } catch {
    return false;
  }
}

/**
 * Cancels a subscription in Razorpay.
 */
export async function cancelRazorpaySubscription(
  subscriptionId: string,
  cancelAtCycleEnd = true
): Promise<boolean> {
  const { keyId, keySecret } = getRazorpayCredentials();

  try {
    const response = await fetch(
      `https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader(keyId, keySecret),
        },
        body: JSON.stringify({
          cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0,
        }),
      }
    );

    return response.ok;
  } catch (err) {
    console.error('Razorpay subscription cancellation failed:', err);
    return false;
  }
}
