'use client';

import React, { useState } from 'react';
import { useCRMStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { formatRelativeTime, buildWhatsAppUrl } from '@/lib/utils';
import {
  Clock,
  Phone,
  MessageSquare,
  CalendarCheck,
  Mail,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Plus,
} from 'lucide-react';

export default function FollowUpsPage() {
  const { followUps, completeFollowUp, snoozeFollowUp } = useCRMStore();
  const [activeTab, setActiveTab] = useState<'DUE_TODAY' | 'OVERDUE' | 'UPCOMING' | 'COMPLETED'>('DUE_TODAY');

  const overdueCount = followUps.filter((f) => f.status === 'OVERDUE').length;
  const dueTodayCount = followUps.filter((f) => f.status === 'DUE_TODAY').length;
  const upcomingCount = followUps.filter((f) => f.status === 'UPCOMING').length;

  const filtered = followUps.filter((f) => {
    if (activeTab === 'DUE_TODAY') return f.status === 'DUE_TODAY';
    if (activeTab === 'OVERDUE') return f.status === 'OVERDUE';
    if (activeTab === 'UPCOMING') return f.status === 'UPCOMING';
    if (activeTab === 'COMPLETED') return f.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Client Follow-up Engine
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Proactive customer touchpoint tracker to maintain deal momentum across calls, WhatsApp, and meetings.
        </p>
      </div>

      {/* KPI Status Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setActiveTab('OVERDUE')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'OVERDUE'
              ? 'bg-rose-950/40 border-rose-500 text-white shadow-lg'
              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-mono">
            {overdueCount}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Needs immediate recall</p>
        </div>

        <div
          onClick={() => setActiveTab('DUE_TODAY')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'DUE_TODAY'
              ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg'
              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Due Today</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-2 font-mono">
            {dueTodayCount}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Scheduled before 7 PM</p>
        </div>

        <div
          onClick={() => setActiveTab('UPCOMING')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'UPCOMING'
              ? 'bg-blue-950/40 border-blue-500 text-white shadow-lg'
              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Upcoming</span>
            <CalendarCheck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-mono">
            {upcomingCount}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Next 7 days</p>
        </div>

        <div
          onClick={() => setActiveTab('COMPLETED')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'COMPLETED'
              ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg'
              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-300 mt-2 font-mono">
            {followUps.filter((f) => f.status === 'COMPLETED').length}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Successfully connected</p>
        </div>
      </div>

      {/* Follow-ups List */}
      <div className="space-y-3">
        {filtered.map((fu) => (
          <div
            key={fu.id}
            className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/90 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="text-base font-bold text-white">{fu.leadName}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 rounded">
                  {fu.type}
                </span>
                <span className="text-xs text-zinc-400">{fu.customerPhone}</span>
              </div>

              <p className="text-xs text-zinc-300">
                <strong className="text-amber-300">{fu.propertyName}</strong> — {fu.notes}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              {/* Direct Tappable Call */}
              <a
                href={`tel:${fu.customerPhone}`}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 text-xs font-semibold flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>Call Phone</span>
              </a>

              {/* Direct WhatsApp Click to Chat */}
              <a
                href={buildWhatsAppUrl(fu.customerPhone, `Hello ${fu.leadName}, following up regarding ${fu.propertyName || 'your inquiry'}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              {/* Snooze 1 Day */}
              <Button
                variant="subtle"
                size="xs"
                onClick={() => snoozeFollowUp(fu.id, 1)}
                leftIcon={<RotateCcw className="w-3 h-3" />}
              >
                Snooze 1D
              </Button>

              {/* Complete */}
              <Button
                variant="gold"
                size="xs"
                onClick={() => completeFollowUp(fu.id)}
              >
                Complete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
