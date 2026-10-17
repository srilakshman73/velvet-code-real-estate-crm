import { AuthenticatedSession } from './auth-server';
import { serverDB } from './server-db';
import { SubscriptionTier, Subscription } from '@/types';

export interface CustomerAccessResult {
  allowed: boolean;
  status: 'ACTIVE' | 'TRIALING' | 'EXPIRED' | 'UNPAID' | 'PAYMENT_REQUIRED';
  tier: SubscriptionTier;
  reason?: string;
  redirectUrl?: string;
  daysRemaining?: number;
  trialEndsAt?: string;
  isOwner: boolean;
  subscription?: Subscription;
}

/**
 * Returns the application trial configuration derived strictly from server-side environment variables.
 */
export function getTrialConfiguration(): {
  enabled: boolean;
  trialDays: number;
  requirePaymentImmediately: boolean;
} {
  const requireImmediate = process.env.REQUIRE_PAYMENT_IMMEDIATELY === 'true';
  const enabled = process.env.ENABLE_FREE_TRIAL !== 'false' && !requireImmediate;
  const trialDays = parseInt(process.env.TRIAL_PERIOD_DAYS || '7', 10) || 7;

  return {
    enabled,
    trialDays,
    requirePaymentImmediately: requireImmediate,
  };
}

/**
 * Authoritative Server-Side Customer Access & Subscription Gate.
 * Enforces:
 * 1. Owner always granted unrestricted access without payment or trial restriction.
 * 2. Active paid subscription grants full access up to plan period.
 * 3. 7-Day Free trial grants access only while currentPeriodEnd > Date.now().
 * 4. Expired trial or unpaid status redirects to /app/billing or /pricing.
 * 5. If immediate payment configured, trial is bypassed and payment is mandatory before CRM entry.
 */
export async function verifyCustomerAccess(
  session: AuthenticatedSession | null
): Promise<CustomerAccessResult> {
  if (!session) {
    return {
      allowed: false,
      status: 'UNPAID',
      tier: 'STARTER',
      reason: 'Unauthenticated session',
      redirectUrl: '/login',
      isOwner: false,
    };
  }

  // 1. MASTER PLATFORM OWNER IS ALWAYS EXEMPT FROM SUBSCRIPTIONS AND PAYMENT GATES
  if (session.isOwner || session.role === 'OWNER') {
    return {
      allowed: true,
      status: 'ACTIVE',
      tier: 'BUSINESS',
      isOwner: true,
    };
  }

  const trialConfig = getTrialConfiguration();

  // 2. Fetch the tenant's persistent subscription from PostgreSQL
  const subscription = await serverDB.getSubscription(session.organizationId);

  if (!subscription) {
    if (trialConfig.requirePaymentImmediately || !trialConfig.enabled) {
      return {
        allowed: false,
        status: 'PAYMENT_REQUIRED',
        tier: 'STARTER',
        reason: 'Payment is required to access your CRM workspace.',
        redirectUrl: '/app/billing?reason=payment_required',
        isOwner: false,
      };
    }

    // Default to clean 7-day trial if freshly registered
    const now = Date.now();
    const periodEnd = new Date(now + trialConfig.trialDays * 24 * 60 * 60 * 1000).toISOString();
    const newSub: Subscription = {
      id: `sub-${session.organizationId}`,
      organizationId: session.organizationId,
      userId: session.userId,
      tier: 'STARTER',
      status: 'TRIALING',
      priceMonthlyINR: 1999,
      billingCycle: 'monthly',
      currentPeriodStart: new Date(now).toISOString(),
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      usage: {
        usersCount: 1,
        leadsCount: 0,
        propertiesCount: 0,
        aiRequestsUsed: 0,
      },
    };
    await serverDB.upsertSubscription(newSub);

    return {
      allowed: true,
      status: 'TRIALING',
      tier: 'STARTER',
      daysRemaining: trialConfig.trialDays,
      trialEndsAt: periodEnd,
      isOwner: false,
      subscription: newSub,
    };
  }

  const now = Date.now();
  const periodEndMs = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).getTime()
    : 0;

  // 3. ACTIVE PAID SUBSCRIPTION
  if (subscription.status === 'ACTIVE') {
    if (!periodEndMs || periodEndMs >= now) {
      return {
        allowed: true,
        status: 'ACTIVE',
        tier: subscription.tier,
        isOwner: false,
        subscription,
      };
    }

    // Period expired without recurring renewal
    return {
      allowed: false,
      status: 'EXPIRED',
      tier: subscription.tier,
      reason: 'Your subscription period has ended. Please renew your subscription to restore CRM access.',
      redirectUrl: '/app/billing?reason=expired',
      isOwner: false,
      subscription,
    };
  }

  // 4. SEVEN-DAY FREE TRIAL
  if (subscription.status === 'TRIALING') {
    if (trialConfig.requirePaymentImmediately || !trialConfig.enabled) {
      return {
        allowed: false,
        status: 'PAYMENT_REQUIRED',
        tier: subscription.tier || 'STARTER',
        reason: 'Free trials are currently disabled. An active subscription is required to enter the CRM.',
        redirectUrl: '/app/billing?reason=payment_required',
        isOwner: false,
        subscription,
      };
    }

    // Check if trial is still within the 7-day period
    if (periodEndMs > now) {
      const daysRemaining = Math.max(1, Math.ceil((periodEndMs - now) / (1000 * 60 * 60 * 24)));
      return {
        allowed: true,
        status: 'TRIALING',
        tier: subscription.tier || 'STARTER',
        daysRemaining,
        trialEndsAt: subscription.currentPeriodEnd,
        isOwner: false,
        subscription,
      };
    }

    // Trial has expired!
    return {
      allowed: false,
      status: 'EXPIRED',
      tier: subscription.tier || 'STARTER',
      reason: 'Your 7-day free trial has expired. Payment is mandatory to continue using your CRM workspace.',
      redirectUrl: '/app/billing?reason=trial_expired',
      isOwner: false,
      subscription,
    };
  }

  // 5. CANCELED, PAST DUE, OR UNPAID
  return {
    allowed: false,
    status: 'PAYMENT_REQUIRED',
    tier: subscription.tier || 'STARTER',
    reason: `Your subscription is currently ${subscription.status.toLowerCase()}. Please activate a plan to access CRM features.`,
    redirectUrl: '/app/billing?reason=inactive',
    isOwner: false,
    subscription,
  };
}
