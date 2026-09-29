'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Organization,
  User,
  Subscription,
  SubscriptionTier,
  PlanLimits,
  Lead,
  Client,
  Property,
  Deal,
  DealStage,
  SiteVisit,
  Task,
  FollowUpItem,
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppTemplate,
  AutomationRule,
  DocumentRecord,
  NotificationItem,
  ActivityLogItem,
  AIConversationMessage,
  Payment,
  Invoice,
  Appointment,
  StorageAsset,
  StorageEntityType,
  StorageUsage,
} from '@/types';
import {
  SAAS_PLANS,
  INITIAL_ORGANIZATIONS,
  INITIAL_USERS,
  INITIAL_SUBSCRIPTION,
  INITIAL_LEADS,
  INITIAL_PROPERTIES,
  INITIAL_CLIENTS,
  INITIAL_DEALS,
  INITIAL_SITE_VISITS,
  INITIAL_TASKS,
  INITIAL_FOLLOW_UPS,
  INITIAL_WHATSAPP_CONVERSATIONS,
  INITIAL_WHATSAPP_TEMPLATES,
  INITIAL_AUTOMATIONS,
  INITIAL_DOCUMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_PAYMENTS,
  INITIAL_INVOICES,
  INITIAL_APPOINTMENTS,
} from './mock-data';
import { processRealtyAIQuery } from './ai-service';
import { buildWhatsAppUrl } from './utils';

interface CRMStoreContextType {
  // Current Tenant & User
  organizations: Organization[];
  currentOrg: Organization;
  setCurrentOrg: (org: Organization) => void;
  users: User[];
  currentUser: User;
  setCurrentUser: (user: User) => void;

  // Owner Support Mode & Access Control
  isOwnerSupportMode: boolean;
  supportOrg: Organization | null;
  enterSupportMode: (org: Organization) => void;
  exitSupportMode: () => void;
  hasAdminAccess: () => boolean;

  // Subscription & Billing
  subscription: Subscription;
  setSubscription: React.Dispatch<React.SetStateAction<Subscription>>;
  currentPlanLimits: PlanLimits;
  upgradePlan: (tier: SubscriptionTier, billingCycle?: 'monthly' | 'annual') => Promise<boolean>;
  cancelSubscription: () => void;
  payments: Payment[];
  invoices: Invoice[];
  fetchBillingData: () => Promise<void>;

  // Storage Quota & File Asset Management
  storageUsage: StorageUsage | null;
  fetchStorageUsage: () => Promise<void>;
  uploadFileToStorage: (
    file: File,
    entityType: StorageEntityType,
    entityId?: string
  ) => Promise<{ success: boolean; asset?: StorageAsset; error?: string }>;
  deleteFileFromStorage: (assetId: string) => Promise<{ success: boolean; error?: string }>;

  // Limits Checkers
  checkLimit: (resource: 'leads' | 'properties' | 'users' | 'ai' | 'whatsapp' | 'storage', extraBytes?: number) => {
    allowed: boolean;
    reason?: string;
  };

