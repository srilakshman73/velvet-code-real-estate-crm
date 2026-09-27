import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';
import { cancelRazorpaySubscription } from '@/lib/razorpay-server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const currentSub = serverDB.getSubscription(session.organizationId);
    if (!currentSub) {
      return NextResponse.json(
        { error: 'No active subscription found for this workspace.' },
        { status: 404 }
      );
    }

    // Call Razorpay cancellation if active Razorpay subscription exists
    if (currentSub.razorpaySubscriptionId && !currentSub.razorpaySubscriptionId.startsWith('sub_test_')) {
      await cancelRazorpaySubscription(currentSub.razorpaySubscriptionId, true);
    }

    // Update database state
    const updatedSub = serverDB.upsertSubscription({
      ...currentSub,
      cancelAtPeriodEnd: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current billing period.',
      subscription: updatedSub,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription.' },
      { status: 500 }
    );
  }
}
