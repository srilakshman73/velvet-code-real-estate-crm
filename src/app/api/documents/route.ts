import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';
import { verifyCustomerAccess } from '@/lib/subscription-gate';
import { DocumentRecord } from '@/types';

// GET /api/documents
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
          error: 'Payment Required: 7-day free trial expired or subscription required to access documents.',
          code: 'PAYMENT_REQUIRED',
          redirectUrl: '/app/billing',
        },
        { status: 402 }
      );
    }

    const orgId = session.isOwner ? request.nextUrl.searchParams.get('organizationId') || undefined : session.organizationId;
    const documents = await serverDB.getDocuments(orgId);

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

    const access = await verifyCustomerAccess(session);
    if (!access.allowed) {
      return NextResponse.json(
        {
          error: 'Payment Required: 7-day free trial expired or subscription required to add documents.',
          code: 'PAYMENT_REQUIRED',
          redirectUrl: '/app/billing',
        },
        { status: 402 }
      );
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

    await serverDB.addDocument(newDoc);

    return NextResponse.json(
      { success: true, message: 'Document registered successfully in database', data: newDoc },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
