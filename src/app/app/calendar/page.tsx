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
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#29251F] tracking-tight">
              Real Estate Activity Calendar
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-[#A374]/15 text-[#805B25] border border-[#A374]/30 rounded-full">
              September 2026
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#625B51] mt-1">
            Site viewings, client calls, meeting schedules, and transaction closing dates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#FFFDF8] border border-[#D4C9B9] p-1 rounded-xl flex text-xs shadow-sm">
            <button
              onClick={() => setViewMode('MONTH')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'MONTH' ? 'bg-[#A374] text-white font-semibold shadow-sm' : 'text-[#625B51] hover:text-[#29251F]'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('WEEK')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'WEEK' ? 'bg-[#A374] text-white font-semibold shadow-sm' : 'text-[#625B51] hover:text-[#29251F]'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('DAY')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'DAY' ? 'bg-[#A374] text-white font-semibold shadow-sm' : 'text-[#625B51] hover:text-[#29251F]'
              }`}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="rounded-2xl border border-[#D4C9B9] bg-[#FFFDF8] p-4 sm:p-6 shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
        <div className="flex items-center justify-between pb-4 border-b border-[#D4C9B9] mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-serif font-bold text-[#29251F]">September 2026</h2>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded-lg hover:bg-[#E8E1D5] text-[#625B51] hover:text-[#29251F] transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1 rounded-lg hover:bg-[#E8E1D5] text-[#625B51] hover:text-[#29251F] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[#A87932] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#A87932]" /> Site Visits
            </span>
            <span className="flex items-center gap-1.5 text-[#805B25] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#A374]" /> Follow-ups
            </span>
            <span className="flex items-center gap-1.5 text-[#2F6B52] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#2F6B52]" /> Tasks
            </span>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#625B51] uppercase tracking-wider pb-2 border-b border-[#D4C9B9]">
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
                    ? 'bg-[#A374]/10 border-[#A374] shadow-sm'
                    : 'bg-white border-[#D4C9B9] hover:border-[#A374]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                      isToday ? 'bg-[#A374] text-white font-extrabold' : 'text-[#29251F]'
                    }`}
                  >
                    {day}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-extrabold text-[#805B25] uppercase">
                      Today
                    </span>
                  )}
                </div>

                <div className="space-y-1 my-1 overflow-hidden">
                  {visits.map((v) => (
                    <div
                      key={v.id}
                      className="px-1.5 py-0.5 rounded bg-[#A87932]/10 border border-[#A87932]/25 text-[#A87932] text-[10px] truncate font-medium"
                      title={v.propertyName}
                    >
                      📍 {v.timeSlot} {v.propertyName}
                    </div>
                  ))}
                  {fus.map((f) => (
                    <div
                      key={f.id}
                      className="px-1.5 py-0.5 rounded bg-[#A374]/15 border border-[#A374]/30 text-[#805B25] text-[10px] truncate font-medium"
                      title={f.notes}
                    >
                      📞 {f.leadName}
                    </div>
                  ))}
                  {tks.map((t) => (
                    <div
                      key={t.id}
                      className="px-1.5 py-0.5 rounded bg-[#3D7258]/10 border border-[#3D7258]/20 text-[#3D7258] text-[10px] truncate font-medium"
                      title={t.title}
                    >
                      ✓ {t.title}
                    </div>
                  ))}
                </div>

                <div className="text-[9px] text-[#625B51] text-right">
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
