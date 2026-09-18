import {
  Organization,
  User,
  Subscription,
  PlanLimits,
  Lead,
  Client,
  Property,
  Deal,
  SiteVisit,
  Task,
  FollowUpItem,
  WhatsAppConversation,
  WhatsAppTemplate,
  AutomationRule,
  DocumentRecord,
  NotificationItem,
  ActivityLogItem,
  SaaSAdminOverview,
  Invoice,
} from '@/types';

// ==========================================
// SAAS SUBSCRIPTION TIERS & LIMITS
// ==========================================

export const SAAS_PLANS: PlanLimits[] = [
  {
    tier: 'STARTER',
    name: 'Starter',
    priceMonthlyINR: 499,
    priceAnnualINR: 4790,
    maxUsers: 1,
    maxLeads: 100,
    maxProperties: 25,
    monthlyAIQuota: 100,
    hasWhatsAppCRM: false,
    hasAutomation: false,
    hasAdvancedReports: false,
    hasTeamManagement: false,
    hasPrioritySupport: false,
    features: [
      '1 User Seat',
      'Up to 100 Active Leads',
      'Up to 25 Listed Properties',
      'Basic CRM & Contact Management',
      'Standard Activity Reports',
      'Realty AI (100 Queries/mo)',
      'Email Support',
    ],
  },
  {
    tier: 'PROFESSIONAL',
    name: 'Professional',
    priceMonthlyINR: 1499,
    priceAnnualINR: 14390,
    maxUsers: 5,
    maxLeads: 1000,
    maxProperties: -1, // Unlimited
    monthlyAIQuota: 1000,
    hasWhatsAppCRM: true,
    hasAutomation: true,
    hasAdvancedReports: true,
    hasTeamManagement: true,
    hasPrioritySupport: false,
    features: [
      '5 User Seats',
      'Up to 1,000 Active Leads',
      'Unlimited Properties Inventory',
      'Interactive Deal Pipeline & Kanban',
      'Site Visit GPS Check-ins & Tracker',
      'Integrated WhatsApp CRM & Inbox',
      'Realty AI (1,000 Queries/mo)',
      'Advanced Sales & Revenue Reports',
      'Automated Lead Distribution',
      'WhatsApp Quick Templates',
    ],
  },
  {
    tier: 'BUSINESS',
    name: 'Business',
    priceMonthlyINR: 3999,
    priceAnnualINR: 38390,
    maxUsers: 15,
    maxLeads: -1, // Unlimited
    maxProperties: -1, // Unlimited
    monthlyAIQuota: 5000,
    hasWhatsAppCRM: true,
    hasAutomation: true,
    hasAdvancedReports: true,
    hasTeamManagement: true,
    hasPrioritySupport: true,
    features: [
      '15 User Seats (Expandable)',
      'Unlimited Leads & Contacts',
      'Unlimited Properties Inventory',
      'Multi-Stage Deal Pipeline Automation',
      'Full WhatsApp Business Automation Engine',
      'Advanced Realty AI Analytics & Drafting',
      'Custom Role-Based Access Control',
      'Exportable Executive PDF / CSV Reports',
      'Dedicated Account Manager',
      'Priority 24/7 SLA Support',
    ],
  },
];

// ==========================================
// ORGANIZATIONS & TENANTS
// ==========================================

export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-apex-01',
    name: 'Velvet Code Realty',
    slug: 'velvet-code-realty',
    logoUrl: '/brand/velvet-code-logo.jpeg',
    phone: '+91 63833 95915',
    email: 'srilakshman73@gmail.com',
    address: 'Capital Park Towers, Anna Salai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    businessType: 'AGENCY',
    website: 'https://velvet-code-real-estate-crm.vercel.app',
    createdAt: '2026-01-10T10:00:00Z',
  },
];

// ==========================================
// MASTER OWNER USER (ONLY Sri Lakshman)
// ==========================================

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-01',
    name: 'Sri Lakshman',
    email: 'srilakshman73@gmail.com',
    phone: '+91 63833 95915',
    role: 'OWNER',
    organizationId: 'org-apex-01',
    isSuperAdmin: true,
  },
];

// ==========================================
// INITIAL SUBSCRIPTION
// ==========================================

export const INITIAL_SUBSCRIPTION: Subscription = {
  id: 'sub-apex-01',
  organizationId: 'org-apex-01',
  tier: 'PROFESSIONAL',
  status: 'ACTIVE',
  priceMonthlyINR: 1499,
  billingCycle: 'monthly',
  currentPeriodStart: '2026-09-01T00:00:00Z',
  currentPeriodEnd: '2026-10-01T00:00:00Z',
  cancelAtPeriodEnd: false,
  razorpaySubscriptionId: 'sub_rzp_apex_998127',
  usage: {
    usersCount: 1,
    leadsCount: 0,
    propertiesCount: 0,
    aiRequestsUsed: 0,
  },
};

// ==========================================
// ENTITY DATASETS (Cleaned — 0 Demo Data)
// ==========================================

export const INITIAL_PROPERTIES: Property[] = [];
export const INITIAL_LEADS: Lead[] = [];
export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_DEALS: Deal[] = [];
export const INITIAL_SITE_VISITS: SiteVisit[] = [];
export const INITIAL_TASKS: Task[] = [];
export const INITIAL_FOLLOW_UPS: FollowUpItem[] = [];
export const INITIAL_WHATSAPP_CONVERSATIONS: WhatsAppConversation[] = [];

