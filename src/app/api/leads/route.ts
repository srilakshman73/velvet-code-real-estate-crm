import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';
import { verifyCustomerAccess } from '@/lib/subscription-gate';
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

    const access = await verifyCustomerAccess(session);
    if (!access.allowed) {
      return NextResponse.json(
        {
          error: 'Payment Required: 7-day free trial expired or subscription required to access CRM leads.',
          code: 'PAYMENT_REQUIRED',
          redirectUrl: '/app/billing',
        },
        { status: 402 }
      );
    }

    // Master Owner can view all leads or filter by organization
    if (session.isOwner || session.role === 'OWNER') {
      const searchParams = request.nextUrl.searchParams;
      const orgFilter = searchParams.get('organization_id');
      const leads = await serverDB.getLeads(orgFilter || undefined);
      return NextResponse.json({
        success: true,
        count: leads.length,
        data: leads,
      });
    }

    // Customer: Strictly filter by session organizationId
    const customerLeads = await serverDB.getLeads(session.organizationId);

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

    const access = await verifyCustomerAccess(session);
    if (!access.allowed) {
      return NextResponse.json(
        {
          error: 'Payment Required: 7-day free trial expired or subscription required to add leads.',
          code: 'PAYMENT_REQUIRED',
          redirectUrl: '/app/billing',
        },
        { status: 402 }
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
      const currentLeads = await serverDB.getLeads(effectiveOrgId);
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
      const orgUsers = await serverDB.getUsers(effectiveOrgId);
      const matchedUser = orgUsers.find((u) => u.id === body.assignedToId);
      if (matchedUser) {
        assignedName = matchedUser.name;
      }
    }

    let interestedPropName: string | undefined = undefined;
    if (body.interestedPropertyId) {
      const orgProps = await serverDB.getProperties(effectiveOrgId);
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

    // Await commit to persistent database
    await serverDB.addLead(newLead);

    return NextResponse.json(
      {
        success: true,
        message: 'Lead created successfully and committed to persistent database',
        data: newLead,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create lead in database' },
      { status: 500 }
    );
  }
}
