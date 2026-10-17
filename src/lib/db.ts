import { Pool, PoolConfig } from 'pg';
import {
  Organization,
  User,
  Property,
  Lead,
  Client,
  Deal,
  Subscription,
  Payment,
  Invoice,
  Appointment,
  StorageAsset,
  NotificationItem,
  DocumentRecord,
  StorageUsage,
} from '@/types';
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

// Global singleton for connection pooling across Next.js API routes
declare global {
  var __velvetPgPool: Pool | undefined;
  var __velvetDbInitialized: boolean | undefined;
}

function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
}

export function isPostgresConfigured(): boolean {
  const url = getDatabaseUrl();
  return Boolean(url && url.trim().length > 0 && !url.includes('example.com'));
}

export function getPgPool(): Pool | null {
  const connectionString = getDatabaseUrl();
  if (!connectionString || connectionString.includes('example.com')) {
    return null;
  }

  if (!global.__velvetPgPool) {
    const config: PoolConfig = {
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

    // Enable SSL for cloud hosted Postgres (Neon, Supabase, Vercel Postgres, Railway)
    if (!connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')) {
      config.ssl = {
        rejectUnauthorized: false,
      };
    }

    global.__velvetPgPool = new Pool(config);
  }

  return global.__velvetPgPool;
}

/**
 * Initializes PostgreSQL schema with all required CRM tables if they don't already exist.
 * Safe, idempotent, non-destructive to existing tables and records.
 */
export async function initPostgresSchema(): Promise<boolean> {
  const pool = getPgPool();
  if (!pool) return false;

  if (global.__velvetDbInitialized) {
    return true;
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Organizations
      await client.query(`
        CREATE TABLE IF NOT EXISTS organizations (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          logo_url TEXT,
          phone VARCHAR(50),
          email VARCHAR(255),
          address TEXT,
          city VARCHAR(100),
          state VARCHAR(100),
          country VARCHAR(100) DEFAULT 'India',
          business_type VARCHAR(50) DEFAULT 'AGENCY',
          website TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
      `);

      // 2. Users
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          phone VARCHAR(50),
          avatar_url TEXT,
          password_hash TEXT,
          role VARCHAR(50) DEFAULT 'ADMIN',
          organization_id VARCHAR(100) REFERENCES organizations(id) ON DELETE CASCADE,
          is_super_admin BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      `);

      // 3. Subscriptions
      await client.query(`
        CREATE TABLE IF NOT EXISTS subscriptions (
          id VARCHAR(100) PRIMARY KEY,
          organization_id VARCHAR(100) NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
          user_id VARCHAR(100),
          tier VARCHAR(50) DEFAULT 'STARTER',
          status VARCHAR(50) DEFAULT 'TRIALING',
          price_monthly_inr INTEGER DEFAULT 1999,
          billing_cycle VARCHAR(20) DEFAULT 'monthly',
          current_period_start TIMESTAMPTZ DEFAULT NOW(),
          current_period_end TIMESTAMPTZ,
          cancel_at_period_end BOOLEAN DEFAULT FALSE,
          razorpay_subscription_id VARCHAR(100),
          razorpay_customer_id VARCHAR(100),
          usage_json JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // 4. Leads
      await client.query(`
        CREATE TABLE IF NOT EXISTS leads (
          id VARCHAR(100) PRIMARY KEY,
          organization_id VARCHAR(100) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          email VARCHAR(255),
          source VARCHAR(100) DEFAULT 'WEBSITE',
          status VARCHAR(50) DEFAULT 'NEW',
          priority VARCHAR(50) DEFAULT 'MEDIUM',
          score INTEGER DEFAULT 75,
          budget_min_inr BIGINT,
          budget_max_inr BIGINT,
          preferred_location TEXT,
          preferred_type VARCHAR(50),
          interested_property_id VARCHAR(100),
          interested_property_name VARCHAR(255),
          assigned_to_id VARCHAR(100),
          assigned_to_name VARCHAR(255),
          notes TEXT,
          image_url TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_leads_org ON leads(organization_id);
        CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(organization_id, status);
        CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(organization_id, created_at DESC);
      `);

      // 5. Properties
      await client.query(`
        CREATE TABLE IF NOT EXISTS properties (
          id VARCHAR(100) PRIMARY KEY,
          organization_id VARCHAR(100) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          type VARCHAR(50) DEFAULT 'APARTMENT',
          status VARCHAR(50) DEFAULT 'AVAILABLE',
          price_inr BIGINT NOT NULL,
          area_sqft INTEGER,
          bedrooms INTEGER,
          bathrooms INTEGER,
          location VARCHAR(255),
          city VARCHAR(100),
          state VARCHAR(100),
          featured_image TEXT,
          gallery TEXT[],
          description TEXT,
          amenities TEXT[],
          assigned_agent_id VARCHAR(100),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_properties_org ON properties(organization_id);
      `);

      // 6. Clients
      await client.query(`
        CREATE TABLE IF NOT EXISTS clients (
          id VARCHAR(100) PRIMARY KEY,
          organization_id VARCHAR(100) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          email VARCHAR(255),
          address TEXT,
          city VARCHAR(100),
          state VARCHAR(100),
          total_deals_count INTEGER DEFAULT 0,
          total_deals_value_inr BIGINT DEFAULT 0,
          assigned_agent_id VARCHAR(100),
          assigned_agent_name VARCHAR(255),
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_clients_org ON clients(organization_id);
      `);

      // 7. Deals
      await client.query(`
        CREATE TABLE IF NOT EXISTS deals (
          id VARCHAR(100) PRIMARY KEY,
          organization_id VARCHAR(100) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          lead_id VARCHAR(100),
          client_id VARCHAR(100),
          property_id VARCHAR(100),
          value_inr BIGINT NOT NULL,
          stage VARCHAR(50) DEFAULT 'NEW_LEAD',
          expected_close_date TIMESTAMPTZ,
          assigned_agent_id VARCHAR(100),
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_deals_org ON deals(organization_id);
      `);

      // 8. Appointments
      await client.query(`
        CREATE TABLE IF NOT EXISTS appointments (
          id VARCHAR(100) PRIMARY KEY,
          organization_id VARCHAR(100) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          appointment_type VARCHAR(50) DEFAULT 'SITE_VISIT',
          status VARCHAR(50) DEFAULT 'SCHEDULED',
          start_at TIMESTAMPTZ NOT NULL,
          end_at TIMESTAMPTZ NOT NULL,
          duration_minutes INTEGER DEFAULT 60,
          location VARCHAR(255),
          lead_id VARCHAR(100),
          lead_name VARCHAR(255),
          client_id VARCHAR(100),
          client_name VARCHAR(255),
          property_id VARCHAR(100),
          property_title VARCHAR(255),
          assigned_user_id VARCHAR(100),
          assigned_user_name VARCHAR(255),
          reminder_minutes INTEGER DEFAULT 15,
          reminder_sent BOOLEAN DEFAULT FALSE,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_appointments_org ON appointments(organization_id);
        CREATE INDEX IF NOT EXISTS idx_appointments_start ON appointments(organization_id, start_at);
      `);

      // 9. Documents
      await client.query(`
        CREATE TABLE IF NOT EXISTS documents (
          id VARCHAR(100) PRIMARY KEY,
          organization_id VARCHAR(100) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          category VARCHAR(100) DEFAULT 'CONTRACT',
          file_name VARCHAR(255) NOT NULL,
          file_size INTEGER DEFAULT 0,
          mime_type VARCHAR(100) DEFAULT 'application/pdf',
          file_url TEXT NOT NULL,
          storage_key TEXT,
          uploaded_by VARCHAR(100),
          related_entity_type VARCHAR(50),
          related_entity_id VARCHAR(100),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_documents_org ON documents(organization_id);
      `);

      // 10. Notifications
      await client.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id VARCHAR(100) PRIMARY KEY,
          organization_id VARCHAR(100) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          user_id VARCHAR(100),
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50) DEFAULT 'SYSTEM',
          is_read BOOLEAN DEFAULT FALSE,
          link TEXT,
          related_entity_type VARCHAR(50),
          related_entity_id VARCHAR(100),
          metadata JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_notifications_org ON notifications(organization_id, is_read);
      `);

      // 11. Storage Assets (Cloud Object Storage Metadata & Binary Fallback)
      await client.query(`
        CREATE TABLE IF NOT EXISTS storage_assets (
          id VARCHAR(100) PRIMARY KEY,
          organization_id VARCHAR(100) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          uploaded_by VARCHAR(100),
          file_name VARCHAR(255) NOT NULL,
          original_file_name VARCHAR(255) NOT NULL,
          mime_type VARCHAR(100) NOT NULL,
          file_size INTEGER NOT NULL,
          storage_key TEXT NOT NULL UNIQUE,
          storage_url TEXT NOT NULL,
          entity_type VARCHAR(50) DEFAULT 'OTHER',
          entity_id VARCHAR(100),
          binary_data BYTEA,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          deleted_at TIMESTAMPTZ
        );
        CREATE INDEX IF NOT EXISTS idx_storage_assets_org ON storage_assets(organization_id);
        CREATE INDEX IF NOT EXISTS idx_storage_assets_key ON storage_assets(storage_key);
      `);

      // 12. Payments & Invoices
      await client.query(`
        CREATE TABLE IF NOT EXISTS payments (
          id VARCHAR(100) PRIMARY KEY,
          organization_id VARCHAR(100) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          amount_inr INTEGER NOT NULL,
          currency VARCHAR(10) DEFAULT 'INR',
          status VARCHAR(50) DEFAULT 'PAID',
          method VARCHAR(50) DEFAULT 'RAZORPAY',
          razorpay_payment_id VARCHAR(100),
          razorpay_order_id VARCHAR(100),
          razorpay_subscription_id VARCHAR(100),
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS invoices (
          id VARCHAR(100) PRIMARY KEY,
          organization_id VARCHAR(100) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          invoice_number VARCHAR(100) NOT NULL,
          amount_inr INTEGER NOT NULL,
          tier VARCHAR(50) DEFAULT 'STARTER',
          status VARCHAR(50) DEFAULT 'PAID',
          billing_period_start TIMESTAMPTZ,
          billing_period_end TIMESTAMPTZ,
          invoice_url TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // 13. App Key-Value Store (For webhooks, usage metrics, audit)
      await client.query(`
        CREATE TABLE IF NOT EXISTS app_kv (
          key VARCHAR(255) PRIMARY KEY,
          value JSONB NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Idempotent migrations for existing production databases
      await client.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

        ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trial_starts_at TIMESTAMPTZ;
        ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
        ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'STARTER';
        ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'TRIALING';

        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_starts_at TIMESTAMPTZ;
        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS razorpay_subscription_id VARCHAR(100);
        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS razorpay_customer_id VARCHAR(100);
        ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS usage_json JSONB DEFAULT '{}'::jsonb;

        ALTER TABLE storage_assets ADD COLUMN IF NOT EXISTS binary_data BYTEA;
        ALTER TABLE storage_assets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
      `);

      await client.query('COMMIT');

      // Seed baseline master owner & demo org if table was completely empty
      const countRes = await client.query('SELECT COUNT(*) FROM organizations');
      if (parseInt(countRes.rows[0].count, 10) === 0) {
        for (const org of INITIAL_ORGANIZATIONS) {
          await client.query(
            `INSERT INTO organizations (id, name, slug, phone, email, city, state, country, business_type, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             ON CONFLICT (id) DO NOTHING`,
            [org.id, org.name, org.slug, org.phone, org.email, org.city, org.state, org.country, org.businessType, org.createdAt, org.createdAt]
          );
        }

        for (const user of INITIAL_USERS) {
          await client.query(
            `INSERT INTO users (id, name, email, phone, role, organization_id, is_super_admin, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
             ON CONFLICT (id) DO NOTHING`,
            [user.id, user.name, user.email, user.phone, user.role, user.organizationId, user.isSuperAdmin || false]
          );
        }

        // Add initial baseline subscription
        await client.query(
          `INSERT INTO subscriptions (id, organization_id, user_id, tier, status, price_monthly_inr, billing_cycle, current_period_start, current_period_end, usage_json)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO NOTHING`,
          [
            INITIAL_SUBSCRIPTION.id,
            INITIAL_SUBSCRIPTION.organizationId,
            INITIAL_SUBSCRIPTION.userId,
            INITIAL_SUBSCRIPTION.tier,
            INITIAL_SUBSCRIPTION.status,
            INITIAL_SUBSCRIPTION.priceMonthlyINR,
            INITIAL_SUBSCRIPTION.billingCycle,
            INITIAL_SUBSCRIPTION.currentPeriodStart,
            INITIAL_SUBSCRIPTION.currentPeriodEnd,
            JSON.stringify(INITIAL_SUBSCRIPTION.usage),
          ]
        );
      }

      global.__velvetDbInitialized = true;
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Failed to initialize PostgreSQL schema:', error);
    return false;
  }
}
