import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';
import { User, Role } from '@/types';

// GET /api/team — Get team members for current tenant
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgUsers = await serverDB.getUsers(session.organizationId);
    return NextResponse.json({ success: true, data: orgUsers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

// POST /api/team — Invite / Add team member with server-side limit check
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { name, email, role = 'AGENT', phone } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Server-side seat limit enforcement
    if (!session.isOwner) {
      const planLimits = serverDB.getOrgPlanLimits(session.organizationId);
      const currentUsers = await serverDB.getUsers(session.organizationId);
      if (currentUsers.length >= planLimits.maxUsers) {
        return NextResponse.json(
          {
            error: `User seat limit reached for your ${planLimits.name} plan (${planLimits.maxUsers} user seat${planLimits.maxUsers > 1 ? 's' : ''}). Please upgrade your subscription to add more team members.`,
            code: 'PLAN_LIMIT_EXCEEDED',
            currentCount: currentUsers.length,
            limit: planLimits.maxUsers,
          },
          { status: 403 }
        );
      }
    }

    const newUser: User = {
      id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '+91 63833 95915',
      role: (role as Role) || 'AGENT',
      organizationId: session.organizationId,
      isSuperAdmin: false,
    };

    await serverDB.addUser(newUser);

    return NextResponse.json({
      success: true,
      message: `Team member ${newUser.name} added successfully.`,
      data: newUser,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add team member' }, { status: 500 });
  }
}
