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
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to WhatsApp Inbox
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-400" />
              WhatsApp Visual Automation Engine
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
              {automations.filter((a) => a.isActive).length} Active Rules
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
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
                ? 'bg-zinc-950 border-zinc-800/90 shadow-xl'
                : 'bg-zinc-950/40 border-zinc-900 opacity-60'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Visual Flow Pipeline */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                {/* 1. TRIGGER */}
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-amber-400">Trigger:</span>
                  <strong className="text-white">{rule.triggerEvent}</strong>
                </div>

                <ArrowRight className="w-4 h-4 text-zinc-600 hidden sm:block" />

                {/* 2. CONDITION */}
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-blue-400">Condition:</span>
                  <span className="text-zinc-200">Valid Phone & Verified Org</span>
                </div>

                <ArrowRight className="w-4 h-4 text-zinc-600 hidden sm:block" />

                {/* 3. ACTION */}
                <div className="p-3 rounded-xl bg-zinc-900 border border-emerald-500/40 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-emerald-400">Action:</span>
                  <strong className="text-emerald-300">
                    {rule.actionType} ({rule.templateName || 'Direct Task'})
                  </strong>
                </div>
              </div>

              {/* Execution Stats & Toggle */}
              <div className="flex items-center gap-4 flex-shrink-0 self-end lg:self-center">
                <div className="text-right text-xs">
                  <p className="text-zinc-400">Fired <strong className="text-white">{rule.executionCount}</strong> times</p>
                  <p className="text-[10px] text-emerald-400 font-medium">100% SLA Executed</p>
                </div>

                <button
                  onClick={() => toggleAutomation(rule.id)}
                  className="p-1 text-zinc-300 hover:text-white transition-transform active:scale-95"
                >
                  {rule.isActive ? (
                    <ToggleRight className="w-9 h-9 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-zinc-600" />
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
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
