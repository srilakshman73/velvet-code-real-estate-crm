import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';
import { NotificationItem } from '@/types';

// GET /api/notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = session.isOwner ? request.nextUrl.searchParams.get('organizationId') || session.organizationId : session.organizationId;
    const notifications = serverDB.getNotifications(orgId, session.userId);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/notifications — Create new notification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.title || !body.message) {
      return NextResponse.json({ error: 'Title and message required' }, { status: 400 });
    }

    const notif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      organizationId: session.organizationId,
      userId: body.userId || session.userId,
      title: String(body.title).trim(),
      message: String(body.message).trim(),
      type: body.type || 'APPOINTMENT',
      isRead: false,
      link: body.link || undefined,
      relatedEntityType: body.relatedEntityType || undefined,
      relatedEntityId: body.relatedEntityId || undefined,
      metadata: body.metadata || undefined,
      createdAt: new Date().toISOString(),
    };

    serverDB.addNotification(notif);

    return NextResponse.json({ success: true, data: notif }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/notifications — Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (body.markAll) {
      serverDB.markAllNotificationsRead(session.organizationId);
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (body.id) {
      const ok = serverDB.markNotificationRead(body.id, session.organizationId);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ error: 'Invalid payload: provide id or markAll' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/notifications — Dismiss a notification
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }

    serverDB.deleteNotification(id, session.isOwner ? undefined : session.organizationId);
    return NextResponse.json({ success: true, message: 'Notification dismissed' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
