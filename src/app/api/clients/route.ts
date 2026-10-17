import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';
import { verifyCustomerAccess } from '@/lib/subscription-gate';
import { Client } from '@/types';

// GET /api/clients
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const access = await verifyCustomerAccess(session);
    if (!access.allowed) {
      return NextResponse.json(
        {
          error: 'Payment Required: 7-day free trial expired or subscription required to access clients.',
          code: 'PAYMENT_REQUIRED',
          redirectUrl: '/app/billing',
        },
        { status: 402 }
      );
    }

    const orgId = session.isOwner ? request.nextUrl.searchParams.get('organizationId') || undefined : session.organizationId;
    const clients = await serverDB.getClients(orgId);

    return NextResponse.json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/clients
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const access = await verifyCustomerAccess(session);
    if (!access.allowed) {
      return NextResponse.json(
        {
          error: 'Payment Required: 7-day free trial expired or subscription required to add clients.',
          code: 'PAYMENT_REQUIRED',
          redirectUrl: '/app/billing',
        },
        { status: 402 }
      );
    }

    const body = await request.json();
    if (!body.name || !body.phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const effectiveOrgId = (session.isOwner && body.organizationId)
      ? body.organizationId
      : session.organizationId;

    const newClient: Client = {
      id: `client-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      organizationId: effectiveOrgId,
      name: String(body.name).trim(),
      phone: String(body.phone).trim(),
      email: body.email ? String(body.email).trim() : undefined,
      budgetINR: body.budgetINR ? Number(body.budgetINR) : undefined,
      preferredLocation: body.preferredLocation ? String(body.preferredLocation).trim() : undefined,
      preferredType: body.preferredType || undefined,
      requirements: body.requirements ? String(body.requirements).trim() : undefined,
      notes: body.notes ? String(body.notes).trim() : undefined,
      totalDealsCount: 0,
      totalDealsValueINR: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await serverDB.addClient(newClient);

    return NextResponse.json(
      { success: true, message: 'Client created successfully in database', data: newClient },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
