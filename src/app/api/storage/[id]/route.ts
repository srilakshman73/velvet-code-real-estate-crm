import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, canDeleteRecord } from '@/lib/auth-server';
import { serverDB } from '@/lib/server-db';
import { cloudStorage } from '@/lib/storage-server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/storage/[id] — Retrieve asset metadata
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const asset = serverDB.getStorageAssetById(id, session.isOwner ? undefined : session.organizationId);
    if (!asset) {
      return NextResponse.json({ error: 'Storage asset not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: asset });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/storage/[id] — Permanently delete asset with tenant authorization
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const asset = serverDB.getStorageAssetById(id);
    if (!asset) {
      return NextResponse.json({ error: 'Storage asset not found' }, { status: 404 });
    }

    const authCheck = canDeleteRecord(session, asset.organizationId);
    if (!authCheck.allowed) {
      return NextResponse.json(
        { error: authCheck.reason || 'Forbidden: Cannot delete this file' },
        { status: 403 }
      );
    }

    const result = await cloudStorage.deleteFile(id, asset.organizationId);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to delete file' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `File '${asset.fileName}' permanently deleted from cloud storage.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/storage/[id] — Replace asset with new uploaded file
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingAsset = serverDB.getStorageAssetById(id);
    if (!existingAsset) {
      return NextResponse.json({ error: 'Storage asset not found' }, { status: 404 });
    }

    if (!session.isOwner && session.organizationId !== existingAsset.organizationId) {
      return NextResponse.json({ error: 'Forbidden: Tenant mismatch' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No replacement file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const replaceResult = await cloudStorage.replaceFile(id, {
      organizationId: existingAsset.organizationId,
      uploadedBy: session.userId,
      buffer,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      entityId: existingAsset.entityId,
    });

    if (!replaceResult.success) {
      return NextResponse.json(
        { error: replaceResult.error, code: replaceResult.code },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File successfully replaced.',
      asset: replaceResult.asset,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
