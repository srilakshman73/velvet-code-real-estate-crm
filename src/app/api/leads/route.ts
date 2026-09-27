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

    // Server-side Plan Limits Enforcement
    if (!session.isOwner) {
      const planLimits = serverDB.getOrgPlanLimits(effectiveOrgId);
      const currentLeads = serverDB.getLeads().filter((l) => l.organizationId === effectiveOrgId);
      if (planLimits.maxLeads !== -1 && currentLeads.length >= planLimits.maxLeads) {
        return NextResponse.json(
          {
            error: `Lead limit reached for your ${planLimits.name} plan (${planLimits.maxLeads} leads). Please upgrade your subscription to add more leads.`,
            code: 'PLAN_LIMIT_EXCEEDED',
            currentCount: currentLeads.length,
            limit: planLimits.maxLeads,
          },
          { status: 403 }
        );
      }
    }

    // Data validation
    const parsedBudgetMax = body.budgetMaxINR !== undefined && body.budgetMaxINR !== null && body.budgetMaxINR !== ''
      ? Math.max(0, parseInt(String(body.budgetMaxINR).replace(/\D/g, ''), 10))
      : undefined;

    const parsedBudgetMin = body.budgetMinINR !== undefined && body.budgetMinINR !== null && body.budgetMinINR !== ''
      ? Math.max(0, parseInt(String(body.budgetMinINR).replace(/\D/g, ''), 10))
      : undefined;

    // Relational integrity checks
    let assignedName: string | undefined = undefined;
    if (body.assignedToId) {
      const orgUsers = serverDB.getUsers().filter((u) => u.organizationId === effectiveOrgId);
      const matchedUser = orgUsers.find((u) => u.id === body.assignedToId);
      if (matchedUser) {
        assignedName = matchedUser.name;
      }
    }

    let interestedPropName: string | undefined = undefined;
    if (body.interestedPropertyId) {
      const orgProps = serverDB.getProperties().filter((p) => p.organizationId === effectiveOrgId);
      const matchedProp = orgProps.find((p) => p.id === body.interestedPropertyId);
      if (matchedProp) {
        interestedPropName = matchedProp.title;
      }
    }

    const newLead: Lead = {
      id: `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      organizationId: effectiveOrgId,
      name: String(body.name).trim(),
      phone: String(body.phone).trim(),
      email: body.email ? String(body.email).trim() : '',
      source: body.source ? String(body.source).trim() : 'WEBSITE',
      status: body.status ? String(body.status).trim() : 'NEW',
      priority: body.priority || 'MEDIUM',
      score: body.score ? Number(body.score) : Math.floor(Math.random() * 30) + 65,
      budgetMinINR: isNaN(Number(parsedBudgetMin)) ? undefined : parsedBudgetMin,
      budgetMaxINR: isNaN(Number(parsedBudgetMax)) ? undefined : parsedBudgetMax,
      preferredLocation: body.preferredLocation ? String(body.preferredLocation).trim() : undefined,
      preferredType: body.preferredType || undefined,
      interestedPropertyId: body.interestedPropertyId || undefined,
      interestedPropertyName: interestedPropName || body.interestedPropertyName || undefined,
      assignedToId: body.assignedToId || undefined,
      assignedToName: assignedName || body.assignedToName || undefined,
      notes: body.notes ? String(body.notes).trim() : undefined,
      imageUrl: body.imageUrl || undefined,
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
