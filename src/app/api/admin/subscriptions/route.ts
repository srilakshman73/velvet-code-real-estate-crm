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

    const subscriptions = serverDB.getSubscriptions();
    const organizations = serverDB.getOrganizations();
    const users = serverDB.getUsers();

    const extendedSubs = subscriptions.map((sub) => {
      const org = organizations.find((o) => o.id === sub.organizationId);
      const ownerUser = users.find((u) => u.organizationId === sub.organizationId);
      return {
        ...sub,
        organizationName: org?.name || 'Unknown Organization',
        customerName: ownerUser?.name || 'Agency Owner',
        customerEmail: ownerUser?.email || org?.email || 'N/A',
      };
    });

    return NextResponse.json({
      success: true,
      count: extendedSubs.length,
      data: extendedSubs,
    });
  } catch (error) {
    console.error('Admin fetch subscriptions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch global subscriptions' },
      { status: 500 }
    );
  }
}
