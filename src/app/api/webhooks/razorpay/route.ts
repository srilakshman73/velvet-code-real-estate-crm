import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';
import {
  verifyWebhookSignature,
  AUTHORITATIVE_PLANS,
} from '@/lib/razorpay-server';
import { Payment, Invoice, SubscriptionTier } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    // 1. Webhook Signature Validation
    const isSignatureValid = verifyWebhookSignature(rawBody, signature);
    if (!isSignatureValid) {
      console.warn('Razorpay Webhook: Rejected invalid signature');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const event = payload.event as string;
    const eventId = payload.event_id || payload.id || `${event}_${Date.now()}`;

    // 2. Idempotency Guard
    if (serverDB.isWebhookProcessed(eventId)) {
      return NextResponse.json({
        received: true,
        idempotent: true,
        message: 'Event already processed',
      });
    }

    serverDB.markWebhookProcessed(eventId);

    const subscriptionEntity = payload.payload?.subscription?.entity;
    const paymentEntity = payload.payload?.payment?.entity;

    // 3. Process events
    switch (event) {
      case 'subscription.activated':
      case 'subscription.charged': {
        const rzpSubId = subscriptionEntity?.id;
        const orgId = subscriptionEntity?.notes?.organizationId;
        const tier = (subscriptionEntity?.notes?.tier || 'PROFESSIONAL').toUpperCase() as SubscriptionTier;
        const planConfig = AUTHORITATIVE_PLANS[tier] || AUTHORITATIVE_PLANS.PROFESSIONAL;

        if (rzpSubId || orgId) {
          const existingSub = rzpSubId
            ? serverDB.getSubscriptionByRazorpayId(rzpSubId)
            : orgId
            ? serverDB.getSubscription(orgId)
            : undefined;

          if (existingSub || orgId) {
            const now = new Date();
            const startAt = subscriptionEntity?.current_start
              ? new Date(subscriptionEntity.current_start * 1000).toISOString()
              : now.toISOString();
            const endAt = subscriptionEntity?.current_end
              ? new Date(subscriptionEntity.current_end * 1000).toISOString()
              : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

            serverDB.upsertSubscription({
              id: existingSub?.id || `sub-${Date.now().toString(36)}`,
              organizationId: existingSub?.organizationId || orgId,
              tier: existingSub?.tier || tier,
              status: 'ACTIVE',
              priceMonthlyINR: planConfig.amountINR,
              billingCycle: 'monthly',
              currentPeriodStart: startAt,
              currentPeriodEnd: endAt,
              cancelAtPeriodEnd: false,
              razorpaySubscriptionId: rzpSubId || existingSub?.razorpaySubscriptionId,
              usage: existingSub?.usage || {
                usersCount: 1,
                leadsCount: 0,
                propertiesCount: 0,
                aiRequestsUsed: 0,
              },
            });
          }
        }
        break;
      }

      case 'subscription.pending': {
        const rzpSubId = subscriptionEntity?.id;
        if (rzpSubId) {
          const sub = serverDB.getSubscriptionByRazorpayId(rzpSubId);
          if (sub) {
            serverDB.upsertSubscription({
              ...sub,
              status: 'PAST_DUE',
            });
          }
        }
        break;
      }

      case 'subscription.halted': {
        const rzpSubId = subscriptionEntity?.id;
        if (rzpSubId) {
          const sub = serverDB.getSubscriptionByRazorpayId(rzpSubId);
          if (sub) {
            serverDB.upsertSubscription({
              ...sub,
              status: 'UNPAID',
            });
          }
        }
        break;
      }

      case 'subscription.cancelled': {
        const rzpSubId = subscriptionEntity?.id;
        if (rzpSubId) {
          const sub = serverDB.getSubscriptionByRazorpayId(rzpSubId);
          if (sub) {
            serverDB.upsertSubscription({
              ...sub,
              status: 'CANCELED',
              cancelAtPeriodEnd: true,
            });
          }
        }
        break;
      }

      case 'payment.captured': {
        if (paymentEntity) {
          const paymentId = paymentEntity.id;
          const rzpSubId = paymentEntity.subscription_id || paymentEntity.notes?.subscriptionId;
          const orgId =
            paymentEntity.notes?.organizationId ||
            (rzpSubId ? serverDB.getSubscriptionByRazorpayId(rzpSubId)?.organizationId : undefined) ||
            'org-apex-01';
          const amountINR = Math.round((paymentEntity.amount || 0) / 100);

          const paymentRecord: Payment = {
            id: `pay-${Date.now().toString(36)}`,
            organizationId: orgId,
            subscriptionId: rzpSubId,
            razorpayPaymentId: paymentId,
            razorpayOrderId: paymentEntity.order_id,
            amount: amountINR,
            currency: paymentEntity.currency || 'INR',
            status: 'CAPTURED',
            paymentMethod: paymentEntity.method ? paymentEntity.method.toUpperCase() : 'UPI / Card',
            createdAt: new Date().toISOString(),
          };
          serverDB.addPayment(paymentRecord);

          // Generate corresponding Invoice
          const baseAmount = Math.round(amountINR / 1.18);
          const gstAmount = amountINR - baseAmount;
          const invoiceRecord: Invoice = {
            id: `inv-${Date.now().toString(36)}`,
            organizationId: orgId,
            subscriptionId: rzpSubId,
            paymentId: paymentRecord.id,
            invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
            amountINR: baseAmount,
            taxINR: gstAmount,
            totalINR: amountINR,
            status: 'paid',
            paymentMethod: paymentEntity.method || 'Razorpay AutoPay',
            razorpayPaymentId: paymentId,
            billingPeriodStart: new Date().toISOString(),
            billingPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
          };
          serverDB.addInvoice(invoiceRecord);
        }
        break;
      }

      case 'payment.failed': {
        if (paymentEntity) {
          const paymentId = paymentEntity.id;
          const rzpSubId = paymentEntity.subscription_id || paymentEntity.notes?.subscriptionId;
          const orgId =
            paymentEntity.notes?.organizationId ||
            (rzpSubId ? serverDB.getSubscriptionByRazorpayId(rzpSubId)?.organizationId : undefined) ||
            'org-apex-01';

          const failedPayment: Payment = {
            id: `pay-${Date.now().toString(36)}`,
            organizationId: orgId,
            subscriptionId: rzpSubId,
            razorpayPaymentId: paymentId,
            razorpayOrderId: paymentEntity.order_id,
            amount: Math.round((paymentEntity.amount || 0) / 100),
            currency: paymentEntity.currency || 'INR',
            status: 'FAILED',
            paymentMethod: paymentEntity.method || 'Razorpay Gateway',
            createdAt: new Date().toISOString(),
          };
          serverDB.addPayment(failedPayment);
        }
        break;
      }

      default:
        // Other events logged but safely acknowledged
        break;
    }

    return NextResponse.json({
      received: true,
      event,
      processed: true,
    });
  } catch (error) {
    console.error('Razorpay webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
