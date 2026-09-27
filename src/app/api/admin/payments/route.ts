import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session || (!session.isOwner && session.role !== 'OWNER')) {
      return NextResponse.json(
        { error: 'Forbidden: Master platform owner access required.' },
        { status: 403 }
      );
    }

    const payments = serverDB.getPayments();
    const organizations = serverDB.getOrganizations();

    const extendedPayments = payments.map((p) => {
      const org = organizations.find((o) => o.id === p.organizationId);
      const baseAmount = Math.round(p.amount / 1.18);
      const gstAmount = p.amount - baseAmount;
      return {
        ...p,
        organizationName: org?.name || 'Unknown Organization',
        amountINR: baseAmount,
        gstINR: gstAmount,
        totalINR: p.amount,
        planTier: p.planTier || 'PROFESSIONAL',
        date: p.createdAt ? p.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      };
    });

    return NextResponse.json({
      success: true,
      count: extendedPayments.length,
      data: extendedPayments,
    });
  } catch (error) {
    console.error('Admin fetch payments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch global payments' },
      { status: 500 }
    );
  }
}
