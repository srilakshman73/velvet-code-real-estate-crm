import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, getOwnerEmail } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';
import { OwnerMonitoringUser } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. STRICT SERVER-SIDE OWNER VERIFICATION
    const session = await getServerSession(request);
    const ownerEmail = getOwnerEmail();

    if (!session || !session.isOwner || session.role !== 'OWNER' || session.email.toLowerCase() !== ownerEmail) {
      return NextResponse.json(
        {
          error: 'Forbidden: Master platform owner credentials required to monitor registered users.',
          code: 'OWNER_PRIVILEGE_REQUIRED',
        },
        { status: 403 }
      );
    }

    // 2. RETRIEVE ALL REGISTERED CUSTOMERS FROM PERSISTENT DATABASE
    const allUsers: OwnerMonitoringUser[] = await serverDB.getRegisteredUsersForOwner();

    // Calculate global overview metrics across the entire platform
    const totalUsers = allUsers.length;
    const activeTrials = allUsers.filter((u) => u.subscriptionStatus === 'TRIALING' && u.isTrialActive).length;
    const paidSubscribers = allUsers.filter((u) => u.subscriptionStatus === 'ACTIVE').length;
    const uniqueOrgs = new Set(allUsers.map((u) => u.organizationId)).size;

    // 3. APPLY FILTERS
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const statusFilter = (searchParams.get('status') || 'ALL').toUpperCase();
    const planFilter = (searchParams.get('plan') || 'ALL').toUpperCase();
    const sortBy = (searchParams.get('sort') || 'newest').toLowerCase();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10', 10)));

    let filtered = allUsers.filter((user) => {
      // Search filter across name, email, and organization
      if (search) {
        const matchesName = user.name.toLowerCase().includes(search);
        const matchesEmail = user.email.toLowerCase().includes(search);
        const matchesOrg = user.organizationName.toLowerCase().includes(search);
        const matchesPhone = user.phone.toLowerCase().includes(search);
        if (!matchesName && !matchesEmail && !matchesOrg && !matchesPhone) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'TRIALING') {
          if (user.subscriptionStatus !== 'TRIALING' || !user.isTrialActive) return false;
        } else if (statusFilter === 'ACTIVE') {
          if (user.subscriptionStatus !== 'ACTIVE') return false;
        } else if (statusFilter === 'PAST_DUE') {
          if (user.subscriptionStatus !== 'PAST_DUE') return false;
        } else if (statusFilter === 'EXPIRED') {
          const isExpiredTrial = user.subscriptionStatus === 'TRIALING' && !user.isTrialActive;
          const isCanceled = user.subscriptionStatus === 'CANCELED' || user.subscriptionStatus === 'UNPAID';
          if (!isExpiredTrial && !isCanceled) return false;
        }
      }

      // Plan filter
      if (planFilter !== 'ALL') {
        if (user.planTier !== planFilter) {
          return false;
        }
      }

      return true;
    });

    // 4. SORTING
    filtered.sort((a, b) => {
      if (sortBy === 'oldest') {
        const dateA = new Date(a.registrationDate).getTime() || 0;
        const dateB = new Date(b.registrationDate).getTime() || 0;
        return dateA - dateB;
      } else if (sortBy === 'lastlogin') {
        const dateA = new Date(a.lastLoginAt).getTime() || 0;
        const dateB = new Date(b.lastLoginAt).getTime() || 0;
        return dateB - dateA;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'organization') {
        return a.organizationName.localeCompare(b.organizationName);
      } else {
        // default: newest first
        const dateA = new Date(a.registrationDate).getTime() || 0;
        const dateB = new Date(b.registrationDate).getTime() || 0;
        return dateB - dateA;
      }
    });

    // 5. PAGINATION
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedUsers = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      users: paginatedUsers,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
      },
      metrics: {
        totalUsers,
        activeTrials,
        paidSubscribers,
        totalOrganizations: uniqueOrgs,
      },
    });
  } catch (error) {
    console.error('Owner users API error:', error);
    return NextResponse.json(
      { error: 'Internal server error while retrieving platform users' },
      { status: 500 }
    );
  }
}