  // Leads
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'score'>) => Promise<{
    success: boolean;
    data?: Lead;
    error?: string;
  }>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  importLeads: (newLeads: Partial<Lead>[]) => number;

  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'totalDealsCount' | 'totalDealsValueINR'>) => Promise<void>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  // Properties
  properties: Property[];
  addProperty: (prop: Omit<Property, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<{
    success: boolean;
    data?: Property;
    error?: string;
  }>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;

  // Appointments (CRM Calendar)
  appointments: Appointment[];
  addAppointment: (apt: Omit<Appointment, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<{
    success: boolean;
    data?: Appointment;
    error?: string;
  }>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;

  // Deals & Pipeline
  deals: Deal[];
  addDeal: (deal: Omit<Deal, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => void;
  updateDealStage: (id: string, stage: DealStage) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;

  // Site Visits
  siteVisits: SiteVisit[];
  scheduleSiteVisit: (visit: Omit<SiteVisit, 'id' | 'organizationId' | 'createdAt'>) => void;
  updateSiteVisit: (id: string, updates: Partial<SiteVisit>) => void;
  checkInVisit: (id: string) => void;
  checkOutVisit: (id: string, rating: number, feedback: string) => void;

  // Tasks & Follow-ups
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'organizationId' | 'createdAt'>) => void;
  updateTaskStatus: (id: string, status: Task['status']) => void;
  deleteTask: (id: string) => void;

  followUps: FollowUpItem[];
  completeFollowUp: (id: string) => void;
  snoozeFollowUp: (id: string, days?: number) => void;

  // WhatsApp CRM
  conversations: WhatsAppConversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  sendWhatsAppMessage: (conversationId: string, body: string, mediaUrl?: string) => void;
  templates: WhatsAppTemplate[];
  addTemplate: (template: Omit<WhatsAppTemplate, 'id' | 'organizationId'>) => void;
  automations: AutomationRule[];
  toggleAutomation: (id: string) => void;

  // Realty AI
  aiMessages: AIConversationMessage[];
  sendAIMessage: (text: string) => Promise<void>;
  executeAIAction: (messageId: string) => void;
  clearAIChat: () => void;

  // Documents & Vault
  documents: DocumentRecord[];
  addDocument: (doc: Omit<DocumentRecord, 'id' | 'organizationId' | 'createdAt'>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;

  // Activity Logs
  activityLogs: ActivityLogItem[];
  logActivity: (action: string, entityType: ActivityLogItem['entityType'], entityId: string, entityName: string, description: string) => void;

  // Global Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const CRMStoreContext = createContext<CRMStoreContextType | null>(null);

export function CRMStoreProvider({ children }: { children: React.ReactNode }) {
  // Organizations and Users
  const [organizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [currentOrg, setCurrentOrg] = useState<Organization>(INITIAL_ORGANIZATIONS[0]);
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);

  // Subscription & Billing State
  const [subscription, setSubscription] = useState<Subscription>(INITIAL_SUBSCRIPTION);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);

  // Entities
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>(INITIAL_SITE_VISITS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>(INITIAL_FOLLOW_UPS);
  const [conversations, setConversations] = useState<WhatsAppConversation[]>(INITIAL_WHATSAPP_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(INITIAL_WHATSAPP_TEMPLATES);
  const [automations, setAutomations] = useState<AutomationRule[]>(INITIAL_AUTOMATIONS);
  const [documents, setDocuments] = useState<DocumentRecord[]>(INITIAL_DOCUMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(INITIAL_ACTIVITY_LOGS);

  // Realty AI Messages
  const [aiMessages, setAIMessages] = useState<AIConversationMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        'Hello Sri Lakshman! I am **Realty AI**, your intelligent real estate assistant. I have secure real-time access to your leads, properties, site visits, and deals.\n\nAsk me to analyze your leads, draft personalized WhatsApp messages, or check property inventory!',
      timestamp: new Date().toISOString(),
    },
  ]);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Owner Support Mode & Access Control State
  const [isOwnerSupportMode, setIsOwnerSupportMode] = useState(false);
  const [supportOrg, setSupportOrg] = useState<Organization | null>(null);

  const enterSupportMode = (org: Organization) => {
    setIsOwnerSupportMode(true);
    setSupportOrg(org);
    setCurrentOrg(org);
  };

  const exitSupportMode = () => {
    setIsOwnerSupportMode(false);
    setSupportOrg(null);
    setCurrentOrg(organizations[0]);
  };

  const hasAdminAccess = () => {
    return currentUser.role === 'OWNER';
  };

  // Helper to persist state to browser localStorage for instant load on refresh
  const saveToLocalCache = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`velvet_${key}_${currentOrg.id}`, JSON.stringify(data));
      } catch (e) {
        // quota exceeded or disabled
      }
    }
  };

  // Fetch billing data
  const fetchBillingData = useCallback(async () => {
    try {
      const res = await fetch('/api/billing/subscription');
      if (res.ok) {
        const data = await res.json();
        if (data.subscription) {
          setSubscription(data.subscription);
        }
        if (Array.isArray(data.payments)) {
          setPayments(data.payments);
        }
        if (Array.isArray(data.invoices)) {
          setInvoices(data.invoices);
        }
        if (data.storageUsage) {
          setStorageUsage(data.storageUsage);
        }
      }
    } catch {
      // Offline fallback
    }
  }, []);

  // Fetch storage usage
  const fetchStorageUsage = useCallback(async () => {
    try {
      const res = await fetch('/api/storage/usage');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setStorageUsage(json.data);
        }
      }
    } catch {}
  }, []);

  // Hydrate from localStorage first, then fetch live data from server APIs
  useEffect(() => {
    const orgId = currentOrg.id;

    // 1. Instant local cache hydration
    if (typeof window !== 'undefined') {
      try {
        const cachedLeads = localStorage.getItem(`velvet_leads_${orgId}`);
        if (cachedLeads) setLeads(JSON.parse(cachedLeads));

        const cachedProps = localStorage.getItem(`velvet_properties_${orgId}`);
        if (cachedProps) setProperties(JSON.parse(cachedProps));

        const cachedClients = localStorage.getItem(`velvet_clients_${orgId}`);
        if (cachedClients) setClients(JSON.parse(cachedClients));

        const cachedApts = localStorage.getItem(`velvet_appointments_${orgId}`);
        if (cachedApts) setAppointments(JSON.parse(cachedApts));

        const cachedNotifs = localStorage.getItem(`velvet_notifications_${orgId}`);
        if (cachedNotifs) setNotifications(JSON.parse(cachedNotifs));

        const cachedDocs = localStorage.getItem(`velvet_documents_${orgId}`);
        if (cachedDocs) setDocuments(JSON.parse(cachedDocs));
      } catch (e) {}
    }

    // 2. Fetch live data from server APIs
    const syncServerData = async () => {
      try {
        const [leadsRes, propsRes, clientsRes, aptsRes, notifsRes, docsRes] = await Promise.all([
          fetch('/api/leads'),
          fetch('/api/properties'),
          fetch('/api/clients'),
          fetch('/api/appointments'),
          fetch('/api/notifications'),
          fetch('/api/documents'),
        ]);

        if (leadsRes.ok) {
          const json = await leadsRes.json();
          if (Array.isArray(json.data)) {
            setLeads(json.data);
            saveToLocalCache('leads', json.data);
          }
        }
        if (propsRes.ok) {
          const json = await propsRes.json();
          if (Array.isArray(json.data)) {
            setProperties(json.data);
            saveToLocalCache('properties', json.data);
          }
        }
        if (clientsRes.ok) {
          const json = await clientsRes.json();
          if (Array.isArray(json.data)) {
            setClients(json.data);
            saveToLocalCache('clients', json.data);
          }
        }
        if (aptsRes.ok) {
          const json = await aptsRes.json();
          if (Array.isArray(json.data)) {
            setAppointments(json.data);
            saveToLocalCache('appointments', json.data);
          }
        }
        if (notifsRes.ok) {
          const json = await notifsRes.json();
          if (Array.isArray(json.data)) {
            setNotifications(json.data);
            saveToLocalCache('notifications', json.data);
          }
        }
        if (docsRes.ok) {
          const json = await docsRes.json();
          if (Array.isArray(json.data)) {
            setDocuments(json.data);
            saveToLocalCache('documents', json.data);
          }
        }
      } catch (err) {
        // Network error / offline
      }
    };

    syncServerData();
    fetchBillingData();
    fetchStorageUsage();
  }, [currentOrg.id, fetchBillingData, fetchStorageUsage]);

  // Current Plan Limits Helper
  const currentPlanLimits =
    SAAS_PLANS.find((p) => p.tier === subscription.tier) || SAAS_PLANS[0];

  // Helper to log audit activity
  const logActivity = (
    action: string,
    entityType: ActivityLogItem['entityType'],
    entityId: string,
    entityName: string,
    description: string
  ) => {
    const newLog: ActivityLogItem = {
      id: `act-${Date.now()}`,
      organizationId: currentOrg.id,
      userName: currentUser.name,
      action,
      entityType,
      entityId,
      entityName,
      description,
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Limit Enforcement
  const checkLimit = (
    resource: 'leads' | 'properties' | 'users' | 'ai' | 'whatsapp' | 'storage',
    extraBytes: number = 0
  ) => {
    if (resource === 'leads') {
      if (currentPlanLimits.maxLeads !== -1 && leads.length >= currentPlanLimits.maxLeads) {
        return {
          allowed: false,
          reason: `Your ${currentPlanLimits.name} plan allows up to ${currentPlanLimits.maxLeads} leads. Upgrade your subscription to add more.`,
        };
      }
    }
    if (resource === 'properties') {
      if (currentPlanLimits.maxProperties !== -1 && properties.length >= currentPlanLimits.maxProperties) {
        return {
          allowed: false,
          reason: `Your ${currentPlanLimits.name} plan allows up to ${currentPlanLimits.maxProperties} properties. Upgrade to Professional or Business for unlimited inventory.`,
        };
      }
    }
    if (resource === 'users') {
      if (users.length >= currentPlanLimits.maxUsers) {
        return {
          allowed: false,
          reason: `Your ${currentPlanLimits.name} plan supports ${currentPlanLimits.maxUsers} user seat(s). Upgrade to add team members.`,
        };
      }
    }
    if (resource === 'ai') {
      if (subscription.usage.aiRequestsUsed >= currentPlanLimits.monthlyAIQuota) {
        return {
          allowed: false,
          reason: `Monthly AI query quota (${currentPlanLimits.monthlyAIQuota}) reached for this billing cycle. Upgrade for higher limits.`,
        };
      }
    }
    if (resource === 'whatsapp') {
      if (!currentPlanLimits.hasWhatsAppCRM) {
        return {
          allowed: false,
          reason: `WhatsApp CRM & Inbox requires the Professional or Business plan.`,
        };
      }
    }
    if (resource === 'storage') {
      const currentUsed = storageUsage?.usedBytes || 0;
      const limit = currentPlanLimits.storageLimitBytes || 1073741824;
      if (limit !== -1 && currentUsed + extraBytes > limit) {
        return {
          allowed: false,
          reason: `Storage limit reached for your ${currentPlanLimits.name} plan. Please delete files or upgrade your plan.`,
        };
      }
    }
    return { allowed: true };
  };

  // ==========================================
  // CLOUD STORAGE ACTIONS
  // ==========================================
  const uploadFileToStorage = async (
    file: File,
    entityType: StorageEntityType,
    entityId?: string
  ): Promise<{ success: boolean; asset?: StorageAsset; error?: string }> => {
    // Client-side quick check
    const quotaCheck = checkLimit('storage', file.size);
    if (!quotaCheck.allowed) {
      return { success: false, error: quotaCheck.reason };
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', entityType);
      if (entityId) formData.append('entityId', entityId);

      const res = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Upload failed' };
      }

      await fetchStorageUsage();
      return { success: true, asset: data.asset };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network upload error' };
    }
  };

  const deleteFileFromStorage = async (assetId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/storage/${assetId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to delete file' };
      }
      await fetchStorageUsage();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // ==========================================
  // LEADS ACTIONS
  // ==========================================
  const addLead = async (leadData: Omit<Lead, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'score'>) => {
    const limitCheck = checkLimit('leads');
    if (!limitCheck.allowed) {
      return { success: false, error: limitCheck.reason };
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });

      const json = await res.json();

      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to save lead' };
      }

      const newLead: Lead = json.data;
      setLeads((prev) => {
        const next = [newLead, ...prev];
        saveToLocalCache('leads', next);
        return next;
      });

      setSubscription((prev) => ({
        ...prev,
        usage: { ...prev.usage, leadsCount: prev.usage.leadsCount + 1 },
      }));

      logActivity('CREATE_LEAD', 'Lead', newLead.id, newLead.name, `Added new lead via ${newLead.source}`);

      return { success: true, data: newLead };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    setLeads((prev) => {
      const next = prev.map((l) => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l));
      saveToLocalCache('leads', next);
      return next;
    });

    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {}

    const target = leads.find((l) => l.id === id);
    if (target) {
      logActivity('UPDATE_LEAD', 'Lead', id, target.name, `Updated lead properties`);
    }
  };

  const deleteLead = async (id: string) => {
    const target = leads.find((l) => l.id === id);
    setLeads((prev) => {
      const next = prev.filter((l) => l.id !== id);
      saveToLocalCache('leads', next);
      return next;
    });

    try {
      await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    } catch {}

    if (target) {
      logActivity('DELETE_LEAD', 'Lead', id, target.name, `Deleted lead record`);
    }
  };

  const importLeads = (newLeadsData: Partial<Lead>[]) => {
    const imported: Lead[] = newLeadsData.map((d, i) => ({
      id: `lead-imp-${Date.now()}-${i}`,
      organizationId: currentOrg.id,
      name: d.name || 'Imported Lead',
      phone: d.phone || '+91 90000 00000',
      email: d.email,
      source: d.source || 'OTHER',
      status: d.status || 'NEW',
      priority: d.priority || 'MEDIUM',
      budgetMinINR: d.budgetMinINR,
      budgetMaxINR: d.budgetMaxINR,
      preferredLocation: d.preferredLocation,
      preferredType: d.preferredType || 'APARTMENT',
      assignedToId: currentUser.id,
      assignedToName: currentUser.name,
      score: 65,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    setLeads((prev) => {
      const next = [...imported, ...prev];
      saveToLocalCache('leads', next);
      return next;
    });
    logActivity('IMPORT_LEADS', 'Lead', 'bulk', 'Multiple Leads', `Imported ${imported.length} leads via CSV/Excel`);
    return imported.length;
  };

  // ==========================================
  // CLIENTS ACTIONS
  // ==========================================
  const addClient = async (
    clientData: Omit<Client, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'totalDealsCount' | 'totalDealsValueINR'>
  ) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });

      if (res.ok) {
        const json = await res.json();
        setClients((prev) => {
          const next = [json.data, ...prev];
          saveToLocalCache('clients', next);
          return next;
        });
        logActivity('CREATE_CLIENT', 'Lead', json.data.id, json.data.name, 'Added active converted client');
      }
    } catch {}
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    setClients((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
      saveToLocalCache('clients', next);
      return next;
    });

    try {
      await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {}
  };

  const deleteClient = async (id: string) => {
    setClients((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveToLocalCache('clients', next);
      return next;
    });

    try {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    } catch {}
  };

  // ==========================================
  // PROPERTIES ACTIONS
  // ==========================================
  const addProperty = async (propData: Omit<Property, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    const limitCheck = checkLimit('properties');
    if (!limitCheck.allowed) {
      return { success: false, error: limitCheck.reason };
    }

    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propData),
      });

      const json = await res.json();

      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to save property' };
      }

      const newProp: Property = json.data;
      setProperties((prev) => {
        const next = [newProp, ...prev];
        saveToLocalCache('properties', next);
        return next;
      });

      setSubscription((prev) => ({
        ...prev,
        usage: { ...prev.usage, propertiesCount: prev.usage.propertiesCount + 1 },
      }));

      logActivity('CREATE_PROPERTY', 'Property', newProp.id, newProp.title, `Listed new property for ${newProp.city}`);
      return { success: true, data: newProp };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    setProperties((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
      saveToLocalCache('properties', next);
      return next;
    });

    try {
      await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {}

    const target = properties.find((p) => p.id === id);
    if (target) {
      logActivity('UPDATE_PROPERTY', 'Property', id, target.title, `Updated property specifications`);
    }
  };

  const deleteProperty = async (id: string) => {
    const target = properties.find((p) => p.id === id);
    setProperties((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveToLocalCache('properties', next);
      return next;
    });

    try {
      await fetch(`/api/properties/${id}`, { method: 'DELETE' });
    } catch {}

    if (target) {
      logActivity('DELETE_PROPERTY', 'Property', id, target.title, `Removed property from inventory`);
    }
  };

  // ==========================================
  // APPOINTMENTS ACTIONS (CRM CALENDAR)
  // ==========================================
  const addAppointment = async (
    aptData: Omit<Appointment, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; data?: Appointment; error?: string }> => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aptData),
      });

      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to create appointment' };
      }

      const newApt: Appointment = json.data;
      setAppointments((prev) => {
        const next = [newApt, ...prev];
        saveToLocalCache('appointments', next);
        return next;
      });

      // Refetch notifications because appointment generates reminder notification
      try {
        const notifRes = await fetch('/api/notifications');
        if (notifRes.ok) {
          const notifJson = await notifRes.json();
          if (Array.isArray(notifJson.data)) {
            setNotifications(notifJson.data);
            saveToLocalCache('notifications', notifJson.data);
          }
        }
      } catch {}

      logActivity(
        'SCHEDULE_APPOINTMENT',
        'SiteVisit',
        newApt.id,
        newApt.title,
        `Scheduled appointment on ${new Date(newApt.startAt).toLocaleDateString()}`
      );

      return { success: true, data: newApt };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    setAppointments((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a));
      saveToLocalCache('appointments', next);
      return next;
    });

    try {
      await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {}
  };

  const deleteAppointment = async (id: string) => {
    setAppointments((prev) => {
      const next = prev.filter((a) => a.id !== id);
      saveToLocalCache('appointments', next);
      return next;
    });

    try {
      await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    } catch {}
  };

  // ==========================================
  // DEALS & SALES PIPELINE ACTIONS
  // ==========================================
  const addDeal = (dealData: Omit<Deal, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    const newDeal: Deal = {
      ...dealData,
      id: `deal-${Date.now()}`,
      organizationId: currentOrg.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDeals((prev) => [newDeal, ...prev]);
    logActivity('CREATE_DEAL', 'Deal', newDeal.id, newDeal.title, `Added deal to ${newDeal.stage} pipeline`);
  };

  const updateDealStage = (id: string, stage: DealStage) => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          let prob = d.probability;
          if (stage === 'NEW_LEAD') prob = 20;
          if (stage === 'QUALIFIED') prob = 40;
          if (stage === 'SITE_VISIT') prob = 60;
          if (stage === 'NEGOTIATION') prob = 80;
          if (stage === 'DOCUMENTATION') prob = 90;
          if (stage === 'CLOSED_WON') prob = 100;
          if (stage === 'CLOSED_LOST') prob = 0;
          return { ...d, stage, probability: prob, updatedAt: new Date().toISOString() };
        }
        return d;
      })
    );
  };

  const updateDeal = (id: string, updates: Partial<Deal>) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d))
    );
  };

  const deleteDeal = (id: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== id));
  };

  // ==========================================
  // SITE VISITS ACTIONS
  // ==========================================
  const scheduleSiteVisit = (visitData: Omit<SiteVisit, 'id' | 'organizationId' | 'createdAt'>) => {
    const newVisit: SiteVisit = {
      ...visitData,
      id: `visit-${Date.now()}`,
      organizationId: currentOrg.id,
      createdAt: new Date().toISOString(),
    };
    setSiteVisits((prev) => [newVisit, ...prev]);
    logActivity('SCHEDULE_VISIT', 'SiteVisit', newVisit.id, newVisit.propertyName, `Scheduled visit for ${newVisit.leadName || 'Client'}`);
  };

  const updateSiteVisit = (id: string, updates: Partial<SiteVisit>) => {
    setSiteVisits((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v))
    );
  };

  const checkInVisit = (id: string) => {
    setSiteVisits((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: 'CONFIRMED', checkInAt: new Date().toISOString() } : v
      )
    );
  };

  const checkOutVisit = (id: string, rating: number, feedback: string) => {
    setSiteVisits((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, status: 'COMPLETED', checkOutAt: new Date().toISOString(), rating, feedback }
          : v
      )
    );
  };

  // ==========================================
  // TASKS & FOLLOW-UPS ACTIONS
  // ==========================================
  const addTask = (taskData: Omit<Task, 'id' | 'organizationId' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      organizationId: currentOrg.id,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTaskStatus = (id: string, status: Task['status']) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const completeFollowUp = (id: string) => {
    setFollowUps((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'COMPLETED' } : f))
    );
  };

  const snoozeFollowUp = (id: string, days: number = 1) => {
    setFollowUps((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const newDate = new Date();
          newDate.setDate(newDate.getDate() + days);
          return {
            ...f,
            scheduledAt: newDate.toISOString(),
            status: days === 0 ? 'DUE_TODAY' : 'UPCOMING',
          };
        }
        return f;
      })
    );
  };

  // ==========================================
  // WHATSAPP CRM ACTIONS
  // ==========================================
  const sendWhatsAppMessage = (conversationId: string, body: string, mediaUrl?: string) => {
    const newMsg: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      direction: 'OUTBOUND',
      status: 'SENT',
      body,
      mediaUrl,
      createdAt: new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessageText: body,
            lastMessageAt: new Date().toISOString(),
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );
  };

  const addTemplate = (templateData: Omit<WhatsAppTemplate, 'id' | 'organizationId'>) => {
    const newTemplate: WhatsAppTemplate = {
      ...templateData,
      id: `tpl-${Date.now()}`,
      organizationId: currentOrg.id,
    };
    setTemplates((prev) => [...prev, newTemplate]);
  };

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  // ==========================================
  // REALTY AI ASSISTANT ACTIONS
  // ==========================================
  const sendAIMessage = async (text: string) => {
    const userMsg: AIConversationMessage = {
      id: `ai-user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setAIMessages((prev) => [...prev, userMsg]);

    // Enforce server-side AI query quota
    try {
      const quotaRes = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens: 50 }),
      });

      if (!quotaRes.ok) {
        const errJson = await quotaRes.json();
        const errorMsg: AIConversationMessage = {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **AI Query Quota Reached**: ${errJson.error || 'Please upgrade your plan to continue using Realty AI.'}`,
          timestamp: new Date().toISOString(),
        };
        setAIMessages((prev) => [...prev, errorMsg]);
        return;
      }

      const quotaData = await quotaRes.json();
      setSubscription((prev) => ({
        ...prev,
        usage: { ...prev.usage, aiRequestsUsed: quotaData.used },
      }));
    } catch {}

    setTimeout(() => {
      const response = processRealtyAIQuery(text, {
        leads,
        properties,
        deals,
        siteVisits,
        followUps,
        organizationName: currentOrg.name,
        userName: currentUser.name,
      });

      const assistantMsg: AIConversationMessage = {
        id: `ai-ast-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        actionDraft: response.actionDraft,
      };

      setAIMessages((prev) => [...prev, assistantMsg]);
    }, 400);
  };

  const executeAIAction = (messageId: string) => {
    setAIMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId && m.actionDraft) {
          if (m.actionDraft.type === 'WHATSAPP_MESSAGE' && m.actionDraft.recipientPhone) {
            const url = buildWhatsAppUrl(m.actionDraft.recipientPhone, m.actionDraft.messageText);
            if (typeof window !== 'undefined') {
              window.open(url, '_blank');
            }
          }
          return {
            ...m,
            actionDraft: { ...m.actionDraft, isExecuted: true },
          };
        }
        return m;
      })
    );
  };

  const clearAIChat = () => {
    setAIMessages([
      {
        id: 'msg-welcome-new',
        role: 'assistant',
        content:
          'Chat reset! Ask me anything about your current leads, properties, site visits, or follow-ups.',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  // ==========================================
  // DOCUMENTS VAULT ACTIONS
  // ==========================================
  const addDocument = async (docData: Omit<DocumentRecord, 'id' | 'organizationId' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docData),
      });

      if (res.ok) {
        const json = await res.json();
        setDocuments((prev) => {
          const next = [json.data, ...prev];
          saveToLocalCache('documents', next);
          return next;
        });
        logActivity('UPLOAD_DOCUMENT', 'Property', json.data.id, json.data.title, `Uploaded document (${json.data.category})`);
      }
    } catch {}
  };

  const deleteDocument = async (id: string) => {
    setDocuments((prev) => {
      const next = prev.filter((d) => d.id !== id);
      saveToLocalCache('documents', next);
      return next;
    });

    try {
      await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    } catch {}
  };

  // ==========================================
  // NOTIFICATIONS ACTIONS
  // ==========================================
  const markNotificationRead = async (id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      saveToLocalCache('notifications', next);
      return next;
    });

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch {}
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, isRead: true }));
      saveToLocalCache('notifications', next);
      return next;
    });

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
    } catch {}
  };

  const dismissNotification = async (id: string) => {
    setNotifications((prev) => {
      const next = prev.filter((n) => n.id !== id);
      saveToLocalCache('notifications', next);
      return next;
    });

    try {
      await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
    } catch {}
  };

  // ==========================================
  // BILLING & SUBSCRIPTIONS
  // ==========================================
  const upgradePlan = async (tier: SubscriptionTier, billingCycle: 'monthly' | 'annual' = 'monthly') => {
    try {
      const res = await fetch('/api/billing/subscription', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, billingCycle }),
      });

      const json = await res.json();
      if (!res.ok) return false;

      setSubscription(json.data);
      await fetchStorageUsage();

      const targetPlan = SAAS_PLANS.find((p) => p.tier === tier) || SAAS_PLANS[0];

      const notif: NotificationItem = {
        id: `notif-upgrade-${Date.now()}`,
        organizationId: currentOrg.id,
        title: `Plan Upgraded to ${targetPlan.name}! 🚀`,
        message: `Your workspace has been upgraded to ${targetPlan.name} with storage limit of ${(targetPlan.storageLimitBytes / (1024 * 1024 * 1024)).toFixed(0)} GB.`,
        type: 'BILLING',
        isRead: false,
        link: '/app/billing',
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);

      return true;
    } catch {
      return false;
    }
  };

  const cancelSubscription = () => {
    setSubscription((prev) => ({
      ...prev,
      cancelAtPeriodEnd: true,
    }));
  };

  return (
    <CRMStoreContext.Provider
      value={{
        organizations,
        currentOrg,
        setCurrentOrg,
        users,
        currentUser,
        setCurrentUser,
        isOwnerSupportMode,
        supportOrg,
        enterSupportMode,
        exitSupportMode,
        hasAdminAccess,
        subscription,
        setSubscription,
        currentPlanLimits,
        upgradePlan,
        cancelSubscription,
        payments,
        invoices,
        fetchBillingData,
        storageUsage,
        fetchStorageUsage,
        uploadFileToStorage,
        deleteFileFromStorage,
        checkLimit,
        leads,
        addLead,
        updateLead,
        deleteLead,
        importLeads,
        clients,
        addClient,
        updateClient,
        deleteClient,
        properties,
        addProperty,
        updateProperty,
        deleteProperty,
        appointments,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        deals,
        addDeal,
        updateDealStage,
        updateDeal,
        deleteDeal,
        siteVisits,
        scheduleSiteVisit,
        updateSiteVisit,
        checkInVisit,
        checkOutVisit,
        tasks,
        addTask,
        updateTaskStatus,
        deleteTask,
        followUps,
        completeFollowUp,
        snoozeFollowUp,
        conversations,
        activeConversationId,
        setActiveConversationId,
        sendWhatsAppMessage,
        templates,
        addTemplate,
        automations,
        toggleAutomation,
        aiMessages,
        sendAIMessage,
        executeAIAction,
        clearAIChat,
        documents,
        addDocument,
        deleteDocument,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        dismissNotification,
        activityLogs,
        logActivity,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </CRMStoreContext.Provider>
  );
}

export function useCRMStore() {
  const context = useContext(CRMStoreContext);
  if (!context) {
    throw new Error('useCRMStore must be used within a CRMStoreProvider');
  }
  return context;
}

export const useCRM = useCRMStore;
