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

    // Update or create pending tenant subscription state in serverDB
    const existingSub = serverDB.getSubscription(session.organizationId);
    serverDB.upsertSubscription({
      id: existingSub?.id || `sub-${Date.now().toString(36)}`,
      organizationId: session.organizationId,
      userId: session.userId,
      planId: subscriptionResult.planId,
      tier: requestedTier,
      status: existingSub?.status === 'ACTIVE' ? 'ACTIVE' : 'TRIALING',
      priceMonthlyINR: planConfig.amountINR,
      billingCycle: 'monthly',
      currentPeriodStart: existingSub?.currentPeriodStart || new Date().toISOString(),
      currentPeriodEnd: existingSub?.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
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
    return NextResponse.json(
      { error: 'Failed to initiate Razorpay subscription.' },
      { status: 500 }
    );
  }
}
