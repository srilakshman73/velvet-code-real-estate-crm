'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
  currentPlanLimits: PlanLimits;
  upgradePlan: (tier: SubscriptionTier, billingCycle?: 'monthly' | 'annual') => boolean;
  cancelSubscription: () => void;

  // Limits Checkers
  checkLimit: (resource: 'leads' | 'properties' | 'users' | 'ai' | 'whatsapp') => {
    allowed: boolean;
    reason?: string;
  };

  // Leads
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'score'>) => {
    success: boolean;
    error?: string;
  };
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  importLeads: (newLeads: Partial<Lead>[]) => number;

  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'totalDealsCount' | 'totalDealsValueINR'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;

  // Properties
  properties: Property[];
  addProperty: (prop: Omit<Property, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    success: boolean;
    error?: string;
  };
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;

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
  sendAIMessage: (text: string) => void;
  executeAIAction: (messageId: string) => void;
  clearAIChat: () => void;

  // Documents & Vault
  documents: DocumentRecord[];
  addDocument: (doc: Omit<DocumentRecord, 'id' | 'organizationId' | 'createdAt'>) => void;
  deleteDocument: (id: string) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

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
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [currentOrg, setCurrentOrg] = useState<Organization>(INITIAL_ORGANIZATIONS[0]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[1]); // Default to Velvet Code (Owner)

  // Subscription State
  const [subscription, setSubscription] = useState<Subscription>(INITIAL_SUBSCRIPTION);

  // Entities
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>(INITIAL_SITE_VISITS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>(INITIAL_FOLLOW_UPS);
  const [conversations, setConversations] = useState<WhatsAppConversation[]>(INITIAL_WHATSAPP_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-01');
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
        'Hello Velvet Code! I am **Realty AI**, your intelligent real estate assistant. I have secure real-time access to your leads, properties, site visits, and deals.\n\nAsk me to analyze your leads, draft personalized WhatsApp messages, or check property inventory!',
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
  };

  const hasAdminAccess = () => {
    return currentUser.role === 'OWNER';
  };

  // Current Plan Limits Helper
  const currentPlanLimits =
    SAAS_PLANS.find((p) => p.tier === subscription.tier) || SAAS_PLANS[1];

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
  const checkLimit = (resource: 'leads' | 'properties' | 'users' | 'ai' | 'whatsapp') => {
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
    return { allowed: true };
  };

  // ==========================================
  // LEADS ACTIONS
  // ==========================================
  const addLead = (leadData: Omit<Lead, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'score'>) => {
    const limitCheck = checkLimit('leads');
    if (!limitCheck.allowed) {
      return { success: false, error: limitCheck.reason };
    }

    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      organizationId: currentOrg.id,
      score: Math.floor(Math.random() * 30) + 65, // Initial AI score
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLeads((prev) => [newLead, ...prev]);
    setSubscription((prev) => ({
      ...prev,
      usage: { ...prev.usage, leadsCount: prev.usage.leadsCount + 1 },
    }));

    logActivity('CREATE_LEAD', 'Lead', newLead.id, newLead.name, `Added new lead via ${newLead.source}`);

    // Trigger WhatsApp welcome automation if active
    const welcomeAuto = automations.find((a) => a.triggerEvent === 'LEAD_CREATED' && a.isActive);
    if (welcomeAuto) {
      // Auto-create conversation
      const newConv: WhatsAppConversation = {
        id: `conv-${Date.now()}`,
        organizationId: currentOrg.id,
        customerName: newLead.name,
        customerPhone: newLead.phone,
        leadId: newLead.id,
        leadStatus: newLead.status,
        interestedProperty: newLead.interestedPropertyName,
        budget: newLead.budgetMaxINR ? `₹${(newLead.budgetMaxINR / 100000).toFixed(1)}L` : undefined,
        lastMessageText: `Hello ${newLead.name}, thank you for your interest. Our property consultant will contact you shortly.`,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        messages: [
          {
            id: `msg-${Date.now()}`,
            conversationId: `conv-${Date.now()}`,
            direction: 'OUTBOUND',
            status: 'SENT',
            body: `Hello ${newLead.name}, thank you for your interest in ${newLead.interestedPropertyName || 'our properties'}. Our consultant will contact you shortly.`,
            createdAt: new Date().toISOString(),
          },
        ],
      };
      setConversations((prev) => [newConv, ...prev]);
      setAutomations((prev) =>
        prev.map((a) => (a.id === welcomeAuto.id ? { ...a, executionCount: a.executionCount + 1 } : a))
      );
    }

    return { success: true };
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l))
    );
    const target = leads.find((l) => l.id === id);
    if (target) {
      logActivity('UPDATE_LEAD', 'Lead', id, target.name, `Updated lead properties`);
    }
  };

  const deleteLead = (id: string) => {
    const target = leads.find((l) => l.id === id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
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

    setLeads((prev) => [...imported, ...prev]);
    logActivity('IMPORT_LEADS', 'Lead', 'bulk', 'Multiple Leads', `Imported ${imported.length} leads via CSV/Excel`);
    return imported.length;
  };

  // ==========================================
  // CLIENTS ACTIONS
  // ==========================================
  const addClient = (clientData: Omit<Client, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'totalDealsCount' | 'totalDealsValueINR'>) => {
    const newClient: Client = {
      ...clientData,
      id: `client-${Date.now()}`,
      organizationId: currentOrg.id,
      totalDealsCount: 0,
      totalDealsValueINR: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setClients((prev) => [newClient, ...prev]);
    logActivity('CREATE_CLIENT', 'Lead', newClient.id, newClient.name, 'Added active converted client');
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
  };

  // ==========================================
  // PROPERTIES ACTIONS
  // ==========================================
  const addProperty = (propData: Omit<Property, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    const limitCheck = checkLimit('properties');
    if (!limitCheck.allowed) {
      return { success: false, error: limitCheck.reason };
    }

    const newProp: Property = {
      ...propData,
      id: `prop-${Date.now()}`,
      organizationId: currentOrg.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProperties((prev) => [newProp, ...prev]);
    setSubscription((prev) => ({
      ...prev,
      usage: { ...prev.usage, propertiesCount: prev.usage.propertiesCount + 1 },
    }));
    logActivity('CREATE_PROPERTY', 'Property', newProp.id, newProp.title, `Listed new property for ${newProp.city}`);
    return { success: true };
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
    const target = properties.find((p) => p.id === id);
    if (target) {
      logActivity('UPDATE_PROPERTY', 'Property', id, target.title, `Updated property specifications`);
    }
  };

  const deleteProperty = (id: string) => {
    const target = properties.find((p) => p.id === id);
    setProperties((prev) => prev.filter((p) => p.id !== id));
    if (target) {
      logActivity('DELETE_PROPERTY', 'Property', id, target.title, `Removed property from inventory`);
    }
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
    const target = deals.find((d) => d.id === id);
    if (target) {
      logActivity('UPDATE_DEAL_STAGE', 'Deal', id, target.title, `Moved deal stage to ${stage}`);
      if (stage === 'CLOSED_WON') {
        const notif: NotificationItem = {
          id: `notif-${Date.now()}`,
          organizationId: currentOrg.id,
          title: 'Deal Won Celebration! 🏆',
          message: `${target.title} closed successfully!`,
          type: 'LEAD',
          isRead: false,
          link: '/app/deals',
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [notif, ...prev]);
      }
    }
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
    logActivity('SCHEDULE_VISIT', 'SiteVisit', newVisit.id, newVisit.propertyName, `Scheduled visit for ${newVisit.leadName || 'Client'} on ${newVisit.visitDate}`);

    // Site visit automated WhatsApp
    const auto = automations.find((a) => a.triggerEvent === 'VISIT_SCHEDULED' && a.isActive);
    if (auto && newVisit.customerPhone) {
      setAutomations((prev) =>
        prev.map((a) => (a.id === auto.id ? { ...a, executionCount: a.executionCount + 1 } : a))
      );
    }
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
    logActivity('CHECKIN_VISIT', 'SiteVisit', id, 'Site Visit', 'Agent checked in at site venue');
  };

  const checkOutVisit = (id: string, rating: number, feedback: string) => {
    setSiteVisits((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              status: 'COMPLETED',
              checkOutAt: new Date().toISOString(),
              rating,
              feedback,
            }
          : v
      )
    );
    logActivity('COMPLETED_VISIT', 'SiteVisit', id, 'Site Visit', `Logged completion with ${rating}★ feedback`);
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
    logActivity('CREATE_TASK', 'Task', newTask.id, newTask.title, 'Assigned new task');
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

    const targetConv = conversations.find((c) => c.id === conversationId);
    if (targetConv) {
      logActivity(
        'SEND_WHATSAPP',
        'WhatsApp',
        conversationId,
        targetConv.customerName,
        `Sent WhatsApp message: "${body.substring(0, 40)}..."`
      );
    }
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
  const sendAIMessage = (text: string) => {
    const userMsg: AIConversationMessage = {
      id: `ai-user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    // Store user message immediately
    setAIMessages((prev) => [...prev, userMsg]);

    // Track AI Usage quota
    setSubscription((prev) => ({
      ...prev,
      usage: { ...prev.usage, aiRequestsUsed: prev.usage.aiRequestsUsed + 1 },
    }));

    // Process intelligence
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
            // Open real WhatsApp with pre-filled message URL
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
  const addDocument = (docData: Omit<DocumentRecord, 'id' | 'organizationId' | 'createdAt'>) => {
    const newDoc: DocumentRecord = {
      ...docData,
      id: `doc-${Date.now()}`,
      organizationId: currentOrg.id,
      createdAt: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    logActivity('UPLOAD_DOCUMENT', 'Property', newDoc.id, newDoc.title, `Uploaded document (${newDoc.category})`);
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // ==========================================
  // NOTIFICATIONS ACTIONS
  // ==========================================
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // ==========================================
  // BILLING & SUBSCRIPTIONS
  // ==========================================
  const upgradePlan = (tier: SubscriptionTier, billingCycle: 'monthly' | 'annual' = 'monthly') => {
    const targetPlan = SAAS_PLANS.find((p) => p.tier === tier);
    if (!targetPlan) return false;

    setSubscription((prev) => ({
      ...prev,
      tier,
      billingCycle,
      priceMonthlyINR: targetPlan.priceMonthlyINR,
      status: 'ACTIVE',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    const notif: NotificationItem = {
      id: `notif-upgrade-${Date.now()}`,
      organizationId: currentOrg.id,
      title: `Plan Upgraded to ${targetPlan.name}! 🚀`,
      message: `Your workspace has been upgraded to the ${targetPlan.name} tier with expanded limits.`,
      type: 'BILLING',
      isRead: false,
      link: '/app/billing',
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
    logActivity('UPGRADE_PLAN', 'Lead', currentOrg.id, targetPlan.name, `Upgraded workspace plan to ${targetPlan.name}`);
    return true;
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
        currentPlanLimits,
        upgradePlan,
        cancelSubscription,
        checkLimit,
        leads,
        addLead,
        updateLead,
        deleteLead,
        importLeads,
        clients,
        addClient,
        updateClient,
        properties,
        addProperty,
        updateProperty,
        deleteProperty,
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
