import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// DELETE /api/admin/organizations/[id] (Master Platform Owner ONLY)
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(request);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    // STRICT OWNER CHECK
    if (!session.isOwner && session.role !== 'OWNER') {
      return NextResponse.json(
        {
          error: 'Forbidden: Only the Velvet Code Platform Owner can delete customer organizations.',
          code: 'OWNER_PRIVILEGE_REQUIRED',
        },
        { status: 403 }
      );
    }

    const allOrgs = serverDB.getOrganizations();
    const targetOrg = allOrgs.find((o) => o.id === id);

    if (!targetOrg) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Prevent Owner from deleting master root organization
    if (targetOrg.id === 'org-root-00' || targetOrg.name.includes('Velvet Code')) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot delete Velvet Code HQ root organization.' },
        { status: 400 }
      );
    }

    const deleted = serverDB.deleteOrganization(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete organization' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Organization '${targetOrg.name}' and all associated tenant records successfully removed.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
