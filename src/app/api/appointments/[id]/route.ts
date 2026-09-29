import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, canDeleteRecord } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/appointments/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointment = serverDB.getAppointmentById(id);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (!session.isOwner && session.organizationId !== appointment.organizationId) {
      return NextResponse.json({ error: 'Forbidden: Tenant mismatch' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: appointment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/appointments/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointment = serverDB.getAppointmentById(id);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (!session.isOwner && session.organizationId !== appointment.organizationId) {
      return NextResponse.json({ error: 'Forbidden: Tenant mismatch' }, { status: 403 });
    }

    const body = await request.json();

    const updated = serverDB.updateAppointment(
      id,
      {
        title: body.title !== undefined ? String(body.title).trim() : appointment.title,
        description: body.description !== undefined ? body.description : appointment.description,
        appointmentType: body.appointmentType || appointment.appointmentType,
        startAt: body.startAt ? new Date(body.startAt).toISOString() : appointment.startAt,
        endAt: body.endAt ? new Date(body.endAt).toISOString() : appointment.endAt,
        location: body.location !== undefined ? body.location : appointment.location,
        status: body.status || appointment.status,
        reminderMinutes: body.reminderMinutes !== undefined ? Number(body.reminderMinutes) : appointment.reminderMinutes,
        assignedUserId: body.assignedUserId || appointment.assignedUserId,
        assignedUserName: body.assignedUserName || appointment.assignedUserName,
        leadId: body.leadId !== undefined ? body.leadId : appointment.leadId,
        leadName: body.leadName !== undefined ? body.leadName : appointment.leadName,
        clientId: body.clientId !== undefined ? body.clientId : appointment.clientId,
        clientName: body.clientName !== undefined ? body.clientName : appointment.clientName,
        propertyId: body.propertyId !== undefined ? body.propertyId : appointment.propertyId,
        propertyTitle: body.propertyTitle !== undefined ? body.propertyTitle : appointment.propertyTitle,
      },
      session.isOwner ? undefined : session.organizationId
    );

    return NextResponse.json({
      success: true,
      message: 'Appointment successfully updated.',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/appointments/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointment = serverDB.getAppointmentById(id);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const authCheck = canDeleteRecord(session, appointment.organizationId);
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.reason || 'Forbidden' }, { status: 403 });
    }

    serverDB.deleteAppointment(id, session.isOwner ? undefined : session.organizationId);

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
