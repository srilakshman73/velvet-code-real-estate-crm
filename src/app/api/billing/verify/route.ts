import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';
import {
  verifySubscriptionSignature,
  AUTHORITATIVE_PLANS,
  fetchRazorpaySubscription,
  getTierFromPlanId,
} from '@/lib/razorpay-server';
import { SubscriptionTier, Payment, Invoice, Subscription } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to verify subscription payment.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      tier,
      payment_method,
    } = body;

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return NextResponse.json(
        {
          error:
            'Missing required verification parameters: razorpay_payment_id, razorpay_subscription_id, razorpay_signature',
        },
        { status: 400 }
      );
    }

    // 1. Verify cryptographic HMAC SHA-256 signature
    const isSignatureValid = verifySubscriptionSignature({
      razorpayPaymentId: razorpay_payment_id,
      razorpaySubscriptionId: razorpay_subscription_id,
      razorpaySignature: razorpay_signature,
    });

    if (!isSignatureValid) {
      // Record failed payment attempt for audit logs
      const failedPayment: Payment = {
        id: `pay-${Date.now()}`,
        organizationId: session.organizationId,
        userId: session.userId,
        subscriptionId: razorpay_subscription_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount: 0,
        currency: 'INR',
        status: 'FAILED',
        paymentMethod: payment_method || 'Razorpay Gateway',
        createdAt: new Date().toISOString(),
      };
      serverDB.addPayment(failedPayment);

      return NextResponse.json(
        { error: 'Invalid Razorpay payment signature. Verification rejected.' },
        { status: 400 }
      );
    }

    // 2. Authoritative Plan resolution & strict Multi-tenant verification
    let resolvedTier: SubscriptionTier | undefined = undefined;

    // Check directly with Razorpay Subscriptions API for ground truth
    const rzpSub = await fetchRazorpaySubscription(razorpay_subscription_id);
    if (rzpSub) {
      // Strict multi-tenant isolation: verify subscription was issued for this tenant
      if (rzpSub.notes?.organizationId && rzpSub.notes.organizationId !== session.organizationId) {
        return NextResponse.json(
          { error: 'Forbidden: Subscription belongs to a different organization.' },
          { status: 403 }
        );
      }
      if (rzpSub.plan_id) {
        resolvedTier = getTierFromPlanId(rzpSub.plan_id);
      }
    }

    // Fallback tier resolution if offline/mock environment
    if (!resolvedTier) {
      resolvedTier = (tier && ['STARTER', 'PROFESSIONAL', 'BUSINESS'].includes(tier.toUpperCase())
        ? tier.toUpperCase()
        : 'STARTER') as SubscriptionTier;
    }

    const validatedTier = resolvedTier;
    const planConfig = AUTHORITATIVE_PLANS[validatedTier];
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // 3. Activate customer subscription in server database
    const existingSub = serverDB.getSubscription(session.organizationId);
    const updatedSub: Subscription = {
      id: existingSub?.id || `sub-${Date.now().toString(36)}`,
      organizationId: session.organizationId,
      userId: session.userId,
      tier: validatedTier,
      status: 'ACTIVE',
      priceMonthlyINR: planConfig.amountINR,
      billingCycle: 'monthly',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      razorpaySubscriptionId: razorpay_subscription_id,
      usage: existingSub?.usage || {
        usersCount: 1,
        leadsCount: 0,
        propertiesCount: 0,
        aiRequestsUsed: 0,
      },
    };
    serverDB.upsertSubscription(updatedSub);

    // 4. Record successful payment ledger item
    const paymentRecord: Payment = {
      id: `pay-${Date.now().toString(36)}`,
      organizationId: session.organizationId,
      userId: session.userId,
      subscriptionId: razorpay_subscription_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      amount: planConfig.amountINR,
      currency: 'INR',
      status: 'CAPTURED',
      paymentMethod: payment_method || 'UPI / NetBanking / Cards',
      planTier: validatedTier,
      createdAt: now.toISOString(),
    };
    serverDB.addPayment(paymentRecord);

    // 5. Generate official GST Tax Invoice (deduplicated by razorpayPaymentId)
    const baseAmount = Math.round(planConfig.amountINR / 1.18);
    const gstAmount = planConfig.amountINR - baseAmount;
    const existingInvoices = serverDB.getInvoices(session.organizationId);
    let invoiceRecord = existingInvoices.find((i) => i.razorpayPaymentId === razorpay_payment_id);
    if (!invoiceRecord) {
      invoiceRecord = {
        id: `inv-${Date.now().toString(36)}`,
        organizationId: session.organizationId,
        userId: session.userId,
        subscriptionId: razorpay_subscription_id,
        paymentId: paymentRecord.id,
        invoiceNumber: `INV-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        amountINR: baseAmount,
        taxINR: gstAmount,
        totalINR: planConfig.amountINR,
        status: 'paid',
        paymentMethod: payment_method || 'Razorpay AutoPay',
        razorpayPaymentId: razorpay_payment_id,
        billingPeriodStart: now.toISOString(),
        billingPeriodEnd: periodEnd.toISOString(),
        createdAt: now.toISOString(),
      };
      serverDB.addInvoice(invoiceRecord);
    }

    return NextResponse.json({
      success: true,
      message: 'Razorpay subscription activated successfully.',
      subscription: updatedSub,
      payment: paymentRecord,
      invoice: invoiceRecord,
    });
  } catch (error) {
    console.error('Subscription verification failed:', error);
    return NextResponse.json(
      { error: 'Internal error occurred during payment verification.' },
      { status: 500 }
    );
  }
}
