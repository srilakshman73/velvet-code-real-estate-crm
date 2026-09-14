// ============================================================
// VELVET CODE - REAL ESTATE CRM SAAS TYPE DEFINITIONS
// ============================================================

export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'AGENT';

export type BusinessType =
  | 'AGENT'
  | 'BROKER'
  | 'AGENCY'
  | 'BUILDER'
  | 'PROPERTY_CONSULTANT'
  | 'OTHER';

export type SubscriptionTier = 'STARTER' | 'PROFESSIONAL' | 'BUSINESS';
export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: Role;
  organizationId: string;
  isSuperAdmin?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  businessType: BusinessType;
  website?: string;
  createdAt: string;
}

export interface PlanLimits {
  tier: SubscriptionTier;
  name: string;
  priceMonthlyINR: number;
  priceAnnualINR: number;
  maxUsers: number;
  maxLeads: number; // -1 for unlimited
  maxProperties: number; // -1 for unlimited
  monthlyAIQuota: number; // number of requests
  hasWhatsAppCRM: boolean;
  hasAutomation: boolean;
  hasAdvancedReports: boolean;
  hasTeamManagement: boolean;
  hasPrioritySupport: boolean;
  features: string[];
}

export interface Subscription {
  id: string;
  organizationId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  priceMonthlyINR: number;
  billingCycle: 'monthly' | 'annual';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  razorpaySubscriptionId?: string;
  usage: {
    usersCount: number;
    leadsCount: number;
    propertiesCount: number;
    aiRequestsUsed: number;
  };
}

export interface Invoice {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  amountINR: number;
  taxINR: number;
  totalINR: number;
  status: 'paid' | 'pending' | 'failed';
  pdfUrl?: string;
  paymentMethod: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  createdAt: string;
}

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'SITE_VISIT'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type LeadSource =
  | 'WEBSITE'
  | 'WHATSAPP'
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'REFERRAL'
  | 'PHONE'
  | 'WALK_IN'
  | 'OTHER';

export type PropertyType =
  | 'APARTMENT'
  | 'VILLA'
  | 'PLOT'
  | 'COMMERCIAL'
  | 'PENTHOUSE'
  | 'DUPLEX';

export type PropertyStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'SOLD'
  | 'RENTED'
  | 'INACTIVE';

