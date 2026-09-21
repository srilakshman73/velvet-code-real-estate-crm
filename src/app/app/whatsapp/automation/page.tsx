'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCRMStore } from '@/lib/store';
import { AutomationRule } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import {
  Zap,
  PlusCircle,
  ArrowRight,
  CheckCircle2,
  Sliders,
  MessageSquare,
  Clock,
  Trophy,
  Users,
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export default function WhatsAppAutomationPage() {
  const { automations, toggleAutomation, templates } = useCRMStore();
  const [isNewRuleModalOpen, setIsNewRuleModalOpen] = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/app/whatsapp"
            className="inline-flex items-center gap-1.5 text-xs text-[#625B51] hover:text-[#29251F] mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to WhatsApp Inbox
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#29251F] tracking-tight flex items-center gap-2">
              <Zap className="w-6 h-6 text-[#A374]" />
              WhatsApp Visual Automation Engine
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-[#A374]/15 text-[#805B25] border border-[#A374]/30 rounded-full">
              {automations.filter((a) => a.isActive).length} Active Rules
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#625B51] mt-1">
            Build event-driven workflows: Trigger → Condition → Action → WhatsApp Template Delivery.
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={() => setIsNewRuleModalOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Create Automation Flow
        </Button>
      </div>

      {/* Visual Workflow Cards */}
      <div className="space-y-4">
        {automations.map((rule) => (
          <div
            key={rule.id}
            className={`p-6 rounded-2xl border transition-all ${
              rule.isActive
                ? 'bg-[#FFFDF8] border-[#D4C9B9] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]'
                : 'bg-[#E8E1D5]/60 border-[#D4C9B9]/60 opacity-60'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Visual Flow Pipeline */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                {/* 1. TRIGGER */}
                <div className="p-3 rounded-xl bg-white border border-[#D4C9B9] flex items-center gap-2 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-[#805B25] font-serif">Trigger:</span>
                  <strong className="text-[#29251F]">{rule.triggerEvent}</strong>
                </div>

                <ArrowRight className="w-4 h-4 text-[#625B51] hidden sm:block" />

                {/* 2. CONDITION */}
                <div className="p-3 rounded-xl bg-white border border-[#D4C9B9] flex items-center gap-2 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-[#A87932] font-serif">Condition:</span>
                  <span className="text-[#29251F]">Valid Phone & Verified Org</span>
                </div>

                <ArrowRight className="w-4 h-4 text-[#625B51] hidden sm:block" />

                {/* 3. ACTION */}
                <div className="p-3 rounded-xl bg-white border border-[#3D7258]/30 flex items-center gap-2 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-[#3D7258] font-serif">Action:</span>
                  <strong className="text-[#3D7258]">
                    {rule.actionType} ({rule.templateName || 'Direct Task'})
                  </strong>
                </div>
              </div>

              {/* Execution Stats & Toggle */}
              <div className="flex items-center gap-4 flex-shrink-0 self-end lg:self-center">
                <div className="text-right text-xs">
                  <p className="text-[#625B51]">Fired <strong className="text-[#29251F]">{rule.executionCount}</strong> times</p>
                  <p className="text-[10px] text-[#3D7258] font-medium">100% SLA Executed</p>
                </div>

                <button
                  onClick={() => toggleAutomation(rule.id)}
                  className="p-1 text-[#625B51] hover:text-[#29251F] transition-transform active:scale-95"
                >
                  {rule.isActive ? (
                    <ToggleRight className="w-9 h-9 text-[#3D7258]" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-[#625B51]" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Automation Modal */}
      <Modal
        isOpen={isNewRuleModalOpen}
        onClose={() => setIsNewRuleModalOpen(false)}
        title="Create New Automation Flow"
        description="Set up automatic WhatsApp notifications based on CRM events."
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <Input
            label="Automation Workflow Name"
            placeholder="e.g. VIP Site Visit Instant Reminder"
            defaultValue="VIP Site Visit Instant Reminder"
          />

          <Select
            label="Select Trigger Event"
            options={[
              { value: 'LEAD_CREATED', label: 'When a new lead is ingested' },
              { value: 'VISIT_SCHEDULED', label: 'When site visit is booked' },
              { value: 'VISIT_REMINDER_TOMORROW', label: '1 Day before scheduled site visit' },
              { value: 'INACTIVE_3_DAYS', label: 'Lead inactive for 3 consecutive days' },
              { value: 'DEAL_WON', label: 'When deal is marked Closed Won' },
            ]}
          />

          <Select
            label="Action Type"
            options={[
              { value: 'SEND_WHATSAPP', label: 'Send WhatsApp template message' },
              { value: 'CREATE_TASK', label: 'Auto-create follow-up task' },
            ]}
          />

          <Select
            label="Template to Send"
            options={templates.map((t) => ({ value: t.id, label: t.name }))}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4C9B9]">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsNewRuleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="gold"
              size="md"
              onClick={() => setIsNewRuleModalOpen(false)}
              className="font-bold"
            >
              Activate Flow
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
