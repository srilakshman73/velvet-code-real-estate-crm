import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';
import { Lead } from '@/types';

// GET /api/leads
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const allLeads = serverDB.getLeads();

    // Master Owner can view all leads or filter by organization
    if (session.isOwner || session.role === 'OWNER') {
      const searchParams = request.nextUrl.searchParams;
      const orgFilter = searchParams.get('organization_id');
      const filtered = orgFilter
        ? allLeads.filter((l) => l.organizationId === orgFilter)
        : allLeads;
      return NextResponse.json({
        success: true,
        count: filtered.length,
        data: filtered,
      });
    }

    // Customer: Strictly filter by session organizationId
    const customerLeads = allLeads.filter(
      (l) => l.organizationId === session.organizationId
    );

    return NextResponse.json({
      success: true,
      count: customerLeads.length,
      data: customerLeads,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// POST /api/leads
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: 'Missing required lead fields: name, phone' },
        { status: 400 }
      );
    }

    // Enforce server-derived organizationId
    const effectiveOrgId = (session.isOwner && body.organizationId)
      ? body.organizationId
      : session.organizationId;

    const newLead: Lead = {
      id: `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      organizationId: effectiveOrgId,
      name: body.name,
      phone: body.phone,
      email: body.email || '',
      source: body.source || 'WEBSITE',
      status: body.status || 'NEW',
      priority: body.priority || 'MEDIUM',
      score: body.score || 65,
      budgetMinINR: body.budgetMinINR ? Number(body.budgetMinINR) : 5000000,
      budgetMaxINR: body.budgetMaxINR ? Number(body.budgetMaxINR) : 12000000,
      preferredLocation: body.preferredLocation || 'Chennai',
      preferredType: body.preferredType || 'APARTMENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    serverDB.addLead(newLead);

    return NextResponse.json(
      {
        success: true,
        message: 'Lead created successfully',
        data: newLead,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
