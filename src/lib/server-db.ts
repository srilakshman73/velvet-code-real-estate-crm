import fs from 'fs';
import path from 'path';
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
} from '@/types';

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
  aiRequestsUsed: Record<string, number>; // orgId -> count
  processedWebhooks: string[];
}

// Global server-side state cache across requests in Next.js runtime
declare global {
  var __velvetServerDB: VelvetDBSchema | undefined;
}

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
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    return path.join(tmpDir, 'velvet-db.json');
  }
}

function saveDBToDisk(db: VelvetDBSchema) {
  try {
    const filePath = getPersistenceFilePath();
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    // Non-fatal if filesystem is read-only (e.g. AWS Lambda / Vercel Edge)
  }
}

function loadDBFromDisk(): Partial<VelvetDBSchema> | null {
  try {
    const filePath = getPersistenceFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // Fallback to fresh state
  }
  return null;
}

function initDB(): VelvetDBSchema {
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
  // Organizations
  getOrganizations: () => initDB().organizations,
  getUsers: () => initDB().users,

  // Properties
  getProperties: (orgId?: string) => {
    const db = initDB();
    if (orgId) return db.properties.filter((p) => p.organizationId === orgId);
    return db.properties;
  },
  getPropertyById: (id: string, orgId?: string) => {
    const db = initDB();
    return db.properties.find((p) => p.id === id && (!orgId || p.organizationId === orgId));
  },
  addProperty: (property: Property) => {
    const db = initDB();
    db.properties.unshift(property);
    saveDBToDisk(db);
    return property;
  },
  updateProperty: (id: string, updates: Partial<Property>, orgId?: string) => {
    const db = initDB();
    const index = db.properties.findIndex((p) => p.id === id && (!orgId || p.organizationId === orgId));
    if (index === -1) return null;
    db.properties[index] = { ...db.properties[index], ...updates, updatedAt: new Date().toISOString() };
    saveDBToDisk(db);
    return db.properties[index];
  },
  deleteProperty: (id: string, orgId?: string) => {
    const db = initDB();
    const index = db.properties.findIndex((p) => p.id === id && (!orgId || p.organizationId === orgId));
    if (index === -1) return false;
    db.properties.splice(index, 1);
    saveDBToDisk(db);
    return true;
  },

  // Leads
  getLeads: (orgId?: string) => {
    const db = initDB();
    if (orgId) return db.leads.filter((l) => l.organizationId === orgId);
    return db.leads;
  },
  getLeadById: (id: string, orgId?: string) => {
    const db = initDB();
    return db.leads.find((l) => l.id === id && (!orgId || l.organizationId === orgId));
  },
  addLead: (lead: Lead) => {
    const db = initDB();
    db.leads.unshift(lead);
    saveDBToDisk(db);
    return lead;
  },
  updateLead: (id: string, updates: Partial<Lead>, orgId?: string) => {
    const db = initDB();
    const index = db.leads.findIndex((l) => l.id === id && (!orgId || l.organizationId === orgId));
    if (index === -1) return null;
    db.leads[index] = { ...db.leads[index], ...updates, updatedAt: new Date().toISOString() };
    saveDBToDisk(db);
    return db.leads[index];
  },
  deleteLead: (id: string, orgId?: string) => {
    const db = initDB();
    const index = db.leads.findIndex((l) => l.id === id && (!orgId || l.organizationId === orgId));
    if (index === -1) return false;
    db.leads.splice(index, 1);
    saveDBToDisk(db);
    return true;
  },

  // Clients
  getClients: (orgId?: string) => {
    const db = initDB();
    if (orgId) return db.clients.filter((c) => c.organizationId === orgId);
    return db.clients;
  },
  getClientById: (id: string, orgId?: string) => {
    const db = initDB();
    return db.clients.find((c) => c.id === id && (!orgId || c.organizationId === orgId));
  },
  addClient: (client: Client) => {
    const db = initDB();
    db.clients.unshift(client);
    saveDBToDisk(db);
    return client;
  },
  updateClient: (id: string, updates: Partial<Client>, orgId?: string) => {
    const db = initDB();
    const index = db.clients.findIndex((c) => c.id === id && (!orgId || c.organizationId === orgId));
    if (index === -1) return null;
    db.clients[index] = { ...db.clients[index], ...updates, updatedAt: new Date().toISOString() };
    saveDBToDisk(db);
    return db.clients[index];
  },
  deleteClient: (id: string, orgId?: string) => {
    const db = initDB();
    const index = db.clients.findIndex((c) => c.id === id && (!orgId || c.organizationId === orgId));
    if (index === -1) return false;
    db.clients.splice(index, 1);
    saveDBToDisk(db);
    return true;
  },

  // Deals
  getDeals: () => initDB().deals,

  // Documents
  getDocuments: (orgId?: string) => {
    const db = initDB();
    if (orgId) return db.documents.filter((d) => d.organizationId === orgId);
    return db.documents;
  },
  addDocument: (doc: DocumentRecord) => {
    const db = initDB();
    db.documents.unshift(doc);
    saveDBToDisk(db);
    return doc;
  },
  deleteDocument: (id: string, orgId?: string) => {
    const db = initDB();
    const index = db.documents.findIndex((d) => d.id === id && (!orgId || d.organizationId === orgId));
    if (index === -1) return false;
    db.documents.splice(index, 1);
    saveDBToDisk(db);
    return true;
  },

  // Storage Assets (Persistent Cloud File Records)
  getStorageAssets: (orgId?: string): StorageAsset[] => {
    const db = initDB();
    const assets = db.storageAssets.filter((a) => !a.deletedAt);
    if (orgId) return assets.filter((a) => a.organizationId === orgId);
    return assets;
  },
  getStorageAssetById: (id: string, orgId?: string): StorageAsset | undefined => {
    const db = initDB();
    return db.storageAssets.find((a) => a.id === id && !a.deletedAt && (!orgId || a.organizationId === orgId));
  },
  getStorageAssetByKey: (key: string): StorageAsset | undefined => {
    const db = initDB();
    return db.storageAssets.find((a) => a.storageKey === key && !a.deletedAt);
  },
  addStorageAsset: (asset: StorageAsset): StorageAsset => {
    const db = initDB();
    db.storageAssets.unshift(asset);
    saveDBToDisk(db);
    return asset;
  },
  deleteStorageAsset: (id: string, orgId?: string): boolean => {
    const db = initDB();
    const asset = db.storageAssets.find((a) => a.id === id && (!orgId || a.organizationId === orgId));
    if (!asset) return false;
    asset.deletedAt = new Date().toISOString();
    saveDBToDisk(db);
    return true;
  },
  getStorageUsage: (orgId: string): StorageUsage => {
    const db = initDB();
    const orgAssets = db.storageAssets.filter((a) => a.organizationId === orgId && !a.deletedAt);
    const usedBytes = orgAssets.reduce((sum, a) => sum + (a.fileSize || 0), 0);
    const planLimits = serverDB.getOrgPlanLimits(orgId);
    const limitBytes = planLimits.storageLimitBytes || 1073741824; // Default 1GB
    const availableBytes = limitBytes === -1 ? Number.MAX_SAFE_INTEGER : Math.max(0, limitBytes - usedBytes);
    const usagePercent = limitBytes > 0 ? Math.min(100, Math.round((usedBytes / limitBytes) * 100)) : 0;

    const sub = serverDB.getSubscription(orgId);
    return {
      usedBytes,
      limitBytes,
      availableBytes,
      usagePercent,
      fileCount: orgAssets.length,
      tier: sub?.tier || 'STARTER',
      planName: planLimits.name,
    };
  },

  // Appointments (CRM Calendar)
  getAppointments: (
    orgId?: string,
    filters?: {
      clientId?: string;
      leadId?: string;
      propertyId?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Appointment[] => {
    const db = initDB();
    let result = orgId ? db.appointments.filter((a) => a.organizationId === orgId) : db.appointments;

    if (filters?.clientId) {
      result = result.filter((a) => a.clientId === filters.clientId);
    }
    if (filters?.leadId) {
      result = result.filter((a) => a.leadId === filters.leadId);
    }
    if (filters?.propertyId) {
      result = result.filter((a) => a.propertyId === filters.propertyId);
    }
    if (filters?.startDate) {
      result = result.filter((a) => a.startAt >= filters.startDate!);
    }
    if (filters?.endDate) {
      result = result.filter((a) => a.startAt <= filters.endDate!);
    }

    return result.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  },
  getAppointmentById: (id: string, orgId?: string): Appointment | undefined => {
    const db = initDB();
    return db.appointments.find((a) => a.id === id && (!orgId || a.organizationId === orgId));
  },
  addAppointment: (appointment: Appointment): Appointment => {
    const db = initDB();
    db.appointments.unshift(appointment);

    // Automatically generate persistent notification for this appointment reminder
    const notif: NotificationItem = {
      id: `notif-apt-${appointment.id}`,
      organizationId: appointment.organizationId,
      userId: appointment.assignedUserId,
      title: 'Upcoming Appointment Scheduled',
      message: `${appointment.title} on ${new Date(appointment.startAt).toLocaleDateString()} at ${new Date(appointment.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      type: 'APPOINTMENT',
      isRead: false,
      link: '/app/calendar',
      relatedEntityType: 'Appointment',
      relatedEntityId: appointment.id,
      metadata: {
        clientName: appointment.clientName,
        leadName: appointment.leadName,
        propertyTitle: appointment.propertyTitle,
        time: `${new Date(appointment.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        location: appointment.location || 'Site Office',
        appointmentId: appointment.id,
      },
      createdAt: new Date().toISOString(),
    };
    db.notifications.unshift(notif);

    saveDBToDisk(db);
    return appointment;
  },
  updateAppointment: (id: string, updates: Partial<Appointment>, orgId?: string): Appointment | null => {
    const db = initDB();
    const index = db.appointments.findIndex((a) => a.id === id && (!orgId || a.organizationId === orgId));
    if (index === -1) return null;
    db.appointments[index] = { ...db.appointments[index], ...updates, updatedAt: new Date().toISOString() };
    saveDBToDisk(db);
    return db.appointments[index];
  },
  deleteAppointment: (id: string, orgId?: string): boolean => {
    const db = initDB();
    const index = db.appointments.findIndex((a) => a.id === id && (!orgId || a.organizationId === orgId));
    if (index === -1) return false;
    db.appointments.splice(index, 1);
    // Also remove linked notification
    db.notifications = db.notifications.filter((n) => n.relatedEntityId !== id);
    saveDBToDisk(db);
    return true;
  },

  // Notifications
  getNotifications: (orgId?: string, userId?: string): NotificationItem[] => {
    const db = initDB();
    let result = orgId ? db.notifications.filter((n) => n.organizationId === orgId) : db.notifications;
    if (userId) {
      result = result.filter((n) => !n.userId || n.userId === userId);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  addNotification: (notif: NotificationItem): NotificationItem => {
    const db = initDB();
    db.notifications.unshift(notif);
    saveDBToDisk(db);
    return notif;
  },
  markNotificationRead: (id: string, orgId?: string): boolean => {
    const db = initDB();
    const notif = db.notifications.find((n) => n.id === id && (!orgId || n.organizationId === orgId));
    if (!notif) return false;
    notif.isRead = true;
    notif.readAt = new Date().toISOString();
    saveDBToDisk(db);
    return true;
  },
  markAllNotificationsRead: (orgId: string): void => {
    const db = initDB();
    db.notifications.forEach((n) => {
      if (n.organizationId === orgId) {
        n.isRead = true;
        n.readAt = new Date().toISOString();
      }
    });
    saveDBToDisk(db);
  },
  deleteNotification: (id: string, orgId?: string): boolean => {
    const db = initDB();
    const index = db.notifications.findIndex((n) => n.id === id && (!orgId || n.organizationId === orgId));
    if (index === -1) return false;
    db.notifications.splice(index, 1);
    saveDBToDisk(db);
    return true;
  },

  // AI Usage Tracking
  recordAIUsage: (orgId: string, tokens: number = 50): number => {
    const db = initDB();
    db.aiRequestsUsed[orgId] = (db.aiRequestsUsed[orgId] || 0) + 1;
    // Also reflect on subscription usage if present
    const sub = db.subscriptions.find((s) => s.organizationId === orgId);
    if (sub) {
      sub.usage.aiRequestsUsed = (sub.usage.aiRequestsUsed || 0) + 1;
    }
    saveDBToDisk(db);
    return db.aiRequestsUsed[orgId];
  },
  getAIUsageCount: (orgId: string): number => {
    const db = initDB();
    return db.aiRequestsUsed[orgId] || 0;
  },

  // Subscription operations & Plan Upgrade/Downgrade Automation
  getSubscriptions: () => initDB().subscriptions,
  getSubscription: (orgId: string): Subscription | undefined => {
    const db = initDB();
    return db.subscriptions.find((s) => s.organizationId === orgId);
  },
  getSubscriptionByRazorpayId: (razorpaySubId: string): Subscription | undefined => {
    const db = initDB();
    return db.subscriptions.find((s) => s.razorpaySubscriptionId === razorpaySubId);
  },
  upsertSubscription: (sub: Subscription): Subscription => {
    const db = initDB();
    const index = db.subscriptions.findIndex((s) => s.organizationId === sub.organizationId);
    if (index >= 0) {
      db.subscriptions[index] = { ...db.subscriptions[index], ...sub, updatedAt: new Date().toISOString() };
      saveDBToDisk(db);
      return db.subscriptions[index];
    } else {
      const newSub = { ...sub, createdAt: sub.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
      db.subscriptions.unshift(newSub);
      saveDBToDisk(db);
      return newSub;
    }
  },
  updateSubscriptionTier: (
    orgId: string,
    tier: SubscriptionTier,
    billingCycle: 'monthly' | 'annual' = 'monthly'
  ): { subscription: Subscription; planLimits: PlanLimits; warning?: string } => {
    const db = initDB();
    const targetPlan = SAAS_PLANS.find((p) => p.tier === tier) || SAAS_PLANS[0];
    const currentSub = db.subscriptions.find((s) => s.organizationId === orgId);

    // Calculate current usage to detect downgrade warnings
    const usage = serverDB.getStorageUsage(orgId);
    let warning: string | undefined = undefined;
    if (targetPlan.storageLimitBytes !== -1 && usage.usedBytes > targetPlan.storageLimitBytes) {
      warning = 'Your current storage usage exceeds the storage limit of the selected plan. Please delete files before uploading new content.';
    }

    const updatedSub: Subscription = {
      id: currentSub?.id || `sub-${orgId}`,
      organizationId: orgId,
      tier,
      status: 'ACTIVE',
      priceMonthlyINR: targetPlan.priceMonthlyINR,
      billingCycle,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: currentSub?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usage: {
        usersCount: currentSub?.usage.usersCount || 1,
        leadsCount: db.leads.filter((l) => l.organizationId === orgId).length,
        propertiesCount: db.properties.filter((p) => p.organizationId === orgId).length,
        aiRequestsUsed: db.aiRequestsUsed[orgId] || 0,
        storageUsedBytes: usage.usedBytes,
      },
    };

    serverDB.upsertSubscription(updatedSub);

    return {
      subscription: updatedSub,
      planLimits: targetPlan,
      warning,
    };
  },

  // Authoritative limits helper
  getOrgPlanLimits: (orgId: string): PlanLimits => {
    const sub = serverDB.getSubscription(orgId);
    const tier = sub?.tier || 'STARTER';
    return SAAS_PLANS.find((p) => p.tier === tier) || SAAS_PLANS[0];
  },

  // Payments & Invoices
  getPayments: (orgId?: string) => {
    const db = initDB();
    if (orgId) return db.payments.filter((p) => p.organizationId === orgId);
    return db.payments;
  },
  getInvoices: (orgId?: string) => {
    const db = initDB();
    if (orgId) return db.invoices.filter((inv) => inv.organizationId === orgId);
    return db.invoices;
  },
  addPayment: (payment: Payment): Payment => {
    const db = initDB();
    const existingIndex = db.payments.findIndex((p) => p.razorpayPaymentId === payment.razorpayPaymentId);
    if (existingIndex >= 0) {
      db.payments[existingIndex] = { ...db.payments[existingIndex], ...payment };
      saveDBToDisk(db);
      return db.payments[existingIndex];
    }
    db.payments.unshift(payment);
    saveDBToDisk(db);
    return payment;
  },
  updatePayment: (razorpayPaymentId: string, updates: Partial<Payment>): Payment | null => {
    const db = initDB();
    const payment = db.payments.find((p) => p.razorpayPaymentId === razorpayPaymentId);
    if (!payment) return null;
    Object.assign(payment, updates);
    saveDBToDisk(db);
    return payment;
  },
  addInvoice: (invoice: Invoice): Invoice => {
    const db = initDB();
    const existingIndex = db.invoices.findIndex((i) => i.invoiceNumber === invoice.invoiceNumber);
    if (existingIndex >= 0) {
      db.invoices[existingIndex] = { ...db.invoices[existingIndex], ...invoice };
      saveDBToDisk(db);
      return db.invoices[existingIndex];
    }
    db.invoices.unshift(invoice);
    saveDBToDisk(db);
    return invoice;
  },

  // Webhook idempotency tracking
  isWebhookProcessed: (eventId: string): boolean => {
    const db = initDB();
    return db.processedWebhooks.includes(eventId);
  },
  markWebhookProcessed: (eventId: string): void => {
    const db = initDB();
    if (!db.processedWebhooks.includes(eventId)) {
      db.processedWebhooks.push(eventId);
      if (db.processedWebhooks.length > 500) {
        db.processedWebhooks.shift();
      }
      saveDBToDisk(db);
    }
  },

  // Organization operations
  deleteOrganization: (id: string) => {
    const db = initDB();
    const index = db.organizations.findIndex((o) => o.id === id);
    if (index === -1) return false;
    db.organizations.splice(index, 1);
    // Cascade delete tenant records
    db.users = db.users.filter((u) => u.organizationId !== id);
    db.properties = db.properties.filter((p) => p.organizationId !== id);
    db.leads = db.leads.filter((l) => l.organizationId !== id);
    db.clients = db.clients.filter((c) => c.organizationId !== id);
    db.deals = db.deals.filter((d) => d.organizationId !== id);
    db.appointments = db.appointments.filter((a) => a.organizationId !== id);
    db.storageAssets = db.storageAssets.filter((s) => s.organizationId !== id);
    db.notifications = db.notifications.filter((n) => n.organizationId !== id);
    db.documents = db.documents.filter((doc) => doc.organizationId !== id);
    db.subscriptions = db.subscriptions.filter((s) => s.organizationId !== id);
    db.payments = db.payments.filter((p) => p.organizationId !== id);
    db.invoices = db.invoices.filter((inv) => inv.organizationId !== id);
    saveDBToDisk(db);
    return true;
  },

  // User operations
  deleteUser: (id: string) => {
    const db = initDB();
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    db.users.splice(index, 1);
    saveDBToDisk(db);
    return true;
  },
};
