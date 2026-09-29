import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, canDeleteRecord } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// DELETE /api/documents/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const docs = serverDB.getDocuments();
    const doc = docs.find((d) => d.id === id);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const authCheck = canDeleteRecord(session, doc.organizationId);
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.reason || 'Forbidden' }, { status: 403 });
    }

    serverDB.deleteDocument(id, session.isOwner ? undefined : session.organizationId);

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
