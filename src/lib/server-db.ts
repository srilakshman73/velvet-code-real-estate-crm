import fs from 'fs';
import path from 'path';
import { put, head, get, list, del } from '@vercel/blob';
import {
  INITIAL_ORGANIZATIONS,
  INITIAL_USERS,
  INITIAL_PROPERTIES,
  INITIAL_LEADS,
  INITIAL_CLIENTS,
  INITIAL_DEALS,
  INITIAL_SUBSCRIPTION,
  INITIAL_PAYMENTS,
  INITIAL_INVOICES,
  INITIAL_APPOINTMENTS,
  INITIAL_STORAGE_ASSETS,
  INITIAL_NOTIFICATIONS,
  INITIAL_DOCUMENTS,
  SAAS_PLANS,
} from './mock-data';
import {
  Property,
  Lead,
  Client,
  Deal,
  Organization,
  User,
  Subscription,
  Payment,
  Invoice,
  PlanLimits,
  Appointment,
  StorageAsset,
  NotificationItem,
  DocumentRecord,
  StorageUsage,
  SubscriptionTier,
  SubscriptionStatus,
  OwnerMonitoringUser,
} from '@/types';
import { getPgPool, initPostgresSchema, isPostgresConfigured } from './db';

export interface VelvetDBSchema {
  organizations: Organization[];
  users: User[];
  properties: Property[];
  leads: Lead[];
  clients: Client[];
  deals: Deal[];
  subscriptions: Subscription[];
  payments: Payment[];
  invoices: Invoice[];
  appointments: Appointment[];
  storageAssets: StorageAsset[];
  notifications: NotificationItem[];
  documents: DocumentRecord[];
  aiRequestsUsed: Record<string, number>;
  processedWebhooks: string[];
}

declare global {
  var __velvetServerDB: VelvetDBSchema | undefined;
  var __velvetLastCloudSync: number | undefined;
  var __velvetCloudSyncPromise: Promise<void> | undefined;
}

const CLOUD_MASTER_KEY = 'velvet_db_cloud_master.json';
const STATE_PREFIX = 'velvet_state_';

function getPersistenceFilePath(): string {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return path.join(dataDir, 'velvet-db.json');
  } catch {
    const tmpDir = path.join('/tmp', 'velvet_data');
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir, { recursive: true });
      } catch {}
    }
    return path.join(tmpDir, 'velvet-db.json');
  }
}

