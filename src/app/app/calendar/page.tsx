'use client';

import React, { useState } from 'react';
import { useCRMStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  CalendarCheck,
  Clock,
  Kanban,
  CheckSquare,
} from 'lucide-react';

export default function CalendarPage() {
  const { siteVisits, followUps, tasks, deals } = useCRMStore();
  const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK' | 'DAY'>('MONTH');

  // Days of September 2026
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  const getEventsForDay = (day: number) => {
    const dayStr = `2026-09-${day < 10 ? '0' + day : day}`;
    const visits = siteVisits.filter((v) => v.visitDate === dayStr);
    const fus = followUps.filter((f) => f.scheduledAt.startsWith(dayStr));
    const tks = tasks.filter((t) => t.dueDate.startsWith(dayStr));
    return { visits, fus, tks };
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Real Estate Activity Calendar
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
              September 2026
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Site viewings, client calls, meeting schedules, and transaction closing dates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl flex text-xs">
            <button
              onClick={() => setViewMode('MONTH')}
              className={`px-3 py-1.5 rounded-lg font-medium ${
                viewMode === 'MONTH' ? 'bg-amber-500 text-black font-semibold' : 'text-zinc-400'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('WEEK')}
              className={`px-3 py-1.5 rounded-lg font-medium ${
                viewMode === 'WEEK' ? 'bg-amber-500 text-black font-semibold' : 'text-zinc-400'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('DAY')}
              className={`px-3 py-1.5 rounded-lg font-medium ${
                viewMode === 'DAY' ? 'bg-amber-500 text-black font-semibold' : 'text-zinc-400'
              }`}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">September 2026</h2>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> Site Visits
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Follow-ups
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Tasks
            </span>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider pb-2 border-b border-zinc-850">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2 pt-2">
          {daysInMonth.map((day) => {
            const { visits, fus, tks } = getEventsForDay(day);
            const isToday = day === 14;

            return (
              <div
                key={day}
                className={`min-h-[100px] p-2 rounded-xl border flex flex-col justify-between transition-colors ${
                  isToday
                    ? 'bg-amber-950/20 border-amber-500/50 shadow-md'
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                      isToday ? 'bg-amber-400 text-black font-extrabold' : 'text-zinc-300'
                    }`}
                  >
                    {day}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-extrabold text-amber-400 uppercase">
                      Today
                    </span>
                  )}
                </div>

                <div className="space-y-1 my-1 overflow-hidden">
                  {visits.map((v) => (
                    <div
                      key={v.id}
                      className="px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] truncate"
                      title={v.propertyName}
                    >
                      📍 {v.timeSlot} {v.propertyName}
                    </div>
                  ))}
                  {fus.map((f) => (
                    <div
                      key={f.id}
                      className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] truncate"
                      title={f.notes}
                    >
                      📞 {f.leadName}
                    </div>
                  ))}
                  {tks.map((t) => (
                    <div
                      key={t.id}
                      className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] truncate"
                      title={t.title}
                    >
                      ✓ {t.title}
                    </div>
                  ))}
                </div>

                <div className="text-[9px] text-zinc-500 text-right">
                  {visits.length + fus.length + tks.length > 0 &&
                    `${visits.length + fus.length + tks.length} events`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
