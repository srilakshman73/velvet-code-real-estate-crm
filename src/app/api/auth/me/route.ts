import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);

    if (!session) {
      return NextResponse.json(
        { authenticated: false, error: 'Unauthorized: No active session' },
        { status: 401 }
      );
    }

    const org = await serverDB.getOrganizationById(session.organizationId);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
        organizationId: session.organizationId,
        isSuperAdmin: session.isSuperAdmin,
      },
      organization: org || {
        id: session.organizationId,
        name: session.organizationName,
        slug: session.organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        country: 'India',
        businessType: 'AGENCY',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}
