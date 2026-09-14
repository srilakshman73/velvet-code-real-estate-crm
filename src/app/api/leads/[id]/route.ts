import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, canDeleteRecord } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/leads/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(request);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const allLeads = serverDB.getLeads();
    const lead = allLeads.find((l) => l.id === id);

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    if (!session.isOwner && session.role !== 'OWNER' && lead.organizationId !== session.organizationId) {
      return NextResponse.json(
        {
          error: 'Forbidden: You do not have access to leads belonging to another organization',
          code: 'TENANT_MISMATCH',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve lead' },
      { status: 500 }
    );
  }
}

// DELETE /api/leads/[id]
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

    const allLeads = serverDB.getLeads();
    const lead = allLeads.find((l) => l.id === id);

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    const authCheck = canDeleteRecord(session, lead.organizationId);
    if (!authCheck.allowed) {
      return NextResponse.json(
        {
          error: authCheck.reason || 'Forbidden: You do not have permission to delete this lead.',
          code: 'FORBIDDEN_DELETE',
        },
        { status: 403 }
      );
    }

    const deleted = serverDB.deleteLead(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete lead' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Lead '${lead.name}' successfully deleted.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
