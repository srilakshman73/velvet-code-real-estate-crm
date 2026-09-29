import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';
import { AUTHORITATIVE_PLANS } from '@/lib/razorpay-server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    // Retrieve subscription for this tenant
    let subscription = serverDB.getSubscription(session.organizationId);
    if (!subscription) {
      // Default to trial starter if not yet initialized
      subscription = serverDB.upsertSubscription({
        id: `sub-${session.organizationId}`,
        organizationId: session.organizationId,
        userId: session.userId,
        tier: 'STARTER',
        status: 'TRIALING',
        priceMonthlyINR: 1999,
        billingCycle: 'monthly',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        usage: {
          usersCount: 1,
          leadsCount: 0,
          propertiesCount: 0,
          aiRequestsUsed: 0,
        },
      });
    }

    // Calculate real live usage for this tenant
    const orgLeads = serverDB.getLeads().filter((l) => l.organizationId === session.organizationId);
    const orgProps = serverDB.getProperties().filter((p) => p.organizationId === session.organizationId);
    const orgUsers = serverDB.getUsers().filter((u) => u.organizationId === session.organizationId);

    const planLimits = AUTHORITATIVE_PLANS[subscription.tier] || AUTHORITATIVE_PLANS.STARTER;

    // Retrieve tenant's isolated payment history and invoices
    const payments = serverDB.getPayments(session.organizationId);
    const invoices = serverDB.getInvoices(session.organizationId);

    const storageUsage = serverDB.getStorageUsage(session.organizationId);

    return NextResponse.json({
      success: true,
      subscription: {
        ...subscription,
        usage: {
          usersCount: orgUsers.length || 1,
          leadsCount: orgLeads.length,
          propertiesCount: orgProps.length,
          aiRequestsUsed: subscription.usage?.aiRequestsUsed || 0,
          storageUsedBytes: storageUsage.usedBytes,
        },
      },
      planLimits,
      storageUsage,
      payments,
      invoices,
    });
  } catch (error) {
    console.error('Fetch subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing information.' },
      { status: 500 }
    );
  }
}

// PUT /api/billing/subscription — Plan Upgrade & Downgrade handler
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tier, billingCycle } = body;

    if (!tier || !['STARTER', 'PROFESSIONAL', 'BUSINESS'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
    }

    const result = serverDB.updateSubscriptionTier(
      session.organizationId,
      tier,
      billingCycle || 'monthly'
    );

    return NextResponse.json({
      success: true,
      message: `Plan successfully changed to ${result.planLimits.name}.`,
      data: result.subscription,
      planLimits: result.planLimits,
      warning: result.warning,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