// ==========================================
// WHATSAPP TEMPLATES & AUTOMATIONS
// ==========================================

export const INITIAL_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tpl-01',
    organizationId: 'org-apex-01',
    name: 'New Lead Welcome',
    category: 'WELCOME',
    body: 'Hello {{customer_name}}, thank you for your interest in {{property_name}}. Our team will connect with you shortly with full details.',
    variables: ['customer_name', 'property_name', 'agent_name'],
  },
  {
    id: 'tpl-02',
    organizationId: 'org-apex-01',
    name: 'Site Visit Confirmation',
    category: 'SITE_VISIT',
    body: 'Hello {{customer_name}}, your exclusive site visit for {{property_name}} is confirmed for {{site_visit_date}} at {{site_visit_time}}. We look forward to welcoming you.',
    variables: ['customer_name', 'property_name', 'site_visit_date', 'site_visit_time', 'agent_name'],
  },
  {
    id: 'tpl-03',
    organizationId: 'org-apex-01',
    name: 'Follow-up & Discussion',
    category: 'FOLLOW_UP',
    body: 'Hello {{customer_name}}, just following up regarding your inquiry for {{property_name}} ({{property_price}}). Would you like to schedule a site visit or have a short phone discussion this week?',
    variables: ['customer_name', 'property_name', 'property_price'],
  },
  {
    id: 'tpl-04',
    organizationId: 'org-apex-01',
    name: 'Deal Celebration & Congratulations',
    category: 'CELEBRATION',
    body: 'Congratulations {{customer_name}}! We are thrilled to celebrate your property booking of {{property_name}}. Thank you for choosing Velvet Code as your trusted real estate partner.',
    variables: ['customer_name', 'property_name'],
  },
  {
    id: 'tpl-05',
    organizationId: 'org-apex-01',
    name: 'Exclusive Price Drop Alert',
    category: 'PRICE_DROP',
    body: 'Hello {{customer_name}}, exclusive update! A premier unit in {{property_name}} is now available at {{property_price}}. Let us know if you would like to book an immediate viewing.',
    variables: ['customer_name', 'property_name', 'property_price'],
  },
];

export const INITIAL_AUTOMATIONS: AutomationRule[] = [
  {
    id: 'auto-01',
    organizationId: 'org-apex-01',
    name: 'Instant Welcome WhatsApp on New Lead',
    triggerEvent: 'LEAD_CREATED',
    actionType: 'SEND_WHATSAPP',
    templateId: 'tpl-01',
    templateName: 'New Lead Welcome',
    isActive: true,
    executionCount: 0,
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'auto-02',
    organizationId: 'org-apex-01',
    name: 'Send Instant Confirmation on Site Visit Scheduled',
    triggerEvent: 'VISIT_SCHEDULED',
    actionType: 'SEND_WHATSAPP',
    templateId: 'tpl-02',
    templateName: 'Site Visit Confirmation',
    isActive: true,
    executionCount: 0,
    createdAt: '2026-08-05T11:00:00Z',
  },
  {
    id: 'auto-03',
    organizationId: 'org-apex-01',
    name: 'Send Reminder 1 Day Before Site Visit',
    triggerEvent: 'VISIT_REMINDER_TOMORROW',
    actionType: 'SEND_WHATSAPP',
    templateId: 'tpl-02',
    templateName: 'Site Visit Confirmation',
    isActive: true,
    executionCount: 0,
    createdAt: '2026-08-10T14:00:00Z',
  },
  {
    id: 'auto-04',
    organizationId: 'org-apex-01',
    name: 'Auto-create Follow-up Task for Inactive Leads (3 Days)',
    triggerEvent: 'INACTIVE_3_DAYS',
    actionType: 'CREATE_TASK',
    isActive: true,
    executionCount: 0,
    createdAt: '2026-08-15T09:00:00Z',
  },
  {
    id: 'auto-05',
    organizationId: 'org-apex-01',
    name: 'Send Thank You & Celebration on Deal Won',
    triggerEvent: 'DEAL_WON',
    actionType: 'SEND_WHATSAPP',
    templateId: 'tpl-04',
    templateName: 'Deal Celebration & Congratulations',
    isActive: true,
    executionCount: 0,
    createdAt: '2026-08-20T16:00:00Z',
  },
];

// ==========================================
// VAULT, NOTIFICATIONS & LOGS
// ==========================================

export const INITIAL_DOCUMENTS: DocumentRecord[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_ACTIVITY_LOGS: ActivityLogItem[] = [];
export const INITIAL_INVOICES: Invoice[] = [];

// ==========================================
// SAAS ADMIN MASTER OVERVIEW METRICS
// ==========================================

export const SAAS_ADMIN_STATS: SaaSAdminOverview = {
  totalOrganizations: 1,
  activeSubscriptions: 1,
  monthlyRecurringRevenueINR: 0,
  newCustomersThisMonth: 1,
  churnRatePercent: 0,
  totalActiveUsers: 1,
  totalLeadsManaged: 0,
  totalPropertiesListed: 0,
  aiRequestsProcessed: 0,
  whatsappMessagesSent: 0,
};
