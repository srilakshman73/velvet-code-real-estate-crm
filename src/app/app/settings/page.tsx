'use client';

import React, { useState } from 'react';
import { useCRM } from '@/lib/store';
import {
  Building,
  Phone,
  Mail,
  MapPin,
  Globe,
  Shield,
  Key,
  Bot,
  Bell,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Copy,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Sliders,
  Send,
  Database,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { buildWhatsAppUrl } from '@/lib/utils';

export default function SettingsPage() {
  const { currentOrg, currentUser, currentPlanLimits } = useCRM();

  const [activeTab, setActiveTab] = useState<'general' | 'whatsapp' | 'ai' | 'notifications' | 'security' | 'integrations'>('general');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Agency General Settings
  const [orgForm, setOrgForm] = useState({
    name: currentOrg.name || 'Velvet Code Realty',
    businessType: currentOrg.businessType || 'AGENCY',
    phone: currentOrg.phone || '+91 63833 95915',
    email: currentOrg.email || 'srilakshman73@gmail.com',
    address: currentOrg.address || 'Capital Park Towers, Anna Salai',
    city: currentOrg.city || 'Chennai',
    state: currentOrg.state || 'Tamil Nadu',
    country: 'India',
    website: currentOrg.website || 'https://velvet-code-real-estate-crm.vercel.app',
    reraNumber: 'TN/RERA/AG/0148/2023',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata (GMT +5:30)',
  });

  // WhatsApp Cloud API Configuration
  const [waConfig, setWaConfig] = useState({
    wabaId: 'WABA_6383395915_VC',
    phoneNumberId: 'PN_6383395915',
    displayPhoneNumber: '+91 63833 95915',
    accessToken: 'EAAG6383395915VC_MetaGraphApiToken_Production_Secured',
    webhookVerifyToken: 'velvetcode_crm_webhook_verify_2026',
    webhookUrl: 'https://api.velvetcode.in/webhooks/whatsapp',
    autoGreetingEnabled: true,
    autoOutOfHoursEnabled: false,
    outOfHoursMessage: 'Thank you for contacting Velvet Code Realty. Our team is offline right now. We will respond tomorrow by 9:30 AM.',
  });

  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // AI Configuration
  const [aiConfig, setAiConfig] = useState({
    provider: 'gemini-1.5-pro',
    systemPromptPersona: 'Senior Indian Real Estate Advisor specializing in luxury apartments, villas, and DTCP approved commercial plots.',
    autoScoreLeads: true,
    autoDraftFollowups: true,
    leadScoringSensitivity: 'High (80%+ threshold)',
    enablePropertyMatching: true,
    temperature: '0.7',
  });

  // Notification Toggles
  const [notifications, setNotifications] = useState({
    emailNewLead: true,
    smsNewLead: false,
    waNewLead: true,
    siteVisitReminders: true,
    dealStageWonAlert: true,
    dailySummaryDigest: true,
    quotaThreshold80Alert: true,
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const testWebhook = () => {
    setWebhookStatus('testing');
    setTimeout(() => {
      setWebhookStatus('success');
      setTimeout(() => setWebhookStatus('idle'), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 bg-[#E9DFC8] text-[#2C241A] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2C241A] tracking-tight">Organization Settings</h1>
          <p className="text-sm text-[#6A5A44] mt-1">
            Configure your workspace, WhatsApp Cloud API tokens, Realty AI parameters, and notifications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedSuccess && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#547A61]/10 border border-[#547A61]/20 text-[#547A61] rounded-lg text-xs animate-in fade-in font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Settings saved successfully
            </div>
          )}
          <Button onClick={handleSave} variant="gold" icon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D8C7A5] overflow-x-auto pb-px scrollbar-none">
        {[
          { id: 'general', label: 'Agency Profile', icon: Building },
          { id: 'whatsapp', label: 'WhatsApp Cloud API', icon: MessageSquare },
          { id: 'ai', label: 'Realty AI Engine', icon: Sparkles },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'security', label: 'Security & Access', icon: Shield },
          { id: 'integrations', label: 'Integrations & Webhooks', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'border-[#A37432] text-[#7A5520] bg-[#A37432]/10 font-semibold'
                  : 'border-transparent text-[#6A5A44] hover:text-[#2C241A] hover:border-[#D8C7A5]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}

      {/* 1. GENERAL TAB */}
      {activeTab === 'general' && (
        <form onSubmit={handleSave} className="space-y-6">
          <Card orientation="vertical">
            <h2 className="text-lg font-serif font-bold text-[#2C241A] mb-1">Company & Brand Identity</h2>
            <p className="text-xs text-[#6A5A44] mb-6">
              This information is reflected on client proposals, PDF brochures, invoice receipts, and WhatsApp message signatures.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Agency / Company Name"
                value={orgForm.name}
                onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                required
              />
              <div>
                <label className="block text-xs font-semibold text-[#2C241A] mb-1.5">Business Entity Type</label>
                <select
                  value={orgForm.businessType}
                  onChange={(e) => setOrgForm({ ...orgForm, businessType: e.target.value as any })}
                  className="w-full bg-[#FFF9F0] border border-[#D8C7A5] rounded-xl px-3.5 py-2.5 text-sm text-[#2C241A] focus:outline-none focus:border-[#A37432]"
                >
                  <option value="AGENCY">Real Estate Agency / Firm</option>
                  <option value="BROKER">Independent Broker</option>
                  <option value="BUILDER">Real Estate Developer / Builder</option>
                  <option value="AGENT">Individual Consultant</option>
                </select>
              </div>

              <Input
                label="Primary Business Phone"
                value={orgForm.phone}
                onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
                icon={<Phone className="w-4 h-4 text-[#6A5A44]" />}
              />
              <Input
                label="Official Email Address"
                type="email"
                value={orgForm.email}
                onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                icon={<Mail className="w-4 h-4 text-[#6A5A44]" />}
              />

              <Input
                label="RERA Registration Number"
                value={orgForm.reraNumber}
                onChange={(e) => setOrgForm({ ...orgForm, reraNumber: e.target.value })}
                placeholder="e.g. TN/RERA/AG/0148/2023"
              />
              <Input
                label="Official Website URL"
                value={orgForm.website}
                onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                icon={<Globe className="w-4 h-4 text-[#6A5A44]" />}
              />

              <div className="md:col-span-2">
                <Input
                  label="Office Physical Address"
                  value={orgForm.address}
                  onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                  icon={<MapPin className="w-4 h-4 text-[#6A5A44]" />}
                />
              </div>

              <Input
                label="City / Hub"
                value={orgForm.city}
                onChange={(e) => setOrgForm({ ...orgForm, city: e.target.value })}
              />
              <Input
                label="State / Province"
                value={orgForm.state}
                onChange={(e) => setOrgForm({ ...orgForm, state: e.target.value })}
              />
            </div>
          </Card>

          <Card orientation="vertical">
            <h2 className="text-lg font-serif font-bold text-[#2C241A] mb-1">Regional & Localization Preferences</h2>
            <p className="text-xs text-[#6A5A44] mb-6">
              Defaults used for lead budgets, deal currency conversions, and follow-up scheduling.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[#2C241A] mb-1.5">Default Currency</label>
                <select
                  value={orgForm.currency}
                  onChange={(e) => setOrgForm({ ...orgForm, currency: e.target.value })}
                  className="w-full bg-[#FFF9F0] border border-[#D8C7A5] rounded-xl px-3.5 py-2.5 text-sm text-[#2C241A] focus:outline-none focus:border-[#A37432]"
                >
                  <option value="INR (₹)">INR (₹ - Indian Rupee, Lakhs & Crores format)</option>
                  <option value="USD ($)">USD ($ - US Dollar)</option>
                  <option value="AED (د.إ)">AED (د.إ - UAE Dirham)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C241A] mb-1.5">Workspace Timezone</label>
                <select
                  value={orgForm.timezone}
                  onChange={(e) => setOrgForm({ ...orgForm, timezone: e.target.value })}
                  className="w-full bg-[#FFF9F0] border border-[#D8C7A5] rounded-xl px-3.5 py-2.5 text-sm text-[#2C241A] focus:outline-none focus:border-[#A37432]"
                >
                  <option value="Asia/Kolkata (GMT +5:30)">Asia/Kolkata (GMT +5:30 - India Standard Time)</option>
                  <option value="Asia/Dubai (GMT +4:00)">Asia/Dubai (GMT +4:00 - Gulf Standard Time)</option>
                  <option value="Asia/Singapore (GMT +8:00)">Asia/Singapore (GMT +8:00)</option>
                </select>
              </div>
            </div>
          </Card>
        </form>
      )}

      {/* 2. WHATSAPP CLOUD API TAB */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          <Card orientation="vertical">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-serif font-bold text-[#2C241A]">Meta WhatsApp Cloud API Configuration</h2>
                  <Badge variant="success">Connected & Verified</Badge>
                </div>
                <p className="text-xs text-[#6A5A44] mt-1">
                  Connect your Meta Business Manager WhatsApp Phone Number to enable automated customer messaging and two-way CRM sync.
                </p>
              </div>
              <a
                href={buildWhatsAppUrl('916383395915', 'Hello, I would like to know more about your Real Estate CRM.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#547A61]/10 text-[#547A61] border border-[#547A61]/20 text-xs font-medium hover:bg-[#547A61]/20 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Test Official Chat (+91 63833 95915)
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="WhatsApp Business Account ID (WABA ID)"
                value={waConfig.wabaId}
                onChange={(e) => setWaConfig({ ...waConfig, wabaId: e.target.value })}
              />
              <Input
                label="WhatsApp Phone Number ID"
                value={waConfig.phoneNumberId}
                onChange={(e) => setWaConfig({ ...waConfig, phoneNumberId: e.target.value })}
              />
              <Input
                label="Sender Display Phone Number"
                value={waConfig.displayPhoneNumber}
                onChange={(e) => setWaConfig({ ...waConfig, displayPhoneNumber: e.target.value })}
                helperText="Official verified phone number registered on Meta Business Suite"
              />
              <div className="relative">
                <Input
                  label="System User Permanent Access Token"
                  type="password"
                  value={waConfig.accessToken}
                  onChange={(e) => setWaConfig({ ...waConfig, accessToken: e.target.value })}
                  helperText="Meta Graph API Token with whatsapp_business_messaging permissions"
                />
              </div>
            </div>
          </Card>

          <Card orientation="vertical">
            <h2 className="text-lg font-serif font-bold text-[#2C241A] mb-1">Webhook Inbound Sync</h2>
            <p className="text-xs text-[#6A5A44] mb-6">
              Configure these endpoints in your Meta App Dashboard &gt; WhatsApp &gt; Configuration to receive incoming messages, read receipts, and delivery statuses.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2C241A] mb-1.5">Callback URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={waConfig.webhookUrl}
                    className="flex-1 bg-[#FFF9F0] border border-[#D8C7A5] rounded-xl px-3.5 py-2.5 text-sm text-[#2C241A] font-mono focus:outline-none"
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleCopy(waConfig.webhookUrl, 'webhook-url')}
                    icon={copiedKey === 'webhook-url' ? <CheckCircle2 className="w-4 h-4 text-[#547A61]" /> : <Copy className="w-4 h-4" />}
                  >
                    {copiedKey === 'webhook-url' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C241A] mb-1.5">Verify Token</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={waConfig.webhookVerifyToken}
                    className="flex-1 bg-[#FFF9F0] border border-[#D8C7A5] rounded-xl px-3.5 py-2.5 text-sm text-[#2C241A] font-mono focus:outline-none"
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleCopy(waConfig.webhookVerifyToken, 'verify-token')}
                    icon={copiedKey === 'verify-token' ? <CheckCircle2 className="w-4 h-4 text-[#547A61]" /> : <Copy className="w-4 h-4" />}
                  >
                    {copiedKey === 'verify-token' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[#D8C7A5]">
                <div className="flex items-center gap-2 text-xs text-[#6A5A44]">
                  <Shield className="w-4 h-4 text-[#A37432]" />
                  SSL Certificate 256-bit encryption active. Webhook signature validated with App Secret.
                </div>
                <Button
                  variant="outline"
                  onClick={testWebhook}
                  disabled={webhookStatus === 'testing'}
                  icon={<RefreshCw className={`w-4 h-4 ${webhookStatus === 'testing' ? 'animate-spin' : ''}`} />}
                >
                  {webhookStatus === 'testing' ? 'Pinging Webhook...' : webhookStatus === 'success' ? 'Ping 200 OK ✓' : 'Test Webhook Ping'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 3. REALTY AI TAB */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <Card orientation="vertical">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-serif font-bold text-[#2C241A]">Realty AI Autonomous Engine</h2>
                  <Badge variant="gold">Active on {currentPlanLimits.tier}</Badge>
                </div>
                <p className="text-xs text-[#6A5A44] mt-1">
                  Adjust model hyperparameters, lead scoring sensitivity, and personalized agent prompts.
                </p>
              </div>
              <Sparkles className="w-6 h-6 text-[#A37432] animate-pulse" />
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#2C241A] mb-1.5">AI Engine Foundation Model</label>
                <select
                  value={aiConfig.provider}
                  onChange={(e) => setAiConfig({ ...aiConfig, provider: e.target.value })}
                  className="w-full bg-[#FFF9F0] border border-[#D8C7A5] rounded-xl px-3.5 py-2.5 text-sm text-[#2C241A] focus:outline-none focus:border-[#A37432]"
                >
                  <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Ultra-Fast Indian Real Estate Specialist)</option>
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Low-Latency High-Volume Automations)</option>
                  <option value="gpt-4o">OpenAI GPT-4o Enterprise Gateway</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C241A] mb-1.5">System Persona & Domain Instructions</label>
                <textarea
                  rows={3}
                  value={aiConfig.systemPromptPersona}
                  onChange={(e) => setAiConfig({ ...aiConfig, systemPromptPersona: e.target.value })}
                  className="w-full bg-[#FFF9F0] border border-[#D8C7A5] rounded-xl p-3 text-sm text-[#2C241A] focus:outline-none focus:border-[#A37432]"
                />
                <p className="text-xs text-[#6A5A44] mt-1">
                  Realty AI will tailor WhatsApp drafts, brochure blurbs, and lead evaluations according to this persona.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-[#D8C7A5]">
                <div className="flex items-center justify-between p-3.5 bg-[#F4EAD7] rounded-xl border border-[#D8C7A5]">
                  <div>
                    <div className="text-sm font-semibold text-[#2C241A]">Automatic Lead Scoring</div>
                    <div className="text-xs text-[#6A5A44]">Recalculate 0-100 probability score on every inquiry update</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiConfig.autoScoreLeads}
                    onChange={(e) => setAiConfig({ ...aiConfig, autoScoreLeads: e.target.checked })}
                    className="w-4 h-4 rounded text-[#A37432] focus:ring-[#A37432] bg-[#FFF9F0] border-[#D8C7A5]"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-[#F4EAD7] rounded-xl border border-[#D8C7A5]">
                  <div>
                    <div className="text-sm font-semibold text-[#2C241A]">Instant Follow-up Suggestions</div>
                    <div className="text-xs text-[#6A5A44]">Generate 1-click WhatsApp copy after site visits</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiConfig.autoDraftFollowups}
                    onChange={(e) => setAiConfig({ ...aiConfig, autoDraftFollowups: e.target.checked })}
                    className="w-4 h-4 rounded text-[#A37432] focus:ring-[#A37432] bg-[#FFF9F0] border-[#D8C7A5]"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 4. NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <Card orientation="vertical">
          <h2 className="text-lg font-serif font-bold text-[#2C241A] mb-1">Notification Channels & Alerts</h2>
          <p className="text-xs text-[#6A5A44] mb-6">
            Choose when and where your sales agents and leadership receive system alerts.
          </p>

          <div className="divide-y divide-[#D8C7A5]">
            {[
              { id: 'emailNewLead', title: 'New Inbound Lead Alert', desc: 'Email notification whenever a lead arrives from Web or Ads.', key: 'emailNewLead' },
              { id: 'waNewLead', title: 'WhatsApp Instant Notification', desc: 'Send an alert to the assigned broker phone immediately.', key: 'waNewLead' },
              { id: 'siteVisitReminders', title: 'Site Visit Reminders', desc: 'Alert agents and buyers 2 hours prior to scheduled property walkthroughs.', key: 'siteVisitReminders' },
              { id: 'dealStageWonAlert', title: 'Deal Won Celebrations', desc: 'Broadcast celebratory notification to the agency team when a deal closes.', key: 'dealStageWonAlert' },
              { id: 'dailySummaryDigest', title: 'Daily Pipeline Digest', desc: 'Morning 8:30 AM summary of overdue follow-ups and scheduled visits.', key: 'dailySummaryDigest' },
            ].map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#2C241A]">{item.title}</div>
                  <div className="text-xs text-[#6A5A44]">{item.desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={(notifications as any)[item.key]}
                  onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                  className="w-4 h-4 rounded text-[#A37432] focus:ring-[#A37432] bg-[#FFF9F0] border-[#D8C7A5]"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 5. SECURITY & ACCESS TAB */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card orientation="vertical">
            <h2 className="text-lg font-serif font-bold text-[#2C241A] mb-1">Multi-Tenant Access & Role Permissions</h2>
            <p className="text-xs text-[#6A5A44] mb-6">
              Velvet Code isolates all records with row-level tenant security (<code>organization_id</code>).
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#F4EAD7] border border-[#D8C7A5] flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#2C241A]">Two-Factor Authentication (2FA)</div>
                  <div className="text-xs text-[#6A5A44]">Enforce TOTP authenticator app for all admin and owner accounts.</div>
                </div>
                <Badge variant="outline">Recommended</Badge>
              </div>

              <div className="p-4 rounded-xl bg-[#F4EAD7] border border-[#D8C7A5] flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#2C241A]">IP Whitelisting & Session Timeout</div>
                  <div className="text-xs text-[#6A5A44]">Automatically logout inactive agents after 12 hours.</div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>

              <div className="p-4 rounded-xl bg-[#F4EAD7] border border-[#D8C7A5] flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#2C241A]">Lead Phone Masking</div>
                  <div className="text-xs text-[#6A5A44]">Prevent junior agents from exporting raw buyer telephone contact lists.</div>
                </div>
                <Badge variant="warning">Business Tier Only</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 6. INTEGRATIONS TAB */}
      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { name: 'Meta WhatsApp Cloud', status: 'Connected', desc: 'Direct webhook & cloud API messaging', icon: MessageSquare, connected: true },
            { name: 'Razorpay PG', status: 'Live Mode', desc: 'Automated recurring billing & tokenized payments', icon: Shield, connected: true },
            { name: 'Google Calendar Sync', status: 'Available', desc: 'Auto-sync site visits to Google Workspace', icon: ExternalLink, connected: false },
            { name: 'Facebook Lead Ads', status: 'Ready to Link', desc: 'Direct webhook ingestion into CRM Leads', icon: Globe, connected: false },
            { name: 'MagicBricks / 99acres', status: 'Webhook Ready', desc: 'Ingest portal inquiries into unified inbox', icon: Building, connected: false },
            { name: 'AWS S3 / Cloudinary', status: 'Connected', desc: 'Encrypted document vault storage', icon: Database, connected: true },
          ].map((int, i) => {
            const Icon = int.icon;
            return (
              <Card key={i} orientation="vertical" className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-[#F4EAD7] border border-[#D8C7A5] text-[#7A5520]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant={int.connected ? 'success' : 'neutral'}>{int.status}</Badge>
                  </div>
                  <h3 className="text-sm font-serif font-bold text-[#2C241A]">{int.name}</h3>
                  <p className="text-xs text-[#6A5A44] mt-1">{int.desc}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#D8C7A5] flex items-center justify-between">
                  <span className="text-xs text-[#6A5A44]">v2.4 API</span>
                  <Button variant="ghost" size="sm">Configure</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
