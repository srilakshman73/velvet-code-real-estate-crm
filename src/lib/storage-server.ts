import fs from 'fs';
import path from 'path';
import { put, del } from '@vercel/blob';
import { serverDB } from './server-db';
import { StorageAsset, StorageEntityType, StorageUsage } from '@/types';

// Allowed MIME types whitelist
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];
const ALL_ALLOWED_MIME_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];

// Max per-file upload limit: 10 MB
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// Fallback disk cache directory
function getStorageDirectory(): string {
  try {
    const primaryDir = path.join(process.cwd(), 'data', 'storage_objects');
    if (!fs.existsSync(primaryDir)) {
      fs.mkdirSync(primaryDir, { recursive: true });
    }
    return primaryDir;
  } catch {
    const fallbackDir = path.join('/tmp', 'velvet_storage_objects');
    if (!fs.existsSync(fallbackDir)) {
      try {
        fs.mkdirSync(fallbackDir, { recursive: true });
      } catch {}
    }
    return fallbackDir;
  }
}

// In-memory binary cache
declare global {
  var __velvetBinaryObjects: Map<string, { buffer: Buffer; mimeType: string }> | undefined;
}
function getBinaryCache() {
  if (!global.__velvetBinaryObjects) {
    global.__velvetBinaryObjects = new Map();
  }
  return global.__velvetBinaryObjects;
}

export interface UploadOptions {
  organizationId: string;
  uploadedBy?: string;
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  entityType: StorageEntityType;
  entityId?: string;
}

export interface UploadResult {
  success: boolean;
  asset?: StorageAsset;
  error?: string;
  code?: 'QUOTA_EXCEEDED' | 'INVALID_TYPE' | 'TOO_LARGE' | 'INTERNAL_ERROR';
}

