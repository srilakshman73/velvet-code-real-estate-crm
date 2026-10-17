import { NextRequest, NextResponse } from 'next/server';
import { cloudStorage } from '@/lib/storage-server';
import { serverDB } from '@/lib/server-db';

interface RouteContext {
  params: Promise<{ key: string[] }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { key } = await context.params;
    const fullKey = Array.isArray(key) ? key.join('/') : key;

    if (!fullKey) {
      return NextResponse.json({ error: 'Storage key required' }, { status: 400 });
    }

    const asset = await serverDB.getStorageAssetByKey(fullKey);

    // If file is stored on Vercel Blob or other CDN and not requesting download, redirect to CDN
    const isDownload = request.nextUrl.searchParams.get('download') === 'true';
    if (asset?.storageUrl && asset.storageUrl.startsWith('http') && !isDownload) {
      return NextResponse.redirect(asset.storageUrl, 307);
    }

    const fileData = await cloudStorage.getFile(fullKey);

    if (!fileData) {
      return NextResponse.json({ error: 'File not found in cloud storage' }, { status: 404 });
    }

    const fileName = asset?.originalFileName || asset?.fileName || 'download';

    const headers = new Headers();
    headers.set('Content-Type', fileData.mimeType || 'application/octet-stream');
    headers.set('Content-Length', fileData.buffer.length.toString());
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    if (isDownload) {
      headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    } else {
      headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(fileName)}"`);
    }

    return new NextResponse(new Uint8Array(fileData.buffer), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve storage file' },
      { status: 500 }
    );
  }
}
