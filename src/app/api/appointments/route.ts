import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';
import { verifyCustomerAccess } from '@/lib/subscription-gate';
import { Appointment } from '@/types';

// GET /api/appointments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const access = await verifyCustomerAccess(session);
    if (!access.allowed) {
      return NextResponse.json(
        {
          error: 'Payment Required: 7-day free trial expired or subscription required to access appointments.',
          code: 'PAYMENT_REQUIRED',
          redirectUrl: '/app/billing',
        },
        { status: 402 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get('clientId') || undefined;
    const leadId = searchParams.get('leadId') || undefined;
    const propertyId = searchParams.get('propertyId') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const requestedOrg = (session.isOwner && searchParams.get('organizationId'))
      ? searchParams.get('organizationId')!
      : session.organizationId;

    const appointments = await serverDB.getAppointments(requestedOrg, {
      clientId,
      leadId,
      propertyId,
      startDate,
      endDate,
    });

    return NextResponse.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch appointments' }, { status: 500 });
  }
}

// POST /api/appointments
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const access = await verifyCustomerAccess(session);
    if (!access.allowed) {
      return NextResponse.json(
        {
          error: 'Payment Required: 7-day free trial expired or subscription required to schedule appointments.',
          code: 'PAYMENT_REQUIRED',
          redirectUrl: '/app/billing',
        },
        { status: 402 }
      );
    }

    const body = await request.json();

    if (!body.title || !body.startAt) {
      return NextResponse.json(
        { error: 'Missing required appointment fields: title, startAt' },
        { status: 400 }
      );
    }

    const effectiveOrgId = (session.isOwner && body.organizationId)
      ? body.organizationId
      : session.organizationId;

    let clientName = body.clientName;
    if (body.clientId && !clientName) {
      const client = await serverDB.getClientById(body.clientId, effectiveOrgId);
      if (client) clientName = client.name;
    }

    let leadName = body.leadName;
    if (body.leadId && !leadName) {
      const lead = await serverDB.getLeadById(body.leadId, effectiveOrgId);
      if (lead) leadName = lead.name;
    }

    let propTitle = body.propertyTitle;
    if (body.propertyId && !propTitle) {
      const prop = (await serverDB.getProperties(effectiveOrgId)).find((p) => p.id === body.propertyId);
      if (prop) propTitle = prop.title;
    }

    let agentName = body.assignedUserName;
    if (body.assignedUserId && !agentName) {
      const users = await serverDB.getUsers(effectiveOrgId);
      const user = users.find((u) => u.id === body.assignedUserId);
      if (user) agentName = user.name;
    }

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      organizationId: effectiveOrgId,
      createdBy: session.userId,
      leadId: body.leadId || undefined,
      leadName: leadName || undefined,
      clientId: body.clientId || undefined,
      clientName: clientName || undefined,
      propertyId: body.propertyId || undefined,
      propertyTitle: propTitle || undefined,
      assignedUserId: body.assignedUserId || session.userId,
      assignedUserName: agentName || session.name,
      title: String(body.title).trim(),
      description: body.description ? String(body.description).trim() : (body.notes ? String(body.notes).trim() : undefined),
      appointmentType: body.appointmentType || 'SITE_VISIT',
      status: body.status || 'SCHEDULED',
      startAt: body.startAt,
      endAt: body.endAt || new Date(new Date(body.startAt).getTime() + (body.durationMinutes || 60) * 60000).toISOString(),
      location: body.location ? String(body.location).trim() : undefined,
      reminderMinutes: body.reminderMinutes || 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await serverDB.addAppointment(newAppointment);

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment scheduled and saved to database',
        data: newAppointment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to schedule appointment' },
      { status: 500 }
    );
  }
}
