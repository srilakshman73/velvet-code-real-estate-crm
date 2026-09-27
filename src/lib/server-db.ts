import {
  INITIAL_ORGANIZATIONS,
  INITIAL_USERS,
  INITIAL_PROPERTIES,
  INITIAL_LEADS,
  INITIAL_DEALS,
  INITIAL_SUBSCRIPTION,
  INITIAL_PAYMENTS,
  INITIAL_INVOICES,
  SAAS_PLANS,
} from './mock-data';
import { Property, Lead, Deal, Organization, User, Subscription, Payment, Invoice, PlanLimits } from '@/types';

// Global server-side state cache across requests in Next.js runtime
declare global {
  var __velvetServerDB: {
    organizations: Organization[];
    users: User[];
    properties: Property[];
    leads: Lead[];
    deals: Deal[];
    subscriptions: Subscription[];
    payments: Payment[];
    invoices: Invoice[];
    processedWebhooks: string[];
  } | undefined;
}

function initDB() {
  if (!global.__velvetServerDB) {
    global.__velvetServerDB = {
      organizations: JSON.parse(JSON.stringify(INITIAL_ORGANIZATIONS)),
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      properties: JSON.parse(JSON.stringify(INITIAL_PROPERTIES)),
      leads: JSON.parse(JSON.stringify(INITIAL_LEADS)),
      deals: JSON.parse(JSON.stringify(INITIAL_DEALS)),
      subscriptions: [JSON.parse(JSON.stringify(INITIAL_SUBSCRIPTION))],
      payments: JSON.parse(JSON.stringify(INITIAL_PAYMENTS)),
      invoices: JSON.parse(JSON.stringify(INITIAL_INVOICES)),
      processedWebhooks: [],
    };
  }
  return global.__velvetServerDB;
}

export const serverDB = {
  getOrganizations: () => initDB().organizations,
  getUsers: () => initDB().users,
  getProperties: () => initDB().properties,
  getLeads: () => initDB().leads,
  getDeals: () => initDB().deals,
  getSubscriptions: () => initDB().subscriptions,
  getPayments: (orgId?: string) => {
    const db = initDB();
    if (orgId) {
      return db.payments.filter((p) => p.organizationId === orgId);
    }
    return db.payments;
  },
  getInvoices: (orgId?: string) => {
    const db = initDB();
    if (orgId) {
      return db.invoices.filter((inv) => inv.organizationId === orgId);
    }
    return db.invoices;
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
    db.deals = db.deals.filter((d) => d.organizationId !== id);
    db.subscriptions = db.subscriptions.filter((s) => s.organizationId !== id);
    db.payments = db.payments.filter((p) => p.organizationId !== id);
    db.invoices = db.invoices.filter((inv) => inv.organizationId !== id);
    return true;
  },

  // User operations
  deleteUser: (id: string) => {
    const db = initDB();
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    db.users.splice(index, 1);
    return true;
  },

  // Property operations
  addProperty: (property: Property) => {
    const db = initDB();
    db.properties.unshift(property);
    return property;
  },
  deleteProperty: (id: string) => {
    const db = initDB();
    const index = db.properties.findIndex((p) => p.id === id);
    if (index === -1) return false;
    db.properties.splice(index, 1);
    return true;
  },

  // Lead operations
  addLead: (lead: Lead) => {
    const db = initDB();
    db.leads.unshift(lead);
    return lead;
  },
  deleteLead: (id: string) => {
    const db = initDB();
    const index = db.leads.findIndex((l) => l.id === id);
    if (index === -1) return false;
    db.leads.splice(index, 1);
    return true;
  },

  // Subscription operations
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
      return db.subscriptions[index];
    } else {
      const newSub = { ...sub, createdAt: sub.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
      db.subscriptions.unshift(newSub);
      return newSub;
    }
  },

  // Payment operations
  addPayment: (payment: Payment): Payment => {
    const db = initDB();
    const existingIndex = db.payments.findIndex((p) => p.razorpayPaymentId === payment.razorpayPaymentId);
    if (existingIndex >= 0) {
      db.payments[existingIndex] = { ...db.payments[existingIndex], ...payment };
      return db.payments[existingIndex];
    }
    db.payments.unshift(payment);
    return payment;
  },
  updatePayment: (razorpayPaymentId: string, updates: Partial<Payment>): Payment | null => {
    const db = initDB();
    const payment = db.payments.find((p) => p.razorpayPaymentId === razorpayPaymentId);
    if (!payment) return null;
    Object.assign(payment, updates);
    return payment;
  },

  // Invoice operations
  addInvoice: (invoice: Invoice): Invoice => {
    const db = initDB();
    const existingIndex = db.invoices.findIndex((i) => i.invoiceNumber === invoice.invoiceNumber);
    if (existingIndex >= 0) {
      db.invoices[existingIndex] = { ...db.invoices[existingIndex], ...invoice };
      return db.invoices[existingIndex];
    }
    db.invoices.unshift(invoice);
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
    }
  },

  // Authoritative limits helper
  getOrgPlanLimits: (orgId: string): PlanLimits => {
    const sub = serverDB.getSubscription(orgId);
    const tier = sub?.tier || 'STARTER';
    return SAAS_PLANS.find((p) => p.tier === tier) || SAAS_PLANS[0];
  },
};