export const cloudStorage = {
  /**
   * Uploads a file to permanent cloud object storage (Vercel Blob / Database / Fallback)
   * Enforces server-side validation: MIME type, file size, organization quota.
   */
  async uploadFile(options: UploadOptions): Promise<UploadResult> {
    const { organizationId, uploadedBy, buffer, fileName, mimeType, entityType, entityId } = options;

    // 1. Validate MIME type
    const normalizedMime = mimeType.toLowerCase();
    if (!ALL_ALLOWED_MIME_TYPES.includes(normalizedMime)) {
      return {
        success: false,
        error: `Unsupported file type (${mimeType}). Supported types: JPG, PNG, WebP, PDF, DOC, DOCX, CSV.`,
        code: 'INVALID_TYPE',
      };
    }

    // 2. Validate per-file size
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: `File size exceeds the 10MB limit (uploaded: ${(buffer.length / (1024 * 1024)).toFixed(1)}MB).`,
        code: 'TOO_LARGE',
      };
    }

    // 3. Enforce Server-Side Plan Storage Quota
    const currentUsage = await serverDB.getStorageUsage(organizationId);
    if (currentUsage.limitBytes !== -1 && currentUsage.usedBytes + buffer.length > currentUsage.limitBytes) {
      return {
        success: false,
        error: `Storage quota reached for your ${currentUsage.planName} plan (${(currentUsage.limitBytes / (1024 * 1024 * 1024)).toFixed(1)}GB). Please delete files or upgrade your subscription.`,
        code: 'QUOTA_EXCEEDED',
      };
    }

    try {
      // 4. Generate unique storage key
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const safeKey = `${organizationId}/${entityType.toLowerCase()}/${timestamp}-${randomStr}-${cleanFileName}`;

      let storageUrl = `/api/storage/files/${encodeURIComponent(safeKey)}`;

      // 5. Try Vercel Blob Storage first if token is available
      const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
      if (blobToken && blobToken.trim().length > 0) {
        try {
          const blob = await put(safeKey, buffer, {
            access: 'public',
            contentType: normalizedMime,
            token: blobToken,
          });
          if (blob && blob.url) {
            storageUrl = blob.url;
          }
        } catch (blobErr) {
          console.warn('Vercel Blob upload failed, falling back to database persistent storage:', blobErr);
        }
      }

      // 6. Cache in local memory & disk for fast fallback
      getBinaryCache().set(safeKey, { buffer, mimeType: normalizedMime });
      try {
        const storageDir = getStorageDirectory();
        const diskPath = path.join(storageDir, safeKey.replace(/\//g, '___'));
        fs.writeFileSync(diskPath, buffer);
      } catch {}

      // 7. Register database File Record with binary backup in PostgreSQL
      const asset: StorageAsset = {
        id: `asset-${Date.now()}-${randomStr}`,
        organizationId,
        uploadedBy: uploadedBy || 'system',
        fileName: cleanFileName,
        originalFileName: fileName,
        mimeType: normalizedMime,
        fileSize: buffer.length,
        storageKey: safeKey,
        storageUrl,
        entityType,
        entityId: entityId || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await serverDB.addStorageAsset(asset, buffer);

      return {
        success: true,
        asset,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to upload file to cloud storage',
        code: 'INTERNAL_ERROR',
      };
    }
  },

  /**
   * Retrieves binary file buffer and mime type for download/view.
   */
  async getFile(storageKey: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    // 1. Verify existence in persistent database (source of truth)
    const dbAsset = await serverDB.getStorageAssetByKey(storageKey);
    if (!dbAsset) {
      getBinaryCache().delete(storageKey);
      return null;
    }

    // 2. Check in-memory cache
    const cached = getBinaryCache().get(storageKey);
    if (cached) {
      return cached;
    }

    // 3. PostgreSQL binary_data bytea fallback
    if (dbAsset?.binaryData) {
      getBinaryCache().set(storageKey, { buffer: dbAsset.binaryData, mimeType: dbAsset.mimeType });
      return { buffer: dbAsset.binaryData, mimeType: dbAsset.mimeType };
    }

    // 4. If file was stored in Vercel Blob CDN, fetch it
    if (dbAsset?.storageUrl && dbAsset.storageUrl.startsWith('http')) {
      try {
        const res = await fetch(dbAsset.storageUrl);
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          getBinaryCache().set(storageKey, { buffer, mimeType: dbAsset.mimeType });
          return { buffer, mimeType: dbAsset.mimeType };
        }
      } catch {}
    }

    // 5. Check disk fallback
    try {
      const storageDir = getStorageDirectory();
      const filePath = path.join(storageDir, storageKey.replace(/\//g, '___'));
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        const mimeType = dbAsset?.mimeType || 'application/octet-stream';
        getBinaryCache().set(storageKey, { buffer, mimeType });
        return { buffer, mimeType };
      }
    } catch {}

    return null;
  },

  /**
   * Deletes a file from durable cloud storage and database with tenant ownership verification.
   */
  async deleteFile(assetIdOrKey: string, organizationId: string): Promise<{ success: boolean; error?: string }> {
    let asset = await serverDB.getStorageAssetById(assetIdOrKey, organizationId);
    if (!asset) {
      const byKey = await serverDB.getStorageAssetByKey(assetIdOrKey);
      if (byKey && byKey.organizationId === organizationId) {
        asset = byKey;
      }
    }

    if (!asset) {
      return { success: false, error: 'File asset not found or unauthorized' };
    }

    // 1. Delete from Vercel Blob if stored there
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (blobToken && asset.storageUrl.includes('blob.vercel-storage.com')) {
      try {
        await del(asset.storageUrl, { token: blobToken });
      } catch (err) {
        console.warn('Vercel Blob del error:', err);
      }
    }

    // 2. Clear cache
    getBinaryCache().delete(asset.storageKey);

    // 3. Remove disk fallback
    try {
      const storageDir = getStorageDirectory();
      const filePath = path.join(storageDir, asset.storageKey.replace(/\//g, '___'));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {}

    // 4. Mark deleted in database
    await serverDB.deleteStorageAsset(asset.id, organizationId);

    return { success: true };
  },

  /**
   * Safe file replacement: uploads new file first, commits, then removes old object.
   */
  async replaceFile(
    oldAssetIdOrKey: string,
    newFileOptions: UploadOptions
  ): Promise<{ success: boolean; asset?: StorageAsset; error?: string }> {
    let existingAsset = await serverDB.getStorageAssetById(oldAssetIdOrKey, newFileOptions.organizationId);
    if (!existingAsset) {
      const byKey = await serverDB.getStorageAssetByKey(oldAssetIdOrKey);
      if (byKey && byKey.organizationId === newFileOptions.organizationId) {
        existingAsset = byKey;
      }
    }

    if (!existingAsset) {
      return { success: false, error: 'Original file asset not found or unauthorized' };
    }

    // 1. Upload new file first
    const uploadResult = await this.uploadFile(newFileOptions);
    if (!uploadResult.success || !uploadResult.asset) {
      return uploadResult;
    }

    // 2. Safely remove old asset only after new upload succeeds
    await this.deleteFile(existingAsset.id, newFileOptions.organizationId);

    return {
      success: true,
      asset: uploadResult.asset,
    };
  },

  async getUsage(organizationId: string): Promise<StorageUsage> {
    return serverDB.getStorageUsage(organizationId);
  },
};