function saveDBToDisk(db: VelvetDBSchema) {
  try {
    const filePath = getPersistenceFilePath();
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {}

  // Non-blocking versioned background save
  saveDBToDiskAndCloud(db).catch(() => {});
}

export async function saveDBToDiskAndCloud(db: VelvetDBSchema): Promise<void> {
  // 1. Write local disk immediately
  try {
    const filePath = getPersistenceFilePath();
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {}

  // 2. Write to Vercel Blob with versioned key for instant cache-free cross-lambda read consistency
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token && token.trim().length > 0) {
    try {
      const versionKey = `${STATE_PREFIX}${Date.now()}.json`;
      await put(versionKey, JSON.stringify(db), {
        access: 'public',
        token,
        addRandomSuffix: false,
      });

      // Update static master blob for external consumers/inspectors
      put(CLOUD_MASTER_KEY, JSON.stringify(db), {
        access: 'public',
        token,
        addRandomSuffix: false,
        allowOverwrite: true,
      }).catch(() => {});

      global.__velvetLastCloudSync = Date.now();

      // Prune old versions in background (retain latest 3 versions for redundancy)
      list({ prefix: STATE_PREFIX, token }).then((res) => {
        if (res.blobs && res.blobs.length > 3) {
          const sorted = res.blobs.sort(
            (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          );
          const toDelete = sorted.slice(3).map((b) => b.url);
          if (toDelete.length > 0) {
            del(toDelete, { token }).catch(() => {});
          }
        }
      }).catch(() => {});
    } catch (err) {
      console.warn('Vercel Blob cloud DB backup warning:', err);
    }
  }
}

export async function ensureCloudSynced(forceRefresh = false): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token || token.trim().length === 0) return;

  const now = Date.now();
  if (!forceRefresh && global.__velvetLastCloudSync && now - global.__velvetLastCloudSync < 3000) {
    return;
  }

  if (global.__velvetCloudSyncPromise) {
    return global.__velvetCloudSyncPromise;
  }

  global.__velvetCloudSyncPromise = (async () => {
    try {
      let cloudData: Partial<VelvetDBSchema> | null = null;

      // Method 1: Find the latest state blob via list() (100% cache-free direct REST API)
      try {
        const listRes = await list({ prefix: STATE_PREFIX, token });
        if (listRes.blobs && listRes.blobs.length > 0) {
          const sorted = listRes.blobs.sort(
            (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          );
          const latest = sorted[0];
          const fetchRes = await fetch(latest.url, { cache: 'no-store' });
          if (fetchRes.ok) {
            cloudData = await fetchRes.json();
          }
        }
      } catch (listErr) {}

      // Method 2: Fallback to static master key if no versioned state found
      if (!cloudData) {
        try {
          const blobRes = await get(CLOUD_MASTER_KEY, { access: 'public', useCache: false, token });
          if (blobRes && blobRes.statusCode === 200 && blobRes.stream) {
            const text = await new Response(blobRes.stream).text();
            cloudData = JSON.parse(text);
          }
        } catch {}
      }

      // Method 3: Fallback to direct URL fetch
      if (!cloudData) {
        const storeId = process.env.BLOB_STORE_ID;
        const cloudUrl = storeId
          ? `https://${storeId.replace('store_', '').toLowerCase()}.public.blob.vercel-storage.com/${CLOUD_MASTER_KEY}`
          : null;
        if (cloudUrl) {
          const res = await fetch(cloudUrl, {
            cache: 'no-store',
            headers: { 'cache-control': 'no-cache, no-store, must-revalidate', pragma: 'no-cache' },
          });
          if (res.ok) {
            cloudData = await res.json();
          }
        }
      }

      if (cloudData && typeof cloudData === 'object') {
        const db = initMemoryDB();
        if (cloudData.users && Array.isArray(cloudData.users)) {
          for (const u of cloudData.users) {
            if (!u.email) continue;
            const idx = db.users.findIndex(
              (x) => (x.id && x.id === u.id) || (x.email && x.email.toLowerCase() === u.email.toLowerCase())
            );
            if (idx >= 0) {
              db.users[idx] = {
                ...db.users[idx],
                ...u,
                passwordHash: u.passwordHash || db.users[idx].passwordHash,
              };
            } else {
              db.users.push(u);
            }
          }
        }
        if (cloudData.organizations && Array.isArray(cloudData.organizations)) {
          for (const o of cloudData.organizations) {
            const idx = db.organizations.findIndex((x) => x.id === o.id);
            if (idx >= 0) db.organizations[idx] = { ...db.organizations[idx], ...o };
            else db.organizations.push(o);
          }
        }
        if (cloudData.subscriptions && Array.isArray(cloudData.subscriptions)) {
          for (const s of cloudData.subscriptions) {
            const idx = db.subscriptions.findIndex(
              (x) => x.id === s.id || x.organizationId === s.organizationId
            );
            if (idx >= 0) db.subscriptions[idx] = { ...db.subscriptions[idx], ...s };
            else db.subscriptions.push(s);
          }
        }
        if (cloudData.leads && Array.isArray(cloudData.leads)) {
          for (const l of cloudData.leads) {
            const idx = db.leads.findIndex((x) => x.id === l.id);
            if (idx >= 0) db.leads[idx] = { ...db.leads[idx], ...l };
            else db.leads.push(l);
          }
        }
        if (cloudData.properties && Array.isArray(cloudData.properties)) {
          for (const p of cloudData.properties) {
            const idx = db.properties.findIndex((x) => x.id === p.id);
            if (idx >= 0) db.properties[idx] = { ...db.properties[idx], ...p };
            else db.properties.push(p);
          }
        }
        if (cloudData.clients && Array.isArray(cloudData.clients)) {
          for (const c of cloudData.clients) {
            const idx = db.clients.findIndex((x) => x.id === c.id);
            if (idx >= 0) db.clients[idx] = { ...db.clients[idx], ...c };
            else db.clients.push(c);
          }
        }
        if (cloudData.appointments && Array.isArray(cloudData.appointments)) {
          for (const a of cloudData.appointments) {
            const idx = db.appointments.findIndex((x) => x.id === a.id);
            if (idx >= 0) db.appointments[idx] = { ...db.appointments[idx], ...a };
            else db.appointments.push(a);
          }
        }
        if (cloudData.documents && Array.isArray(cloudData.documents)) {
          for (const d of cloudData.documents) {
            const idx = db.documents.findIndex((x) => x.id === d.id);
            if (idx >= 0) db.documents[idx] = { ...db.documents[idx], ...d };
            else db.documents.push(d);
          }
        }
        if (cloudData.storageAssets && Array.isArray(cloudData.storageAssets)) {
          for (const a of cloudData.storageAssets) {
            const idx = db.storageAssets.findIndex((x) => x.id === a.id);
            if (idx >= 0) db.storageAssets[idx] = { ...db.storageAssets[idx], ...a };
            else db.storageAssets.push(a);
          }
        }
        global.__velvetLastCloudSync = now;
      }
    } catch (syncErr) {
      console.warn('ensureCloudSynced error:', syncErr);
    } finally {
      global.__velvetCloudSyncPromise = undefined;
    }
  })();

  return global.__velvetCloudSyncPromise;
}

function loadDBFromDisk(): Partial<VelvetDBSchema> | null {
  try {
    const filePath = getPersistenceFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch {}
  return null;
}

function initMemoryDB(): VelvetDBSchema {
  if (!global.__velvetServerDB) {
    const diskData = loadDBFromDisk();
    global.__velvetServerDB = {
      organizations: diskData?.organizations || JSON.parse(JSON.stringify(INITIAL_ORGANIZATIONS)),
      users: diskData?.users || JSON.parse(JSON.stringify(INITIAL_USERS)),
      properties: diskData?.properties || JSON.parse(JSON.stringify(INITIAL_PROPERTIES)),
      leads: diskData?.leads || JSON.parse(JSON.stringify(INITIAL_LEADS)),
      clients: diskData?.clients || JSON.parse(JSON.stringify(INITIAL_CLIENTS)),
      deals: diskData?.deals || JSON.parse(JSON.stringify(INITIAL_DEALS)),
      subscriptions: diskData?.subscriptions || [JSON.parse(JSON.stringify(INITIAL_SUBSCRIPTION))],
      payments: diskData?.payments || JSON.parse(JSON.stringify(INITIAL_PAYMENTS)),
      invoices: diskData?.invoices || JSON.parse(JSON.stringify(INITIAL_INVOICES)),
      appointments: diskData?.appointments || JSON.parse(JSON.stringify(INITIAL_APPOINTMENTS)),
      storageAssets: diskData?.storageAssets || JSON.parse(JSON.stringify(INITIAL_STORAGE_ASSETS)),
      notifications: diskData?.notifications || JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),
      documents: diskData?.documents || JSON.parse(JSON.stringify(INITIAL_DOCUMENTS)),
      aiRequestsUsed: diskData?.aiRequestsUsed || {},
      processedWebhooks: diskData?.processedWebhooks || [],
    };
  }
  return global.__velvetServerDB;
}

export const serverDB = {
  // ==========================================
  // ORGANIZATIONS
  // ==========================================
  async getOrganizations(): Promise<Organization[]> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const res = await pool.query('SELECT * FROM organizations ORDER BY created_at ASC');
        if (res.rows.length > 0) {
          return res.rows.map((r) => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            logoUrl: r.logo_url || undefined,
            phone: r.phone || undefined,
            email: r.email || undefined,
            address: r.address || undefined,
            city: r.city || undefined,
            state: r.state || undefined,
            country: r.country || 'India',
            businessType: r.business_type || 'AGENCY',
            website: r.website || undefined,
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.error('PostgreSQL getOrganizations error, using memory fallback:', err);
      }
    }
    return initMemoryDB().organizations;
  },

  async getOrganizationById(id: string): Promise<Organization | null> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const res = await pool.query('SELECT * FROM organizations WHERE id = $1', [id]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            id: r.id,
            name: r.name,
            slug: r.slug,
            logoUrl: r.logo_url || undefined,
            phone: r.phone || undefined,
            email: r.email || undefined,
            address: r.address || undefined,
            city: r.city || undefined,
            state: r.state || undefined,
            country: r.country || 'India',
            businessType: r.business_type || 'AGENCY',
            website: r.website || undefined,
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          };
        }
        return null;
      } catch (err) {
        console.error('PostgreSQL getOrganizationById error:', err);
      }
    }
    await ensureCloudSynced();
    let org = initMemoryDB().organizations.find((o) => o.id === id);
    if (!org) {
      await ensureCloudSynced(true);
      org = initMemoryDB().organizations.find((o) => o.id === id);
    }
    return org || null;
  },

  async addOrganization(org: Organization): Promise<Organization> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        await pool.query(
          `INSERT INTO organizations (id, name, slug, logo_url, phone, email, address, city, state, country, business_type, website, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             phone = EXCLUDED.phone,
             email = EXCLUDED.email,
             updated_at = NOW()`,
          [
            org.id,
            org.name,
            org.slug || org.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            org.logoUrl || null,
            org.phone || null,
            org.email || null,
            org.address || null,
            org.city || null,
            org.state || null,
            org.country || 'India',
            org.businessType || 'AGENCY',
            org.website || null,
          ]
        );
      } catch (err) {
        console.error('PostgreSQL addOrganization error:', err);
      }
    }

    // Keep memory cache updated
    const db = initMemoryDB();
    const existingIndex = db.organizations.findIndex((o) => o.id === org.id);
    if (existingIndex >= 0) {
      db.organizations[existingIndex] = { ...db.organizations[existingIndex], ...org };
    } else {
      db.organizations.push(org);
    }
    await saveDBToDiskAndCloud(db);
    return org;
  },

  async deleteOrganization(id: string): Promise<boolean> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const res = await pool.query('DELETE FROM organizations WHERE id = $1', [id]);
        return (res.rowCount ?? 0) > 0;
      } catch (err) {
        console.error('PostgreSQL deleteOrganization error:', err);
      }
    }
    const db = initMemoryDB();
    const idx = db.organizations.findIndex((o) => o.id === id);
    if (idx === -1) return false;
    db.organizations.splice(idx, 1);
    await saveDBToDiskAndCloud(db);
    return true;
  },

  /**
   * Atomically registers a customer organization, admin user, and initial 7-day trial subscription.
   * Commits to memory, local disk, and Vercel Blob cloud storage before resolving.
   */
  async registerCustomerWorkspace(
    org: Organization,
    user: User,
    subscription: Subscription
  ): Promise<{ organization: Organization; user: User; subscription: Subscription }> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          `INSERT INTO organizations (id, name, slug, logo_url, phone, email, address, city, state, country, business_type, website, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
           ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, updated_at = NOW()`,
          [
            org.id,
            org.name,
            org.slug || org.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            org.logoUrl || null,
            org.phone || null,
            org.email || null,
            org.address || null,
            org.city || null,
            org.state || null,
            org.country || 'India',
            org.businessType || 'AGENCY',
            org.website || null,
          ]
        );
        await client.query(
          `INSERT INTO users (id, name, email, phone, avatar_url, role, organization_id, is_super_admin, password_hash, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             email = EXCLUDED.email,
             role = EXCLUDED.role,
             password_hash = COALESCE(EXCLUDED.password_hash, users.password_hash),
             updated_at = NOW()`,
          [
            user.id,
            user.name,
            user.email.toLowerCase(),
            user.phone || null,
            user.avatarUrl || null,
            user.role || 'ADMIN',
            user.organizationId,
            user.isSuperAdmin || false,
            user.passwordHash || null,
          ]
        );
        await client.query(
          `INSERT INTO subscriptions (id, organization_id, user_id, tier, status, price_monthly_inr, billing_cycle, current_period_start, current_period_end, cancel_at_period_end, usage_json, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
           ON CONFLICT (organization_id) DO UPDATE SET
             tier = EXCLUDED.tier,
             status = EXCLUDED.status,
             current_period_end = EXCLUDED.current_period_end,
             updated_at = NOW()`,
          [
            subscription.id,
            subscription.organizationId,
            subscription.userId,
            subscription.tier,
            subscription.status,
            subscription.priceMonthlyINR,
            subscription.billingCycle,
            subscription.currentPeriodStart,
            subscription.currentPeriodEnd,
            subscription.cancelAtPeriodEnd,
            JSON.stringify(subscription.usage),
          ]
        );
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('PostgreSQL registerCustomerWorkspace error:', err);
      } finally {
        client.release();
      }
    }

    const db = initMemoryDB();
    const orgIdx = db.organizations.findIndex((o) => o.id === org.id);
    if (orgIdx >= 0) db.organizations[orgIdx] = { ...db.organizations[orgIdx], ...org };
    else db.organizations.push(org);

    const userIdx = db.users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (userIdx >= 0) db.users[userIdx] = { ...db.users[userIdx], ...user };
    else db.users.push(user);

    const subIdx = db.subscriptions.findIndex(
      (s) => s.id === subscription.id || s.organizationId === subscription.organizationId
    );
    if (subIdx >= 0) db.subscriptions[subIdx] = { ...db.subscriptions[subIdx], ...subscription };
    else db.subscriptions.push(subscription);

    await saveDBToDiskAndCloud(db);
    return { organization: org, user, subscription };
  },

  // ==========================================
  // USERS
  // ==========================================
  async getUsers(orgId?: string): Promise<User[]> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const query = orgId
          ? 'SELECT * FROM users WHERE organization_id = $1 ORDER BY created_at ASC'
          : 'SELECT * FROM users ORDER BY created_at ASC';
        const params = orgId ? [orgId] : [];
        const res = await pool.query(query, params);
        if (res.rows.length > 0) {
          return res.rows.map((r) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            phone: r.phone || undefined,
            avatarUrl: r.avatar_url || undefined,
            role: r.role,
            organizationId: r.organization_id,
            isSuperAdmin: r.is_super_admin || false,
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
            lastLoginAt: r.last_login_at ? new Date(r.last_login_at).toISOString() : undefined,
            lastActiveAt: r.last_active_at ? new Date(r.last_active_at).toISOString() : undefined,
          }));
        }
      } catch (err) {
        console.error('PostgreSQL getUsers error:', err);
      }
    }
    const users = initMemoryDB().users;
    if (orgId) return users.filter((u) => u.organizationId === orgId);
    return users;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const cleanEmail = email.trim().toLowerCase();
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            id: r.id,
            name: r.name,
            email: r.email,
            phone: r.phone || undefined,
            avatarUrl: r.avatar_url || undefined,
            role: r.role,
            organizationId: r.organization_id,
            isSuperAdmin: r.is_super_admin || false,
            passwordHash: r.password_hash || undefined,
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
            lastLoginAt: r.last_login_at ? new Date(r.last_login_at).toISOString() : undefined,
            lastActiveAt: r.last_active_at ? new Date(r.last_active_at).toISOString() : undefined,
          };
        }
        return null;
      } catch (err) {
        console.error('PostgreSQL getUserByEmail error:', err);
      }
    }
    await ensureCloudSynced();
    const db = initMemoryDB();
    let matched = db.users.find((u) => u.email && u.email.toLowerCase() === cleanEmail);
    if (!matched) {
      await ensureCloudSynced(true);
      matched = db.users.find((u) => u.email && u.email.toLowerCase() === cleanEmail);
    }
    return matched || null;
  },

  async getUserById(id: string): Promise<User | null> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            id: r.id,
            name: r.name,
            email: r.email,
            phone: r.phone || undefined,
            avatarUrl: r.avatar_url || undefined,
            role: r.role,
            organizationId: r.organization_id,
            isSuperAdmin: r.is_super_admin || false,
            passwordHash: r.password_hash || undefined,
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
            lastLoginAt: r.last_login_at ? new Date(r.last_login_at).toISOString() : undefined,
            lastActiveAt: r.last_active_at ? new Date(r.last_active_at).toISOString() : undefined,
          };
        }
        return null;
      } catch (err) {
        console.error('PostgreSQL getUserById error:', err);
      }
    }
    await ensureCloudSynced();
    let matched = initMemoryDB().users.find((u) => u.id === id);
    if (!matched) {
      await ensureCloudSynced(true);
      matched = initMemoryDB().users.find((u) => u.id === id);
    }
    return matched || null;
  },

  async addUser(user: User): Promise<User> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        await pool.query(
          `INSERT INTO users (id, name, email, phone, avatar_url, role, organization_id, is_super_admin, password_hash, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             email = EXCLUDED.email,
             phone = EXCLUDED.phone,
             role = EXCLUDED.role,
             password_hash = COALESCE(EXCLUDED.password_hash, users.password_hash),
             updated_at = NOW()`,
          [
            user.id,
            user.name,
            user.email.toLowerCase(),
            user.phone || null,
            user.avatarUrl || null,
            user.role || 'ADMIN',
            user.organizationId,
            user.isSuperAdmin || false,
            user.passwordHash || null,
          ]
        );
      } catch (err) {
        console.error('PostgreSQL addUser error:', err);
      }
    }

    const db = initMemoryDB();
    const existingIndex = db.users.findIndex((u) => u.id === user.id);
    if (existingIndex >= 0) {
      db.users[existingIndex] = { ...db.users[existingIndex], ...user };
    } else {
      db.users.push(user);
    }
    await saveDBToDiskAndCloud(db);
    return user;
  },

  async deleteUser(id: string, orgId?: string): Promise<boolean> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const query = orgId
          ? 'DELETE FROM users WHERE id = $1 AND organization_id = $2'
          : 'DELETE FROM users WHERE id = $1';
        const params = orgId ? [id, orgId] : [id];
        const res = await pool.query(query, params);
        return (res.rowCount ?? 0) > 0;
      } catch (err) {
        console.error('PostgreSQL deleteUser error:', err);
      }
    }
    const db = initMemoryDB();
    const idx = db.users.findIndex((u) => u.id === id && (!orgId || u.organizationId === orgId));
    if (idx === -1) return false;
    db.users.splice(idx, 1);
    await saveDBToDiskAndCloud(db);
    return true;
  },

  // ==========================================
  // LEADS
  // ==========================================
  async getLeads(orgId?: string): Promise<Lead[]> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const query = orgId
          ? 'SELECT * FROM leads WHERE organization_id = $1 ORDER BY created_at DESC'
          : 'SELECT * FROM leads ORDER BY created_at DESC';
        const params = orgId ? [orgId] : [];
        const res = await pool.query(query, params);
        return res.rows.map((r) => ({
          id: r.id,
          organizationId: r.organization_id,
          name: r.name,
          phone: r.phone,
          email: r.email || undefined,
          source: r.source || 'WEBSITE',
          status: r.status || 'NEW',
          priority: r.priority || 'MEDIUM',
          score: r.score !== null ? Number(r.score) : 75,
          budgetMinINR: r.budget_min_inr ? Number(r.budget_min_inr) : undefined,
          budgetMaxINR: r.budget_max_inr ? Number(r.budget_max_inr) : undefined,
          preferredLocation: r.preferred_location || undefined,
          preferredType: r.preferred_type || undefined,
          interestedPropertyId: r.interested_property_id || undefined,
          interestedPropertyName: r.interested_property_name || undefined,
          assignedToId: r.assigned_to_id || undefined,
          assignedToName: r.assigned_to_name || undefined,
          notes: r.notes || undefined,
          imageUrl: r.image_url || undefined,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
        }));
      } catch (err) {
        console.error('PostgreSQL getLeads error:', err);
      }
    }

    const db = initMemoryDB();
    if (orgId) return db.leads.filter((l) => l.organizationId === orgId);
    return db.leads;
  },

  async getLeadById(id: string, orgId?: string): Promise<Lead | null> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const query = orgId
          ? 'SELECT * FROM leads WHERE id = $1 AND organization_id = $2'
          : 'SELECT * FROM leads WHERE id = $1';
        const params = orgId ? [id, orgId] : [id];
        const res = await pool.query(query, params);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            id: r.id,
            organizationId: r.organization_id,
            name: r.name,
            phone: r.phone,
            email: r.email || undefined,
            source: r.source || 'WEBSITE',
            status: r.status || 'NEW',
            priority: r.priority || 'MEDIUM',
            score: r.score !== null ? Number(r.score) : 75,
            budgetMinINR: r.budget_min_inr ? Number(r.budget_min_inr) : undefined,
            budgetMaxINR: r.budget_max_inr ? Number(r.budget_max_inr) : undefined,
            preferredLocation: r.preferred_location || undefined,
            preferredType: r.preferred_type || undefined,
            interestedPropertyId: r.interested_property_id || undefined,
            interestedPropertyName: r.interested_property_name || undefined,
            assignedToId: r.assigned_to_id || undefined,
            assignedToName: r.assigned_to_name || undefined,
            notes: r.notes || undefined,
            imageUrl: r.image_url || undefined,
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
            updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
          };
        }
        return null;
      } catch (err) {
        console.error('PostgreSQL getLeadById error:', err);
      }
    }

    const db = initMemoryDB();
    const lead = db.leads.find((l) => l.id === id && (!orgId || l.organizationId === orgId));
    return lead || null;
  },

  async addLead(lead: Lead): Promise<Lead> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        await pool.query(
          `INSERT INTO leads (
             id, organization_id, name, phone, email, source, status, priority, score,
             budget_min_inr, budget_max_inr, preferred_location, preferred_type,
             interested_property_id, interested_property_name, assigned_to_id, assigned_to_name,
             notes, image_url, created_at, updated_at
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW()
           )
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             phone = EXCLUDED.phone,
             email = EXCLUDED.email,
             status = EXCLUDED.status,
             priority = EXCLUDED.priority,
             notes = EXCLUDED.notes,
             image_url = EXCLUDED.image_url,
             updated_at = NOW()`,
          [
            lead.id,
            lead.organizationId,
            lead.name,
            lead.phone,
            lead.email || null,
            lead.source || 'WEBSITE',
            lead.status || 'NEW',
            lead.priority || 'MEDIUM',
            lead.score || 75,
            lead.budgetMinINR || null,
            lead.budgetMaxINR || null,
            lead.preferredLocation || null,
            lead.preferredType || null,
            lead.interestedPropertyId || null,
            lead.interestedPropertyName || null,
            lead.assignedToId || null,
            lead.assignedToName || null,
            lead.notes || null,
            lead.imageUrl || null,
          ]
        );
      } catch (err) {
        console.error('PostgreSQL addLead error:', err);
        throw err;
      }
    }

    const db = initMemoryDB();
    db.leads.unshift(lead);
    saveDBToDisk(db);
    return lead;
  },

  async updateLead(id: string, updates: Partial<Lead>, orgId?: string): Promise<Lead | null> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const current = await this.getLeadById(id, orgId);
        if (!current) return null;

        const merged: Lead = {
          ...current,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        await pool.query(
          `UPDATE leads SET
             name = $1, phone = $2, email = $3, source = $4, status = $5, priority = $6,
             budget_min_inr = $7, budget_max_inr = $8, preferred_location = $9, preferred_type = $10,
             interested_property_id = $11, interested_property_name = $12, assigned_to_id = $13,
             assigned_to_name = $14, notes = $15, image_url = $16, updated_at = NOW()
           WHERE id = $17 AND ($18::text IS NULL OR organization_id = $18)`,
          [
            merged.name,
            merged.phone,
            merged.email || null,
            merged.source || 'WEBSITE',
            merged.status || 'NEW',
            merged.priority || 'MEDIUM',
            merged.budgetMinINR || null,
            merged.budgetMaxINR || null,
            merged.preferredLocation || null,
            merged.preferredType || null,
            merged.interestedPropertyId || null,
            merged.interestedPropertyName || null,
            merged.assignedToId || null,
            merged.assignedToName || null,
            merged.notes || null,
            merged.imageUrl || null,
            id,
            orgId || null,
          ]
        );
        return merged;
      } catch (err) {
        console.error('PostgreSQL updateLead error:', err);
      }
    }

    const db = initMemoryDB();
    const index = db.leads.findIndex((l) => l.id === id && (!orgId || l.organizationId === orgId));
    if (index === -1) return null;
    db.leads[index] = { ...db.leads[index], ...updates, updatedAt: new Date().toISOString() };
    saveDBToDisk(db);
    return db.leads[index];
  },

  async deleteLead(id: string, orgId?: string): Promise<boolean> {
    const lead = await this.getLeadById(id, orgId);
    if (lead) {
      try {
        const assets = await this.getStorageAssets(lead.organizationId);
        const leadAssets = assets.filter((a) => a.entityId === id || (lead.imageUrl && a.storageUrl === lead.imageUrl));
        for (const asset of leadAssets) {
          await this.deleteStorageAsset(asset.id, lead.organizationId);
        }
      } catch (assetErr) {
        console.warn('Non-fatal cleanup of lead assets:', assetErr);
      }
    }

    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const query = orgId
          ? 'DELETE FROM leads WHERE id = $1 AND organization_id = $2'
          : 'DELETE FROM leads WHERE id = $1';
        const params = orgId ? [id, orgId] : [id];
        const res = await pool.query(query, params);
        return (res.rowCount ?? 0) > 0;
      } catch (err) {
        console.error('PostgreSQL deleteLead error:', err);
      }
    }

    const db = initMemoryDB();
    const index = db.leads.findIndex((l) => l.id === id && (!orgId || l.organizationId === orgId));
    if (index === -1) return false;
    db.leads.splice(index, 1);
    saveDBToDisk(db);
    return true;
  },

  // ==========================================
  // PROPERTIES
  // ==========================================
  async getProperties(orgId?: string): Promise<Property[]> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const query = orgId
          ? 'SELECT * FROM properties WHERE organization_id = $1 ORDER BY created_at DESC'
          : 'SELECT * FROM properties ORDER BY created_at DESC';
        const params = orgId ? [orgId] : [];
        const res = await pool.query(query, params);
        if (res.rows.length > 0) {
          return res.rows.map((r) => ({
            id: r.id,
            organizationId: r.organization_id,
            title: r.title,
            propertyType: r.type || 'APARTMENT',
            status: r.status || 'AVAILABLE',
            priceINR: Number(r.price_inr),
            areaSqFt: r.area_sqft || 0,
            bedrooms: r.bedrooms || 0,
            bathrooms: r.bathrooms || 0,
            address: r.location || '',
            locality: r.city || '',
            city: r.city || '',
            state: r.state || '',
            featuredImageUrl: r.featured_image || '',
            images: Array.isArray(r.gallery) ? r.gallery : [],
            description: r.description || '',
            amenities: Array.isArray(r.amenities) ? r.amenities : [],
            assignedAgentId: r.assigned_agent_id || undefined,
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
            updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.error('PostgreSQL getProperties error:', err);
      }
    }

    const db = initMemoryDB();
    if (orgId) return db.properties.filter((p) => p.organizationId === orgId);
    return db.properties;
  },

  async getPropertyById(id: string, orgId?: string): Promise<Property | null> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const query = orgId
          ? 'SELECT * FROM properties WHERE id = $1 AND organization_id = $2'
          : 'SELECT * FROM properties WHERE id = $1';
        const params = orgId ? [id, orgId] : [id];
        const res = await pool.query(query, params);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            id: r.id,
            organizationId: r.organization_id,
            title: r.title,
            propertyType: r.type || 'APARTMENT',
            status: r.status || 'AVAILABLE',
            priceINR: Number(r.price_inr),
            areaSqFt: r.area_sqft || 0,
            bedrooms: r.bedrooms || 0,
            bathrooms: r.bathrooms || 0,
            address: r.location || '',
            locality: r.city || '',
            city: r.city || '',
            state: r.state || '',
            featuredImageUrl: r.featured_image || '',
            images: Array.isArray(r.gallery) ? r.gallery : [],
            description: r.description || '',
            amenities: Array.isArray(r.amenities) ? r.amenities : [],
            assignedAgentId: r.assigned_agent_id || undefined,
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
            updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
          };
        }
        return null;
      } catch (err) {
        console.error('PostgreSQL getPropertyById error:', err);
      }
    }

    const db = initMemoryDB();
    const found = db.properties.find((p) => p.id === id && (!orgId || p.organizationId === orgId));
    return found || null;
  },

  async addProperty(prop: Property): Promise<Property> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        await pool.query(
          `INSERT INTO properties (
             id, organization_id, title, type, status, price_inr, area_sqft, bedrooms, bathrooms,
             location, city, state, featured_image, gallery, description, amenities, assigned_agent_id,
             created_at, updated_at
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW()
           )
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title, price_inr = EXCLUDED.price_inr, status = EXCLUDED.status,
             featured_image = EXCLUDED.featured_image, updated_at = NOW()`,
          [
            prop.id,
            prop.organizationId,
            prop.title,
            prop.propertyType || 'APARTMENT',
            prop.status || 'AVAILABLE',
            prop.priceINR,
            prop.areaSqFt || 0,
            prop.bedrooms || 0,
            prop.bathrooms || 0,
            prop.address || prop.locality || '',
            prop.city || '',
            prop.state || '',
            prop.featuredImageUrl || '',
            prop.images || [],
            prop.description || '',
            prop.amenities || [],
            prop.assignedAgentId || null,
          ]
        );
      } catch (err) {
        console.error('PostgreSQL addProperty error:', err);
      }
    }

    const db = initMemoryDB();
    db.properties.unshift(prop);
    saveDBToDisk(db);
    return prop;
  },

  async updateProperty(id: string, updates: Partial<Property>, orgId?: string): Promise<Property | null> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const props = await this.getProperties(orgId);
        const target = props.find((p) => p.id === id);
        if (target) {
          const merged: Property = { ...target, ...updates, updatedAt: new Date().toISOString() };
          await pool.query(
            `UPDATE properties SET
               title = $1, type = $2, status = $3, price_inr = $4, area_sqft = $5,
               bedrooms = $6, bathrooms = $7, location = $8, city = $9, state = $10,
               featured_image = $11, description = $12, updated_at = NOW()
             WHERE id = $13 AND ($14::text IS NULL OR organization_id = $14)`,
            [
              merged.title,
              merged.propertyType || 'APARTMENT',
              merged.status,
              merged.priceINR,
              merged.areaSqFt,
              merged.bedrooms || 0,
              merged.bathrooms || 0,
              merged.address || merged.locality || '',
              merged.city,
              merged.state,
              merged.featuredImageUrl || '',
              merged.description || '',
              id,
              orgId || null,
            ]
          );
          return merged;
        }
      } catch (err) {
        console.error('PostgreSQL updateProperty error:', err);
      }
    }

    const db = initMemoryDB();
    const index = db.properties.findIndex((p) => p.id === id && (!orgId || p.organizationId === orgId));
    if (index === -1) return null;
    db.properties[index] = { ...db.properties[index], ...updates, updatedAt: new Date().toISOString() };
    saveDBToDisk(db);
    return db.properties[index];
  },

  async deleteProperty(id: string, orgId?: string): Promise<boolean> {
    const prop = await this.getPropertyById(id, orgId);
    if (prop) {
      try {
        const assets = await this.getStorageAssets(prop.organizationId);
        const propAssets = assets.filter(
          (a) => a.entityId === id || (prop.images && prop.images.includes(a.storageUrl)) || (prop.featuredImageUrl && a.storageUrl === prop.featuredImageUrl)
        );
        for (const asset of propAssets) {
          await this.deleteStorageAsset(asset.id, prop.organizationId);
        }
      } catch (assetErr) {
        console.warn('Non-fatal cleanup of property assets:', assetErr);
      }
    }

    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const query = orgId
          ? 'DELETE FROM properties WHERE id = $1 AND organization_id = $2'
          : 'DELETE FROM properties WHERE id = $1';
        const params = orgId ? [id, orgId] : [id];
        const res = await pool.query(query, params);
        return (res.rowCount ?? 0) > 0;
      } catch (err) {
        console.error('PostgreSQL deleteProperty error:', err);
      }
    }

    const db = initMemoryDB();
    const index = db.properties.findIndex((p) => p.id === id && (!orgId || p.organizationId === orgId));
    if (index === -1) return false;
    db.properties.splice(index, 1);
    saveDBToDisk(db);
    return true;
  },

  // ==========================================
  // CLIENTS
  // ==========================================
  async getClients(orgId?: string): Promise<Client[]> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const query = orgId
          ? 'SELECT * FROM clients WHERE organization_id = $1 ORDER BY created_at DESC'
          : 'SELECT * FROM clients ORDER BY created_at DESC';
        const params = orgId ? [orgId] : [];
        const res = await pool.query(query, params);
        if (res.rows.length > 0) {
          return res.rows.map((r) => ({
            id: r.id,
            organizationId: r.organization_id,
            name: r.name,
            phone: r.phone,
            email: r.email || undefined,
            budgetINR: r.budget_inr ? Number(r.budget_inr) : undefined,
            preferredLocation: r.preferred_location || undefined,
            preferredType: r.preferred_type || undefined,
            requirements: r.requirements || undefined,
            totalDealsCount: r.total_deals_count || 0,
            totalDealsValueINR: Number(r.total_deals_value_inr || 0),
            notes: r.notes || undefined,
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
            updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.error('PostgreSQL getClients error:', err);
      }
    }

    const db = initMemoryDB();
    if (orgId) return db.clients.filter((c) => c.organizationId === orgId);
    return db.clients;
  },

  async getClientById(id: string, orgId?: string): Promise<Client | null> {
    const clients = await this.getClients(orgId);
    return clients.find((c) => c.id === id) || null;
  },

  async addClient(client: Client): Promise<Client> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        await pool.query(
          `INSERT INTO clients (
             id, organization_id, name, phone, email, budget_inr, preferred_location, preferred_type,
             requirements, total_deals_count, total_deals_value_inr, notes, created_at, updated_at
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
           )
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name, phone = EXCLUDED.phone, email = EXCLUDED.email, updated_at = NOW()`,
          [
            client.id,
            client.organizationId,
            client.name,
            client.phone,
            client.email || null,
            client.budgetINR || null,
            client.preferredLocation || null,
            client.preferredType || null,
            client.requirements || null,
            client.totalDealsCount || 0,
            client.totalDealsValueINR || 0,
            client.notes || null,
          ]
        );
      } catch (err) {
        console.error('PostgreSQL addClient error:', err);
      }
    }

    const db = initMemoryDB();
    db.clients.unshift(client);
    saveDBToDisk(db);
    return client;
  },

  async updateClient(id: string, updates: Partial<Client>, orgId?: string): Promise<Client | null> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const clients = await this.getClients(orgId);
        const target = clients.find((c) => c.id === id);
        if (target) {
          const merged: Client = { ...target, ...updates, updatedAt: new Date().toISOString() };
          await pool.query(
            `UPDATE clients SET
               name = $1, phone = $2, email = $3, budget_inr = $4, preferred_location = $5,
               preferred_type = $6, requirements = $7, total_deals_count = $8,
               total_deals_value_inr = $9, notes = $10, updated_at = NOW()
             WHERE id = $11 AND ($12::text IS NULL OR organization_id = $12)`,
            [
              merged.name,
              merged.phone,
              merged.email || null,
              merged.budgetINR || null,
              merged.preferredLocation || null,
              merged.preferredType || null,
              merged.requirements || null,
              merged.totalDealsCount || 0,
              merged.totalDealsValueINR || 0,
              merged.notes || null,
              id,
              orgId || null,
            ]
          );
          return merged;
        }
      } catch (err) {
        console.error('PostgreSQL updateClient error:', err);
      }
    }

    const db = initMemoryDB();
    const index = db.clients.findIndex((c) => c.id === id && (!orgId || c.organizationId === orgId));
    if (index === -1) return null;
    db.clients[index] = { ...db.clients[index], ...updates, updatedAt: new Date().toISOString() };
    saveDBToDisk(db);
    return db.clients[index];
  },

  async deleteClient(id: string, orgId?: string): Promise<boolean> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const query = orgId
          ? 'DELETE FROM clients WHERE id = $1 AND organization_id = $2'
          : 'DELETE FROM clients WHERE id = $1';
        const params = orgId ? [id, orgId] : [id];
        const res = await pool.query(query, params);
        return (res.rowCount ?? 0) > 0;
      } catch (err) {
        console.error('PostgreSQL deleteClient error:', err);
      }
    }

    const db = initMemoryDB();
    const index = db.clients.findIndex((c) => c.id === id && (!orgId || c.organizationId === orgId));
    if (index === -1) return false;
    db.clients.splice(index, 1);
    saveDBToDisk(db);
    return true;
  },

  // ==========================================
  // APPOINTMENTS (CRM Calendar)
  // ==========================================
  async getAppointments(
    orgId?: string,
    filters?: { clientId?: string; leadId?: string; propertyId?: string; startDate?: string; endDate?: string }
  ): Promise<Appointment[]> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        let query = 'SELECT * FROM appointments WHERE 1=1';
        const params: any[] = [];
        if (orgId) {
          params.push(orgId);
          query += ` AND organization_id = $${params.length}`;
        }
        if (filters?.leadId) {
          params.push(filters.leadId);
          query += ` AND lead_id = $${params.length}`;
        }
        if (filters?.propertyId) {
          params.push(filters.propertyId);
          query += ` AND property_id = $${params.length}`;
        }
        query += ' ORDER BY start_at ASC';

        const res = await pool.query(query, params);
        return res.rows.map((r) => ({
          id: r.id,
          organizationId: r.organization_id,
          title: r.title,
          description: r.description || undefined,
          appointmentType: r.appointment_type,
          status: r.status,
          startAt: new Date(r.start_at).toISOString(),
          endAt: new Date(r.end_at).toISOString(),
          durationMinutes: r.duration_minutes || 60,
          location: r.location || undefined,
          leadId: r.lead_id || undefined,
          leadName: r.lead_name || undefined,
          clientId: r.client_id || undefined,
          clientName: r.client_name || undefined,
          propertyId: r.property_id || undefined,
          propertyTitle: r.property_title || undefined,
          assignedUserId: r.assigned_user_id || undefined,
          assignedUserName: r.assigned_user_name || undefined,
          reminderMinutes: r.reminder_minutes || 15,
          reminderSent: r.reminder_sent || false,
          notes: r.notes || undefined,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
        }));
      } catch (err) {
        console.error('PostgreSQL getAppointments error:', err);
      }
    }

    const db = initMemoryDB();
    let result = orgId ? db.appointments.filter((a) => a.organizationId === orgId) : db.appointments;
    if (filters?.leadId) result = result.filter((a) => a.leadId === filters.leadId);
    if (filters?.propertyId) result = result.filter((a) => a.propertyId === filters.propertyId);
    return result;
  },

  async getAppointmentById(id: string, orgId?: string): Promise<Appointment | null> {
    const apts = await this.getAppointments(orgId);
    return apts.find((a) => a.id === id) || null;
  },

  async addAppointment(apt: Appointment): Promise<Appointment> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        await pool.query(
          `INSERT INTO appointments (
             id, organization_id, title, description, appointment_type, status,
             start_at, end_at, duration_minutes, location, lead_id, lead_name,
             client_id, client_name, property_id, property_title, assigned_user_id,
             assigned_user_name, reminder_minutes, notes, created_at, updated_at
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW()
           )
           ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, start_at = EXCLUDED.start_at, status = EXCLUDED.status, updated_at = NOW()`,
          [
            apt.id,
            apt.organizationId,
            apt.title,
            apt.description || null,
            apt.appointmentType || 'SITE_VISIT',
            apt.status || 'SCHEDULED',
            apt.startAt,
            apt.endAt,
            60,
            apt.location || null,
            apt.leadId || null,
            apt.leadName || null,
            apt.clientId || null,
            apt.clientName || null,
            apt.propertyId || null,
            apt.propertyTitle || null,
            apt.assignedUserId || null,
            apt.assignedUserName || null,
            apt.reminderMinutes || 15,
            null,
          ]
        );
      } catch (err) {
        console.error('PostgreSQL addAppointment error:', err);
      }
    }

    const db = initMemoryDB();
    db.appointments.unshift(apt);
    saveDBToDisk(db);
    return apt;
  },

  async updateAppointment(id: string, updates: Partial<Appointment>, orgId?: string): Promise<Appointment | null> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const apts = await this.getAppointments(orgId);
        const target = apts.find((a) => a.id === id);
        if (target) {
          const merged: Appointment = { ...target, ...updates, updatedAt: new Date().toISOString() };
          await pool.query(
            `UPDATE appointments SET
               title = $1, description = $2, appointment_type = $3, status = $4,
               start_at = $5, end_at = $6, location = $7,
               lead_id = $8, lead_name = $9, client_id = $10, client_name = $11,
               property_id = $12, property_title = $13, assigned_user_id = $14,
               assigned_user_name = $15, reminder_minutes = $16, updated_at = NOW()
             WHERE id = $17 AND ($18::text IS NULL OR organization_id = $18)`,
            [
              merged.title,
              merged.description || null,
              merged.appointmentType || 'SITE_VISIT',
              merged.status || 'SCHEDULED',
              merged.startAt,
              merged.endAt,
              merged.location || null,
              merged.leadId || null,
              merged.leadName || null,
              merged.clientId || null,
              merged.clientName || null,
              merged.propertyId || null,
              merged.propertyTitle || null,
              merged.assignedUserId || null,
              merged.assignedUserName || null,
              merged.reminderMinutes || 15,
              id,
              orgId || null,
            ]
          );
          return merged;
        }
      } catch (err) {
        console.error('PostgreSQL updateAppointment error:', err);
      }
    }

    const db = initMemoryDB();
    const index = db.appointments.findIndex((a) => a.id === id && (!orgId || a.organizationId === orgId));
    if (index === -1) return null;
    db.appointments[index] = { ...db.appointments[index], ...updates, updatedAt: new Date().toISOString() };
    saveDBToDisk(db);
    return db.appointments[index];
  },

  async deleteAppointment(id: string, orgId?: string): Promise<boolean> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const query = orgId
          ? 'DELETE FROM appointments WHERE id = $1 AND organization_id = $2'
          : 'DELETE FROM appointments WHERE id = $1';
        const params = orgId ? [id, orgId] : [id];
        const res = await pool.query(query, params);
        return (res.rowCount ?? 0) > 0;
      } catch (err) {
        console.error('PostgreSQL deleteAppointment error:', err);
      }
    }

    const db = initMemoryDB();
    const index = db.appointments.findIndex((a) => a.id === id && (!orgId || a.organizationId === orgId));
    if (index === -1) return false;
    db.appointments.splice(index, 1);
    saveDBToDisk(db);
    return true;
  },

  // ==========================================
  // STORAGE ASSETS (Cloud Object Metadata & Fallback)
  // ==========================================
  async getStorageAssets(orgId?: string): Promise<StorageAsset[]> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const query = orgId
          ? 'SELECT * FROM storage_assets WHERE deleted_at IS NULL AND organization_id = $1 ORDER BY created_at DESC'
          : 'SELECT * FROM storage_assets WHERE deleted_at IS NULL ORDER BY created_at DESC';
        const params = orgId ? [orgId] : [];
        const res = await pool.query(query, params);
        return res.rows.map((r) => ({
          id: r.id,
          organizationId: r.organization_id,
          uploadedBy: r.uploaded_by || 'system',
          fileName: r.file_name,
          originalFileName: r.original_file_name,
          mimeType: r.mime_type,
          fileSize: Number(r.file_size),
          storageKey: r.storage_key,
          storageUrl: r.storage_url,
          entityType: r.entity_type,
          entityId: r.entity_id || undefined,
          createdAt: new Date(r.created_at).toISOString(),
          updatedAt: new Date(r.updated_at).toISOString(),
        }));
      } catch (err) {
        console.error('PostgreSQL getStorageAssets error:', err);
      }
    }

    const db = initMemoryDB();
    const assets = db.storageAssets.filter((a) => !a.deletedAt);
    if (orgId) return assets.filter((a) => a.organizationId === orgId);
    return assets;
  },

  async getStorageAssetById(id: string, orgId?: string): Promise<StorageAsset | null> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const query = orgId
          ? 'SELECT * FROM storage_assets WHERE id = $1 AND deleted_at IS NULL AND organization_id = $2'
          : 'SELECT * FROM storage_assets WHERE id = $1 AND deleted_at IS NULL';
        const params = orgId ? [id, orgId] : [id];
        const res = await pool.query(query, params);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            id: r.id,
            organizationId: r.organization_id,
            uploadedBy: r.uploaded_by || 'system',
            fileName: r.file_name,
            originalFileName: r.original_file_name,
            mimeType: r.mime_type,
            fileSize: Number(r.file_size),
            storageKey: r.storage_key,
            storageUrl: r.storage_url,
            entityType: r.entity_type,
            entityId: r.entity_id || undefined,
            createdAt: new Date(r.created_at).toISOString(),
            updatedAt: new Date(r.updated_at).toISOString(),
          };
        }
        return null;
      } catch (err) {
        console.error('PostgreSQL getStorageAssetById error:', err);
      }
    }

    const db = initMemoryDB();
    const asset = db.storageAssets.find((a) => a.id === id && !a.deletedAt && (!orgId || a.organizationId === orgId));
    return asset || null;
  },

  async getStorageAssetByKey(key: string): Promise<(StorageAsset & { binaryData?: Buffer }) | null> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const res = await pool.query('SELECT * FROM storage_assets WHERE storage_key = $1 AND deleted_at IS NULL', [key]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            id: r.id,
            organizationId: r.organization_id,
            uploadedBy: r.uploaded_by || 'system',
            fileName: r.file_name,
            originalFileName: r.original_file_name,
            mimeType: r.mime_type,
            fileSize: Number(r.file_size),
            storageKey: r.storage_key,
            storageUrl: r.storage_url,
            entityType: r.entity_type,
            entityId: r.entity_id || undefined,
            binaryData: r.binary_data ? Buffer.from(r.binary_data) : undefined,
            createdAt: new Date(r.created_at).toISOString(),
            updatedAt: new Date(r.updated_at).toISOString(),
          };
        }
        return null;
      } catch (err) {
        console.error('PostgreSQL getStorageAssetByKey error:', err);
      }
    }

    const db = initMemoryDB();
    const asset = db.storageAssets.find((a) => a.storageKey === key && !a.deletedAt);
    return asset || null;
  },

  async addStorageAsset(asset: StorageAsset, binaryBuffer?: Buffer): Promise<StorageAsset> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        await pool.query(
          `INSERT INTO storage_assets (
             id, organization_id, uploaded_by, file_name, original_file_name, mime_type,
             file_size, storage_key, storage_url, entity_type, entity_id, binary_data, created_at, updated_at
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
           )
           ON CONFLICT (storage_key) DO UPDATE SET
             storage_url = EXCLUDED.storage_url,
             file_size = EXCLUDED.file_size,
             binary_data = COALESCE(EXCLUDED.binary_data, storage_assets.binary_data),
             updated_at = NOW()`,
          [
            asset.id,
            asset.organizationId,
            asset.uploadedBy || null,
            asset.fileName,
            asset.originalFileName,
            asset.mimeType,
            asset.fileSize,
            asset.storageKey,
            asset.storageUrl,
            asset.entityType,
            asset.entityId || null,
            binaryBuffer || null,
          ]
        );
      } catch (err) {
        console.error('PostgreSQL addStorageAsset error:', err);
      }
    }

    const db = initMemoryDB();
    db.storageAssets.unshift(asset);
    saveDBToDisk(db);
    return asset;
  },

  async deleteStorageAsset(id: string, orgId?: string): Promise<boolean> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const query = orgId
          ? 'UPDATE storage_assets SET deleted_at = NOW() WHERE id = $1 AND organization_id = $2'
          : 'UPDATE storage_assets SET deleted_at = NOW() WHERE id = $1';
        const params = orgId ? [id, orgId] : [id];
        const res = await pool.query(query, params);
        return (res.rowCount ?? 0) > 0;
      } catch (err) {
        console.error('PostgreSQL deleteStorageAsset error:', err);
      }
    }

    const db = initMemoryDB();
    const asset = db.storageAssets.find((a) => a.id === id && (!orgId || a.organizationId === orgId));
    if (!asset) return false;
    asset.deletedAt = new Date().toISOString();
    saveDBToDisk(db);
    return true;
  },

  async getStorageUsage(orgId: string): Promise<StorageUsage> {
    const assets = await this.getStorageAssets(orgId);
    const usedBytes = assets.reduce((sum, a) => sum + (a.fileSize || 0), 0);
    const planLimits = this.getOrgPlanLimits(orgId);
    const limitBytes = planLimits.storageLimitBytes || 1073741824;
    const availableBytes = limitBytes === -1 ? Number.MAX_SAFE_INTEGER : Math.max(0, limitBytes - usedBytes);
    const usagePercent = limitBytes > 0 ? Math.min(100, Math.round((usedBytes / limitBytes) * 100)) : 0;

    const sub = await this.getSubscription(orgId);
    return {
      usedBytes,
      limitBytes,
      availableBytes,
      usagePercent,
      fileCount: assets.length,
      tier: sub?.tier || 'STARTER',
      planName: planLimits.name,
    };
  },

  // ==========================================
  // SUBSCRIPTIONS & PLANS
  // ==========================================
  getOrgPlanLimits(orgId: string): PlanLimits {
    const sub = this.getSubscriptionSync(orgId);
    const tier = sub?.tier || 'STARTER';
    return SAAS_PLANS.find((p) => p.tier === tier) || SAAS_PLANS[0];
  },

  getSubscriptionSync(orgId: string): Subscription | undefined {
    return initMemoryDB().subscriptions.find((s) => s.organizationId === orgId) || INITIAL_SUBSCRIPTION;
  },

  async getSubscription(orgId: string): Promise<Subscription | null> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const res = await pool.query('SELECT * FROM subscriptions WHERE organization_id = $1', [orgId]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            id: r.id,
            organizationId: r.organization_id,
            userId: r.user_id,
            tier: r.tier,
            status: r.status,
            priceMonthlyINR: r.price_monthly_inr,
            billingCycle: r.billing_cycle,
            currentPeriodStart: new Date(r.current_period_start).toISOString(),
            currentPeriodEnd: r.current_period_end ? new Date(r.current_period_end).toISOString() : '',
            cancelAtPeriodEnd: r.cancel_at_period_end,
            usage: r.usage_json || { usersCount: 1, leadsCount: 0, propertiesCount: 0, aiRequestsUsed: 0 },
          };
        }
      } catch (err) {
        console.error('PostgreSQL getSubscription error:', err);
      }
    }
    const sub = initMemoryDB().subscriptions.find((s) => s.organizationId === orgId);
    return sub || INITIAL_SUBSCRIPTION;
  },

  async getSubscriptions(): Promise<Subscription[]> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const res = await pool.query('SELECT * FROM subscriptions');
        return res.rows.map((r) => ({
          id: r.id,
          organizationId: r.organization_id,
          userId: r.user_id,
          tier: r.tier,
          status: r.status,
          priceMonthlyINR: r.price_monthly_inr,
          billingCycle: r.billing_cycle,
          currentPeriodStart: new Date(r.current_period_start).toISOString(),
          currentPeriodEnd: r.current_period_end ? new Date(r.current_period_end).toISOString() : '',
          cancelAtPeriodEnd: r.cancel_at_period_end,
          usage: r.usage_json || { usersCount: 1, leadsCount: 0, propertiesCount: 0, aiRequestsUsed: 0 },
        }));
      } catch (err) {
        console.error('PostgreSQL getSubscriptions error:', err);
      }
    }
    return initMemoryDB().subscriptions;
  },

  async upsertSubscription(sub: Subscription): Promise<Subscription> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        await pool.query(
          `INSERT INTO subscriptions (
             id, organization_id, user_id, tier, status, price_monthly_inr,
             billing_cycle, current_period_start, current_period_end, cancel_at_period_end, usage_json, updated_at
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()
           )
           ON CONFLICT (organization_id) DO UPDATE SET
             tier = EXCLUDED.tier,
             status = EXCLUDED.status,
             price_monthly_inr = EXCLUDED.price_monthly_inr,
             billing_cycle = EXCLUDED.billing_cycle,
             current_period_start = EXCLUDED.current_period_start,
             current_period_end = EXCLUDED.current_period_end,
             cancel_at_period_end = EXCLUDED.cancel_at_period_end,
             usage_json = EXCLUDED.usage_json,
             updated_at = NOW()`,
          [
            sub.id,
            sub.organizationId,
            sub.userId,
            sub.tier,
            sub.status,
            sub.priceMonthlyINR,
            sub.billingCycle,
            sub.currentPeriodStart,
            sub.currentPeriodEnd || null,
            sub.cancelAtPeriodEnd,
            JSON.stringify(sub.usage || {}),
          ]
        );
      } catch (err) {
        console.error('PostgreSQL upsertSubscription error:', err);
      }
    }

    const db = initMemoryDB();
    const index = db.subscriptions.findIndex((s) => s.organizationId === sub.organizationId);
    if (index >= 0) {
      db.subscriptions[index] = { ...db.subscriptions[index], ...sub };
    } else {
      db.subscriptions.push(sub);
    }
    await saveDBToDiskAndCloud(db);
    return sub;
  },

  async getSubscriptionByRazorpayId(rzpSubId: string): Promise<Subscription | null> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const res = await pool.query('SELECT * FROM subscriptions WHERE razorpay_subscription_id = $1', [rzpSubId]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            id: r.id,
            organizationId: r.organization_id,
            userId: r.user_id,
            tier: r.tier,
            status: r.status,
            priceMonthlyINR: r.price_monthly_inr,
            billingCycle: r.billing_cycle,
            currentPeriodStart: new Date(r.current_period_start).toISOString(),
            currentPeriodEnd: r.current_period_end ? new Date(r.current_period_end).toISOString() : '',
            cancelAtPeriodEnd: r.cancel_at_period_end,
            razorpaySubscriptionId: r.razorpay_subscription_id,
            usage: r.usage_json || { usersCount: 1, leadsCount: 0, propertiesCount: 0, aiRequestsUsed: 0 },
          };
        }
      } catch (err) {
        console.error('PostgreSQL getSubscriptionByRazorpayId error:', err);
      }
    }
    const sub = initMemoryDB().subscriptions.find((s) => s.razorpaySubscriptionId === rzpSubId);
    return sub || null;
  },

  async updateSubscriptionTier(
    orgId: string,
    tier: SubscriptionTier,
    billingCycle: 'monthly' | 'annual' = 'monthly'
  ): Promise<{ subscription: Subscription; planLimits: PlanLimits; warning?: string }> {
    const plan = SAAS_PLANS.find((p) => p.tier === tier) || SAAS_PLANS[0];
    const sub = (await this.getSubscription(orgId)) || {
      id: `sub-${orgId}`,
      organizationId: orgId,
      tier,
      status: 'ACTIVE',
      priceMonthlyINR: plan.priceMonthlyINR,
      billingCycle,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      usage: { usersCount: 1, leadsCount: 0, propertiesCount: 0, aiRequestsUsed: 0 },
    };

    const updatedSub: Subscription = {
      ...sub,
      tier,
      priceMonthlyINR: plan.priceMonthlyINR,
      billingCycle,
      status: 'ACTIVE',
    };

    await this.upsertSubscription(updatedSub);

    let warning: string | undefined = undefined;
    const currentUsage = await this.getStorageUsage(orgId);
    if (plan.storageLimitBytes !== -1 && currentUsage.usedBytes > plan.storageLimitBytes) {
      warning = `Account storage (${(currentUsage.usedBytes / (1024 * 1024 * 1024)).toFixed(2)}GB) exceeds the new ${plan.name} plan limit (${(plan.storageLimitBytes / (1024 * 1024 * 1024)).toFixed(2)}GB). Existing files are preserved, but new uploads are locked until space is freed.`;
    }

    return {
      subscription: updatedSub,
      planLimits: plan,
      warning,
    };
  },


  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  async getNotifications(orgId: string, userId?: string): Promise<NotificationItem[]> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const query = userId
          ? 'SELECT * FROM notifications WHERE organization_id = $1 AND (user_id IS NULL OR user_id = $2) ORDER BY created_at DESC LIMIT 50'
          : 'SELECT * FROM notifications WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 50';
        const params = userId ? [orgId, userId] : [orgId];
        const res = await pool.query(query, params);
        return res.rows.map((r) => ({
          id: r.id,
          organizationId: r.organization_id,
          userId: r.user_id || undefined,
          title: r.title,
          message: r.message,
          type: r.type,
          isRead: r.is_read,
          link: r.link || undefined,
          relatedEntityType: r.related_entity_type || undefined,
          relatedEntityId: r.related_entity_id || undefined,
          metadata: r.metadata || undefined,
          createdAt: new Date(r.created_at).toISOString(),
        }));
      } catch (err) {
        console.error('PostgreSQL getNotifications error:', err);
      }
    }

    const db = initMemoryDB();
    return db.notifications.filter((n) => n.organizationId === orgId);
  },

  async addNotification(notif: NotificationItem): Promise<NotificationItem> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        await pool.query(
          `INSERT INTO notifications (
             id, organization_id, user_id, title, message, type, is_read, link,
             related_entity_type, related_entity_id, metadata, created_at
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()
           ) ON CONFLICT (id) DO NOTHING`,
          [
            notif.id,
            notif.organizationId,
            notif.userId || null,
            notif.title,
            notif.message,
            notif.type,
            notif.isRead,
            notif.link || null,
            notif.relatedEntityType || null,
            notif.relatedEntityId || null,
            JSON.stringify(notif.metadata || {}),
          ]
        );
      } catch (err) {
        console.error('PostgreSQL addNotification error:', err);
      }
    }

    const db = initMemoryDB();
    db.notifications.unshift(notif);
    saveDBToDisk(db);
    return notif;
  },

  async markNotificationRead(id: string, orgId: string): Promise<boolean> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND organization_id = $2', [id, orgId]);
      } catch (err) {
        console.error('PostgreSQL markNotificationRead error:', err);
      }
    }

    const db = initMemoryDB();
    const notif = db.notifications.find((n) => n.id === id && n.organizationId === orgId);
    if (notif) {
      notif.isRead = true;
      saveDBToDisk(db);
      return true;
    }
    return false;
  },

  async markAllNotificationsRead(orgId: string): Promise<boolean> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        await pool.query('UPDATE notifications SET is_read = TRUE WHERE organization_id = $1', [orgId]);
      } catch (err) {
        console.error('PostgreSQL markAllNotificationsRead error:', err);
      }
    }

    const db = initMemoryDB();
    db.notifications.filter((n) => n.organizationId === orgId).forEach((n) => (n.isRead = true));
    saveDBToDisk(db);
    return true;
  },

  async deleteNotification(id: string, orgId?: string): Promise<boolean> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const query = orgId
          ? 'DELETE FROM notifications WHERE id = $1 AND organization_id = $2'
          : 'DELETE FROM notifications WHERE id = $1';
        const params = orgId ? [id, orgId] : [id];
        await pool.query(query, params);
      } catch (err) {
        console.error('PostgreSQL deleteNotification error:', err);
      }
    }

    const db = initMemoryDB();
    const index = db.notifications.findIndex((n) => n.id === id && (!orgId || n.organizationId === orgId));
    if (index === -1) return false;
    db.notifications.splice(index, 1);
    saveDBToDisk(db);
    return true;
  },

  // ==========================================
  // DOCUMENTS
  // ==========================================
  async getDocuments(orgId?: string): Promise<DocumentRecord[]> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const query = orgId
          ? 'SELECT * FROM documents WHERE organization_id = $1 ORDER BY created_at DESC'
          : 'SELECT * FROM documents ORDER BY created_at DESC';
        const params = orgId ? [orgId] : [];
        const res = await pool.query(query, params);
        if (res.rows.length > 0) {
          return res.rows.map((r) => ({
            id: r.id,
            organizationId: r.organization_id,
            title: r.title,
            category: (r.category || 'OTHER') as any,
            fileUrl: r.file_url,
            fileSizeMB: Number(((r.file_size || 0) / (1024 * 1024)).toFixed(2)),
            fileType: r.mime_type || 'application/pdf',
            relatedName: r.uploaded_by || undefined,
            createdAt: new Date(r.created_at).toISOString(),
          }));
        }
      } catch (err) {
        console.error('PostgreSQL getDocuments error:', err);
      }
    }

    const db = initMemoryDB();
    if (orgId) return db.documents.filter((d) => d.organizationId === orgId);
    return db.documents;
  },

  async addDocument(doc: DocumentRecord): Promise<DocumentRecord> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        await pool.query(
          `INSERT INTO documents (
             id, organization_id, title, category, file_name, file_size, mime_type, file_url, storage_key, uploaded_by, created_at
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()
           )`,
          [
            doc.id,
            doc.organizationId,
            doc.title,
            doc.category || 'OTHER',
            doc.title,
            Math.round((doc.fileSizeMB || 1) * 1024 * 1024),
            doc.fileType || 'application/pdf',
            doc.fileUrl,
            null,
            doc.relatedName || null,
          ]
        );
      } catch (err) {
        console.error('PostgreSQL addDocument error:', err);
      }
    }

    const db = initMemoryDB();
    db.documents.unshift(doc);
    saveDBToDisk(db);
    return doc;
  },

  async deleteDocument(id: string, orgId?: string): Promise<boolean> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const query = orgId
          ? 'DELETE FROM documents WHERE id = $1 AND organization_id = $2'
          : 'DELETE FROM documents WHERE id = $1';
        const params = orgId ? [id, orgId] : [id];
        const res = await pool.query(query, params);
        return (res.rowCount ?? 0) > 0;
      } catch (err) {
        console.error('PostgreSQL deleteDocument error:', err);
      }
    }

    const db = initMemoryDB();
    const index = db.documents.findIndex((d) => d.id === id && (!orgId || d.organizationId === orgId));
    if (index === -1) return false;
    db.documents.splice(index, 1);
    saveDBToDisk(db);
    return true;
  },

  // ==========================================
  // PAYMENTS & INVOICES
  // ==========================================
  async getPayments(orgId?: string): Promise<Payment[]> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const query = orgId
          ? 'SELECT * FROM payments WHERE organization_id = $1 ORDER BY created_at DESC'
          : 'SELECT * FROM payments ORDER BY created_at DESC';
        const params = orgId ? [orgId] : [];
        const res = await pool.query(query, params);
        return res.rows.map((r) => ({
          id: r.id,
          organizationId: r.organization_id,
          userId: r.user_id || undefined,
          subscriptionId: r.subscription_id || undefined,
          razorpayPaymentId: r.razorpay_payment_id || 'pay_manual',
          razorpayOrderId: r.razorpay_order_id || undefined,
          amount: Number(r.amount_inr || r.amount || 0),
          currency: r.currency || 'INR',
          status: (r.status || 'CAPTURED') as any,
          paymentMethod: r.method || r.payment_method || 'CARD',
          planTier: r.plan_tier || undefined,
          createdAt: new Date(r.created_at).toISOString(),
        }));
      } catch (err) {
        console.error('PostgreSQL getPayments error:', err);
      }
    }

    const db = initMemoryDB();
    if (orgId) return db.payments.filter((p) => p.organizationId === orgId);
    return db.payments;
  },

  async addPayment(payment: Payment): Promise<Payment> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        await pool.query(
          `INSERT INTO payments (id, organization_id, amount_inr, currency, status, method, razorpay_payment_id, razorpay_order_id, description, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
          [
            payment.id,
            payment.organizationId,
            payment.amount,
            payment.currency || 'INR',
            payment.status || 'CAPTURED',
            payment.paymentMethod || 'CARD',
            payment.razorpayPaymentId || null,
            payment.razorpayOrderId || null,
            null,
          ]
        );
      } catch (err) {
        console.error('PostgreSQL addPayment error:', err);
      }
    }

    const db = initMemoryDB();
    db.payments.unshift(payment);
    saveDBToDisk(db);
    return payment;
  },

  async getInvoices(orgId?: string): Promise<Invoice[]> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const query = orgId
          ? 'SELECT * FROM invoices WHERE organization_id = $1 ORDER BY created_at DESC'
          : 'SELECT * FROM invoices ORDER BY created_at DESC';
        const params = orgId ? [orgId] : [];
        const res = await pool.query(query, params);
        return res.rows.map((r) => ({
          id: r.id,
          organizationId: r.organization_id,
          userId: r.user_id || undefined,
          subscriptionId: r.subscription_id || undefined,
          invoiceNumber: r.invoice_number,
          amountINR: Number(r.amount_inr || 0),
          taxINR: Number(r.tax_inr || Math.round(Number(r.amount_inr || 0) * 0.18)),
          totalINR: Number(r.total_inr || Math.round(Number(r.amount_inr || 0) * 1.18)),
          status: (r.status || 'paid') as any,
          paymentMethod: r.payment_method || 'Razorpay',
          pdfUrl: r.invoice_url || undefined,
          billingPeriodStart: r.billing_period_start ? new Date(r.billing_period_start).toISOString() : '',
          billingPeriodEnd: r.billing_period_end ? new Date(r.billing_period_end).toISOString() : '',
          createdAt: new Date(r.created_at).toISOString(),
        }));
      } catch (err) {
        console.error('PostgreSQL getInvoices error:', err);
      }
    }

    const db = initMemoryDB();
    if (orgId) return db.invoices.filter((i) => i.organizationId === orgId);
    return db.invoices;
  },

  async addInvoice(invoice: Invoice): Promise<Invoice> {
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        await pool.query(
          `INSERT INTO invoices (id, organization_id, invoice_number, amount_inr, tier, status, billing_period_start, billing_period_end, invoice_url, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
          [
            invoice.id,
            invoice.organizationId,
            invoice.invoiceNumber,
            invoice.amountINR,
            'STARTER',
            invoice.status,
            invoice.billingPeriodStart || null,
            invoice.billingPeriodEnd || null,
            invoice.pdfUrl || null,
          ]
        );
      } catch (err) {
        console.error('PostgreSQL addInvoice error:', err);
      }
    }

    const db = initMemoryDB();
    db.invoices.unshift(invoice);
    saveDBToDisk(db);
    return invoice;
  },

  // ==========================================
  // AI USAGE & WEBHOOKS
  // ==========================================
  getAIUsageCount(orgId: string): number {
    return initMemoryDB().aiRequestsUsed[orgId] || 0;
  },

  incrementAIUsage(orgId: string): number {
    const db = initMemoryDB();
    db.aiRequestsUsed[orgId] = (db.aiRequestsUsed[orgId] || 0) + 1;
    saveDBToDisk(db);
    return db.aiRequestsUsed[orgId];
  },

  recordAIUsage(orgId: string, _tokens?: number): number {
    return this.incrementAIUsage(orgId);
  },


  isWebhookProcessed(eventId: string): boolean {
    return initMemoryDB().processedWebhooks.includes(eventId);
  },

  markWebhookProcessed(eventId: string): void {
    const db = initMemoryDB();
    if (!db.processedWebhooks.includes(eventId)) {
      db.processedWebhooks.push(eventId);
      saveDBToDisk(db);
    }
  },

  async updateUserPassword(email: string, passwordHash: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        const res = await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE LOWER(email) = $2', [passwordHash, cleanEmail]);
        if ((res.rowCount ?? 0) > 0) return true;
      } catch (err) {
        console.error('PostgreSQL updateUserPassword error:', err);
      }
    }

    const db = initMemoryDB();
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (user) {
      user.passwordHash = passwordHash;
      await saveDBToDiskAndCloud(db);
      return true;
    }
    return false;
  },

  async recordUserLogin(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    const nowIso = new Date().toISOString();

    if (isPostgresConfigured()) {
      await initPostgresSchema();
      const pool = getPgPool()!;
      try {
        await pool.query(
          'UPDATE users SET last_login_at = NOW(), last_active_at = NOW(), updated_at = NOW() WHERE LOWER(email) = $1',
          [cleanEmail]
        );
      } catch (err) {
        console.error('PostgreSQL recordUserLogin error:', err);
      }
    }

    const db = initMemoryDB();
    const user = db.users.find((u) => u.email && u.email.toLowerCase() === cleanEmail);
    if (user) {
      user.lastLoginAt = nowIso;
      user.lastActiveAt = nowIso;
      await saveDBToDiskAndCloud(db);
    }
  },

  async getRegisteredUsersForOwner(): Promise<OwnerMonitoringUser[]> {
    await ensureCloudSynced(true);
    const db = initMemoryDB();

    let allUsers = [...db.users];
    if (isPostgresConfigured()) {
      try {
        const pgUsers = await this.getUsers();
        for (const pgu of pgUsers) {
          const existingIdx = allUsers.findIndex(
            (u) => (u.id && u.id === pgu.id) || (u.email && u.email.toLowerCase() === pgu.email.toLowerCase())
          );
          if (existingIdx >= 0) {
            allUsers[existingIdx] = { ...allUsers[existingIdx], ...pgu };
          } else {
            allUsers.push(pgu);
          }
        }
      } catch (err) {
        console.error('getRegisteredUsersForOwner pgUsers error:', err);
      }
    }

    const organizations = db.organizations;
    const subscriptions = db.subscriptions;
    const ownerEmail = (process.env.OWNER_EMAIL || 'srilakshman73@gmail.com').toLowerCase().trim();

    const enrichedUsers: OwnerMonitoringUser[] = allUsers.map((user) => {
      const org = organizations.find((o) => o.id === user.organizationId);
      const sub = subscriptions.find((s) => s.organizationId === user.organizationId);

      const isOwnerAccount = user.role === 'OWNER' || (user.email && user.email.toLowerCase() === ownerEmail);

      const memberCount = allUsers.filter((u) => u.organizationId === user.organizationId).length || 1;

      const subStatus: SubscriptionStatus = sub?.status || 'TRIALING';
      const trialEndDate = sub?.currentPeriodEnd || '';
      let isTrialActive = false;
      let trialDaysRemaining = 0;

      if (subStatus === 'TRIALING' && trialEndDate) {
        const remainingMs = new Date(trialEndDate).getTime() - Date.now();
        trialDaysRemaining = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
        isTrialActive = remainingMs > 0;
      }

      const planTier: SubscriptionTier = sub?.tier || 'STARTER';
      const planName = planTier === 'BUSINESS' ? 'Business' : planTier === 'PROFESSIONAL' ? 'Professional' : 'Starter';

      const displayName = user.name && user.name.trim().length > 0 ? user.name.trim() : 'Not provided';
      const displayPhone = user.phone && user.phone.trim().length > 0 ? user.phone.trim() : 'Not provided';
      const displayOrgName = org?.name && org.name.trim().length > 0 ? org.name.trim() : 'Not provided';
      const registrationDate = user.createdAt || org?.createdAt || 'Not provided';
      const lastLoginAt = user.lastLoginAt || 'Never logged in';
      const lastActiveAt = user.lastActiveAt || user.lastLoginAt || 'Not tracked';

      return {
        id: user.id,
        name: displayName,
        email: user.email.toLowerCase(),
        phone: displayPhone,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: displayOrgName,
        registrationDate,
        lastLoginAt,
        lastActiveAt,
        accountStatus: 'ACTIVE',
        trialStartDate: sub?.currentPeriodStart || org?.createdAt || registrationDate,
        trialEndDate: trialEndDate || 'Not provided',
        isTrialActive,
        trialDaysRemaining,
        planTier,
        planName,
        subscriptionStatus: subStatus,
        organizationMemberCount: memberCount,
        isOwner: Boolean(isOwnerAccount),
      };
    });

    return enrichedUsers;
  },
};