export interface Lead {
  id: string;
  organizationId: string;
  name: string;
  phone: string;
  email?: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  budgetMinINR?: number;
  budgetMaxINR?: number;
  preferredLocation?: string;
  preferredType?: PropertyType;
  interestedPropertyId?: string;
  interestedPropertyName?: string;
  assignedToId?: string;
  assignedToName?: string;
  nextFollowUpAt?: string;
  score: number; // 0-100 conversion probability score
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  organizationId: string;
  name: string;
  phone: string;
  email?: string;
  budgetINR?: number;
  preferredLocation?: string;
  preferredType?: PropertyType;
  requirements?: string;
  notes?: string;
  totalDealsCount: number;
  totalDealsValueINR: number;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  priceINR: number;
  areaSqFt: number;
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';
  facing?: 'North' | 'East' | 'West' | 'South' | 'North-East' | 'North-West';
  address: string;
  locality: string;
  city: string;
  state: string;
  pincode?: string;
  ownerName?: string;
  ownerPhone?: string;
  amenities: string[];
  featuredImageUrl: string;
  images: string[];
  assignedAgentId?: string;
  assignedAgentName?: string;
  interestedLeadsCount?: number;
  siteVisitsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type DealStage =
  | 'NEW_LEAD'
  | 'QUALIFIED'
  | 'SITE_VISIT'
  | 'NEGOTIATION'
  | 'DOCUMENTATION'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export interface Deal {
  id: string;
  organizationId: string;
  title: string;
  dealValueINR: number;
  stage: DealStage;
  probability: number; // 0-100%
  expectedCloseDate?: string;
  leadId?: string;
  leadName?: string;
  clientId?: string;
  clientName?: string;
  propertyId?: string;
  propertyName?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SiteVisitStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED';

export interface SiteVisit {
  id: string;
  organizationId: string;
  leadId?: string;
  leadName?: string;
  customerPhone?: string;
  propertyId: string;
  propertyName: string;
  propertyLocation: string;
  assignedAgentId: string;
  assignedAgentName: string;
  visitDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "11:00 AM"
  status: SiteVisitStatus;
  checkInAt?: string;
  checkOutAt?: string;
  feedback?: string;
  rating?: number;
  photos?: string[];
  notes?: string;
  createdAt: string;
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';

export interface Task {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assignedUserId: string;
  assignedUserName: string;
  leadId?: string;
  leadName?: string;
  dealId?: string;
  dealTitle?: string;
  propertyId?: string;
  createdAt: string;
}

export type FollowUpType =
  | 'CALL'
  | 'WHATSAPP'
  | 'EMAIL'
  | 'MEETING'
  | 'SITE_VISIT'
  | 'OTHER';

export interface FollowUpItem {
  id: string;
  organizationId: string;
  leadId: string;
  leadName: string;
  customerPhone: string;
  propertyName?: string;
  type: FollowUpType;
  scheduledAt: string;
  status: 'OVERDUE' | 'DUE_TODAY' | 'UPCOMING' | 'COMPLETED';
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  eventType: 'VISIT' | 'FOLLOW_UP' | 'MEETING' | 'DEADLINE';
  startTime: string; // ISO
  endTime: string; // ISO
  relatedId?: string;
  relatedType?: string;
}

// WhatsApp CRM
export interface WhatsAppMessage {
  id: string;
  conversationId: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  body: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'document' | 'audio';
  createdAt: string;
}

export interface WhatsAppConversation {
  id: string;
  organizationId: string;
  customerPhone: string;
  customerName: string;
  leadId?: string;
  leadStatus?: LeadStatus;
  interestedProperty?: string;
  budget?: string;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: WhatsAppMessage[];
}

export interface WhatsAppTemplate {
  id: string;
  organizationId: string;
  name: string;
  category: 'WELCOME' | 'SITE_VISIT' | 'FOLLOW_UP' | 'CELEBRATION' | 'PRICE_DROP';
  body: string;
  variables: string[];
}

export interface AutomationRule {
  id: string;
  organizationId: string;
  name: string;
  triggerEvent:
    | 'LEAD_CREATED'
    | 'VISIT_SCHEDULED'
    | 'VISIT_REMINDER_TOMORROW'
    | 'INACTIVE_3_DAYS'
    | 'DEAL_WON';
  actionType: 'SEND_WHATSAPP' | 'CREATE_TASK' | 'ASSIGN_AGENT';
  templateId?: string;
  templateName?: string;
  isActive: boolean;
  executionCount: number;
  createdAt: string;
}

// Realty AI
export interface AIConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  actionDraft?: {
    type: 'WHATSAPP_MESSAGE' | 'FOLLOW_UP_TASK' | 'PROPERTY_RECOMMENDATION';
    recipientName?: string;
    recipientPhone?: string;
    messageText?: string;
    propertyIds?: string[];
    isExecuted?: boolean;
  };
}

export interface DocumentRecord {
  id: string;
  organizationId: string;
  title: string;
  category: 'PROPERTY' | 'CLIENT_KYC' | 'DEAL' | 'LEGAL' | 'OTHER';
  fileUrl: string;
  fileSizeMB: number;
  fileType: string;
  relatedName?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  organizationId: string;
  title: string;
  message: string;
  type: 'LEAD' | 'WHATSAPP' | 'VISIT' | 'TASK' | 'BILLING' | 'AI';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface ActivityLogItem {
  id: string;
  organizationId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  entityType: 'Lead' | 'Property' | 'Deal' | 'SiteVisit' | 'Task' | 'WhatsApp';
  entityId: string;
  entityName: string;
  description: string;
  createdAt: string;
}

// SaaS Admin
export interface SaaSAdminOverview {
  totalOrganizations: number;
  activeSubscriptions: number;
  monthlyRecurringRevenueINR: number;
  newCustomersThisMonth: number;
  churnRatePercent: number;
  totalActiveUsers: number;
  totalLeadsManaged: number;
  totalPropertiesListed: number;
  aiRequestsProcessed: number;
  whatsappMessagesSent: number;
}
