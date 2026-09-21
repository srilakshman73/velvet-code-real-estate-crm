'use client';

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Key,
  Server,
  AlertTriangle,
  CheckCircle2,
  Save,
  Globe,
  Mail,
  Phone,
  MessageSquare,
  Sparkles,
  Database,
  Lock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { VelvetCodeLogo } from '@/components/brand/VelvetCodeLogo';

export default function AdminPlatformSettingsPage() {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [platformConfig, setPlatformConfig] = useState({
    companyName: 'Velvet Code',
    tagline: 'Technology & Digital Solutions',
    supportPhone: '+91 63833 95915',
    supportEmail: 'srilakshman73@gmail.com',
    hqAddress: 'Capital Park Towers, Anna Salai, Chennai, Tamil Nadu, 600032',
    razorpayKeyId: 'rzp_live_VC_RealEstate_2026_Secured',
    razorpayKeySecret: '••••••••••••••••••••••••••••••••',
    razorpayWebhookSecret: 'whsec_rzp_velvetcode_live_prod_2026',
    geminiApiKey: 'AIzaSyVC_Enterprise_Gemini15Pro_Production_Key',
    metaAppSecret: '••••••••••••••••••••••••••••••••',
    maintenanceMode: false,
    globalAnnouncementText: '',
    trialPeriodDays: '14',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#29251F] tracking-tight">Platform Global Settings</h1>
          <p className="text-sm text-[#625B51] mt-1">
            Velvet Code SaaS platform environment configurations, payment gateway secrets, and AI keys.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#3D7258]/10 border border-[#3D7258]/20 text-[#3D7258] rounded-lg text-xs font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Platform configuration updated
            </div>
          )}
          <Button onClick={handleSave} variant="gold" icon={<Save className="w-4 h-4" />}>
            Save Platform Config
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand & Legal Entity Card */}
        <Card orientation="vertical" className="bg-[#FFFDF8] border-[#D4C9B9] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-bold text-[#29251F]">SaaS Provider Entity & Support Channel</h2>
            <VelvetCodeLogo variant="horizontal" size="sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Parent Company Brand"
              value={platformConfig.companyName}
              onChange={(e) => setPlatformConfig({ ...platformConfig, companyName: e.target.value })}
            />
            <Input
              label="Brand Tagline"
              value={platformConfig.tagline}
              onChange={(e) => setPlatformConfig({ ...platformConfig, tagline: e.target.value })}
            />
            <Input
              label="Official WhatsApp Support & Inquiries"
              value={platformConfig.supportPhone}
              onChange={(e) => setPlatformConfig({ ...platformConfig, supportPhone: e.target.value })}
              icon={<Phone className="w-4 h-4 text-[#3D7258]" />}
              helperText="Click-to-chat destination for all marketing & tenant inquiries"
            />
            <Input
              label="Official Platform Support Email"
              value={platformConfig.supportEmail}
              onChange={(e) => setPlatformConfig({ ...platformConfig, supportEmail: e.target.value })}
              icon={<Mail className="w-4 h-4 text-[#625B51]" />}
            />
            <div className="md:col-span-2">
              <Input
                label="Velvet Code Headquarters Address"
                value={platformConfig.hqAddress}
                onChange={(e) => setPlatformConfig({ ...platformConfig, hqAddress: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* Global API Gateway Keys */}
        <Card orientation="vertical" className="bg-[#FFFDF8] border-[#D4C9B9] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
          <h2 className="text-lg font-serif font-bold text-[#29251F] mb-1">Global Gateway Credentials & Secrets</h2>
          <p className="text-xs text-[#625B51] mb-6">
            Platform-wide master credentials for Indian payment processing and AI inference orchestration.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Razorpay Master Live Key ID"
              value={platformConfig.razorpayKeyId}
              onChange={(e) => setPlatformConfig({ ...platformConfig, razorpayKeyId: e.target.value })}
              icon={<Key className="w-4 h-4 text-[#625B51]" />}
            />
            <Input
              label="Razorpay Master Key Secret"
              type="password"
              value={platformConfig.razorpayKeySecret}
              onChange={(e) => setPlatformConfig({ ...platformConfig, razorpayKeySecret: e.target.value })}
              icon={<Lock className="w-4 h-4 text-[#625B51]" />}
            />
            <Input
              label="Razorpay Webhook Verification Secret"
              value={platformConfig.razorpayWebhookSecret}
              onChange={(e) => setPlatformConfig({ ...platformConfig, razorpayWebhookSecret: e.target.value })}
              icon={<Shield className="w-4 h-4 text-[#625B51]" />}
            />
            <Input
              label="Google Gemini 1.5 Pro Master API Key"
              type="password"
              value={platformConfig.geminiApiKey}
              onChange={(e) => setPlatformConfig({ ...platformConfig, geminiApiKey: e.target.value })}
              icon={<Sparkles className="w-4 h-4 text-[#A374]" />}
            />
          </div>
        </Card>

        {/* System Operations & Maintenance */}
        <Card orientation="vertical" className="bg-[#FFFDF8] border-[#D4C9B9] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
          <h2 className="text-lg font-serif font-bold text-[#29251F] mb-1">System Operations & Trial Policies</h2>
          <p className="text-xs text-[#625B51] mb-6">
            Manage platform operational mode and tenant onboarding trial terms.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-[#D4C9B9]">
              <div>
                <div className="text-sm font-semibold text-[#29251F] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#805B25]" />
                  Scheduled Maintenance Mode
                </div>
                <div className="text-xs text-[#625B51]">
                  When enabled, tenants will see a graceful maintenance banner. APIs remain read-only.
                </div>
              </div>
              <input
                type="checkbox"
                checked={platformConfig.maintenanceMode}
                onChange={(e) => setPlatformConfig({ ...platformConfig, maintenanceMode: e.target.checked })}
                className="w-4 h-4 rounded text-[#A374] focus:ring-[#A374] bg-white border-[#D4C9B9]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <Input
                label="Free Trial Period (Days)"
                type="number"
                value={platformConfig.trialPeriodDays}
                onChange={(e) => setPlatformConfig({ ...platformConfig, trialPeriodDays: e.target.value })}
                helperText="Standard trial granted to newly registered agencies without credit card"
              />
              <Input
                label="Global Top Banner Announcement"
                placeholder="e.g. Diwali festive update: WhatsApp automated brochures now live!"
                value={platformConfig.globalAnnouncementText}
                onChange={(e) => setPlatformConfig({ ...platformConfig, globalAnnouncementText: e.target.value })}
              />
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
