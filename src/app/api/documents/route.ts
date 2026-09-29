import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';
import { DocumentRecord } from '@/types';

// GET /api/documents
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = session.isOwner ? request.nextUrl.searchParams.get('organizationId') || session.organizationId : session.organizationId;
    const documents = serverDB.getDocuments(orgId);

    return NextResponse.json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/documents
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.title || !body.fileUrl) {
      return NextResponse.json({ error: 'Title and fileUrl are required' }, { status: 400 });
    }

    const effectiveOrgId = (session.isOwner && body.organizationId)
      ? body.organizationId
      : session.organizationId;

    const newDoc: DocumentRecord = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      organizationId: effectiveOrgId,
      title: String(body.title).trim(),
      category: body.category || 'PROPERTY',
      fileUrl: String(body.fileUrl).trim(),
      fileSizeMB: body.fileSizeMB ? Number(body.fileSizeMB) : 1.5,
      fileType: body.fileType ? String(body.fileType).toUpperCase() : 'PDF',
      relatedName: body.relatedName ? String(body.relatedName).trim() : undefined,
      createdAt: new Date().toISOString(),
    };

    serverDB.addDocument(newDoc);

    return NextResponse.json(
      { success: true, message: 'Document registered successfully', data: newDoc },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
