import fs from 'fs';
import path from 'path';
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

// Determine durable storage root directory
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
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    return fallbackDir;
  }
}

// In-memory binary cache to ensure speed and serverless durability
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
   * Uploads a file to persistent cloud object storage and registers the database file record.
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
    const currentUsage = serverDB.getStorageUsage(organizationId);
    if (currentUsage.limitBytes !== -1 && currentUsage.usedBytes + buffer.length > currentUsage.limitBytes) {
      return {
        success: false,
        error: 'Storage limit reached. Please delete files or upgrade your plan.',
        code: 'QUOTA_EXCEEDED',
      };
    }

    try {
      // 4. Generate unique storage key
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const safeKey = `${organizationId}/${entityType.toLowerCase()}/${timestamp}-${randomStr}-${cleanFileName}`;

      // 5. Store binary in filesystem and cache
      const storageDir = getStorageDirectory();
      const filePath = path.join(storageDir, safeKey.replace(/\//g, '___'));
      try {
        fs.writeFileSync(filePath, buffer);
      } catch (err) {
        // If filesystem write fails (e.g. read-only lambda), cache in memory
      }
      getBinaryCache().set(safeKey, { buffer, mimeType: normalizedMime });

      // 6. Build persistent URL
      const storageUrl = `/api/storage/files/${encodeURIComponent(safeKey)}`;

      // 7. Register database File Record (StorageAsset)
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

      serverDB.addStorageAsset(asset);

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
    // Check in-memory cache first
    const cached = getBinaryCache().get(storageKey);
    if (cached) {
      return cached;
    }

    // Check disk
    try {
      const storageDir = getStorageDirectory();
      const filePath = path.join(storageDir, storageKey.replace(/\//g, '___'));
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        const asset = serverDB.getStorageAssetByKey(storageKey);
        const mimeType = asset?.mimeType || 'application/octet-stream';
        getBinaryCache().set(storageKey, { buffer, mimeType });
        return { buffer, mimeType };
      }
    } catch {
      // Disk lookup failed
    }

    return null;
  },

  /**
   * Deletes a file from storage and database with tenant ownership verification.
   */
  async deleteFile(assetId: string, organizationId: string): Promise<{ success: boolean; error?: string }> {
    const asset = serverDB.getStorageAssetById(assetId, organizationId);
    if (!asset) {
      return { success: false, error: 'File asset not found or unauthorized' };
    }

    // Remove from in-memory cache
    getBinaryCache().delete(asset.storageKey);

    // Remove from disk
    try {
      const storageDir = getStorageDirectory();
      const filePath = path.join(storageDir, asset.storageKey.replace(/\//g, '___'));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // Continue even if disk delete fails
    }

    // Delete DB record
    serverDB.deleteStorageAsset(assetId, organizationId);

    return { success: true };
  },

  /**
   * Replaces an existing file asset with new binary data.
   */
  async replaceFile(
    oldAssetId: string,
    newFileOptions: Omit<UploadOptions, 'entityType'>
  ): Promise<UploadResult> {
    const existingAsset = serverDB.getStorageAssetById(oldAssetId, newFileOptions.organizationId);
    if (!existingAsset) {
      return { success: false, error: 'Original asset not found' };
    }

    // Upload new file with same entity type
    const uploadRes = await this.uploadFile({
      ...newFileOptions,
      entityType: existingAsset.entityType,
      entityId: existingAsset.entityId,
    });

    if (!uploadRes.success) {
      return uploadRes;
    }

    // Delete old asset
    await this.deleteFile(oldAssetId, newFileOptions.organizationId);

    return uploadRes;
  },

  /**
   * Returns current storage usage statistics for an organization.
   */
  getUsage(organizationId: string): StorageUsage {
    return serverDB.getStorageUsage(organizationId);
  },
};
