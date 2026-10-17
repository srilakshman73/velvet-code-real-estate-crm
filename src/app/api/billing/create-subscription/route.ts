import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';
import {
  createRazorpaySubscription,
  AUTHORITATIVE_PLANS,
} from '@/lib/razorpay-server';
import { SubscriptionTier } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to create a subscription.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const requestedTier = (body.tier || 'PROFESSIONAL').toUpperCase() as SubscriptionTier;

    if (!['STARTER', 'PROFESSIONAL', 'BUSINESS'].includes(requestedTier)) {
      return NextResponse.json(
        { error: `Invalid subscription plan tier '${requestedTier}'. Must be STARTER, PROFESSIONAL, or BUSINESS.` },
        { status: 400 }
      );
    }

    const planConfig = AUTHORITATIVE_PLANS[requestedTier];

    // Create or initialize the subscription in Razorpay
    const subscriptionResult = await createRazorpaySubscription({
      tier: requestedTier,
      organizationId: session.organizationId,
      organizationName: session.organizationName,
      customerEmail: session.email,
    });

    // Update or create tenant subscription state in serverDB (preserving active status until verified)
    const existingSub = await serverDB.getSubscription(session.organizationId);
    await serverDB.upsertSubscription({
      id: existingSub?.id || `sub-${Date.now().toString(36)}`,
      organizationId: session.organizationId,
      userId: session.userId,
      planId: subscriptionResult.planId,
      tier: existingSub ? existingSub.tier : 'STARTER',
      status: existingSub ? existingSub.status : 'TRIALING',
      priceMonthlyINR: existingSub ? existingSub.priceMonthlyINR : AUTHORITATIVE_PLANS.STARTER.amountINR,
      billingCycle: existingSub?.billingCycle || 'monthly',
      currentPeriodStart: existingSub?.currentPeriodStart || new Date().toISOString(),
      currentPeriodEnd: existingSub?.currentPeriodEnd || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: existingSub?.cancelAtPeriodEnd || false,
      razorpaySubscriptionId: subscriptionResult.subscriptionId,
      usage: existingSub?.usage || {
        usersCount: 1,
        leadsCount: 0,
        propertiesCount: 0,
        aiRequestsUsed: 0,
      },
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscriptionResult.subscriptionId,
      keyId: subscriptionResult.keyId,
      planName: planConfig.name,
      tier: requestedTier,
      amountINR: planConfig.amountINR,
      currency: 'INR',
      organizationId: session.organizationId,
      organizationName: session.organizationName,
      customerEmail: session.email,
      customerName: session.name,
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to initiate Razorpay subscription.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
