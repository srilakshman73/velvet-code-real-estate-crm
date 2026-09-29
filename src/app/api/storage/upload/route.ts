import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { cloudStorage } from '@/lib/storage-server';
import { StorageEntityType } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to upload files' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const entityType = (formData.get('entityType') as StorageEntityType) || 'OTHER';
    const entityId = formData.get('entityId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided in upload payload' },
        { status: 400 }
      );
    }

    // Convert Web File to Node Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Persistent Cloud Object Storage & register DB record
    const uploadResult = await cloudStorage.uploadFile({
      organizationId: session.organizationId,
      uploadedBy: session.userId,
      buffer,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      entityType,
      entityId: entityId || undefined,
    });

    if (!uploadResult.success) {
      const status = uploadResult.code === 'QUOTA_EXCEEDED' ? 403 : 400;
      return NextResponse.json(
        {
          error: uploadResult.error,
          code: uploadResult.code,
        },
        { status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'File uploaded and permanently saved to cloud storage.',
        asset: uploadResult.asset,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
