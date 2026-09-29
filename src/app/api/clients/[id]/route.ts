import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, canDeleteRecord } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/clients/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = serverDB.getClientById(id);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    if (!session.isOwner && session.organizationId !== client.organizationId) {
      return NextResponse.json({ error: 'Forbidden: Tenant mismatch' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: client });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/clients/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = serverDB.getClientById(id);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    if (!session.isOwner && session.organizationId !== client.organizationId) {
      return NextResponse.json({ error: 'Forbidden: Tenant mismatch' }, { status: 403 });
    }

    const body = await request.json();

    const updated = serverDB.updateClient(
      id,
      {
        name: body.name !== undefined ? String(body.name).trim() : client.name,
        phone: body.phone !== undefined ? String(body.phone).trim() : client.phone,
        email: body.email !== undefined ? String(body.email).trim() : client.email,
        budgetINR: body.budgetINR !== undefined ? Number(body.budgetINR) : client.budgetINR,
        preferredLocation: body.preferredLocation !== undefined ? body.preferredLocation : client.preferredLocation,
        preferredType: body.preferredType || client.preferredType,
        requirements: body.requirements !== undefined ? body.requirements : client.requirements,
        notes: body.notes !== undefined ? body.notes : client.notes,
      },
      session.isOwner ? undefined : session.organizationId
    );

    return NextResponse.json({ success: true, message: 'Client updated successfully', data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/clients/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = serverDB.getClientById(id);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const authCheck = canDeleteRecord(session, client.organizationId);
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.reason || 'Forbidden' }, { status: 403 });
    }

    serverDB.deleteClient(id, session.isOwner ? undefined : session.organizationId);

    return NextResponse.json({ success: true, message: 'Client deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
