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

// PUT /api/leads/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
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

    const body = await request.json();

    const parsedBudgetMax = body.budgetMaxINR !== undefined && body.budgetMaxINR !== null && body.budgetMaxINR !== ''
      ? Math.max(0, parseInt(String(body.budgetMaxINR).replace(/\D/g, ''), 10))
      : lead.budgetMaxINR;

    const parsedBudgetMin = body.budgetMinINR !== undefined && body.budgetMinINR !== null && body.budgetMinINR !== ''
      ? Math.max(0, parseInt(String(body.budgetMinINR).replace(/\D/g, ''), 10))
      : lead.budgetMinINR;

    const updatedLead = {
      ...lead,
      name: body.name !== undefined ? String(body.name).trim() : lead.name,
      phone: body.phone !== undefined ? String(body.phone).trim() : lead.phone,
      email: body.email !== undefined ? String(body.email).trim() : lead.email,
      source: body.source !== undefined ? String(body.source).trim() : lead.source,
      status: body.status !== undefined ? String(body.status).trim() : lead.status,
      priority: body.priority !== undefined ? body.priority : lead.priority,
      budgetMinINR: isNaN(Number(parsedBudgetMin)) ? undefined : parsedBudgetMin,
      budgetMaxINR: isNaN(Number(parsedBudgetMax)) ? undefined : parsedBudgetMax,
      preferredLocation: body.preferredLocation !== undefined ? String(body.preferredLocation).trim() : lead.preferredLocation,
      preferredType: body.preferredType !== undefined ? body.preferredType : lead.preferredType,
      interestedPropertyId: body.interestedPropertyId !== undefined ? body.interestedPropertyId : lead.interestedPropertyId,
      interestedPropertyName: body.interestedPropertyName !== undefined ? body.interestedPropertyName : lead.interestedPropertyName,
      assignedToId: body.assignedToId !== undefined ? body.assignedToId : lead.assignedToId,
      assignedToName: body.assignedToName !== undefined ? body.assignedToName : lead.assignedToName,
      notes: body.notes !== undefined ? String(body.notes).trim() : lead.notes,
      imageUrl: body.imageUrl !== undefined ? body.imageUrl : lead.imageUrl,
      score: body.score !== undefined ? Number(body.score) : lead.score,
      updatedAt: new Date().toISOString(),
    };

    const index = allLeads.findIndex((l) => l.id === id);
    if (index >= 0) {
      allLeads[index] = updatedLead;
    }

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
      data: updatedLead,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

// PATCH /api/leads/[id]
export async function PATCH(request: NextRequest, context: RouteContext) {
  return PUT(request, context);
}

