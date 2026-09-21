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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#E9DFC8] text-[#2C241A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C241A] tracking-tight">
              Real Estate Activity Calendar
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-[#A37432]/15 text-[#7A5520] border border-[#A37432]/30 rounded-full">
              September 2026
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6A5A44] mt-1">
            Site viewings, client calls, meeting schedules, and transaction closing dates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#FFF9F0] border border-[#D8C7A5] p-1 rounded-xl flex text-xs shadow-sm">
            <button
              onClick={() => setViewMode('MONTH')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'MONTH' ? 'bg-[#A37432] text-white font-semibold shadow-sm' : 'text-[#6A5A44] hover:text-[#2C241A]'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('WEEK')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'WEEK' ? 'bg-[#A37432] text-white font-semibold shadow-sm' : 'text-[#6A5A44] hover:text-[#2C241A]'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('DAY')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'DAY' ? 'bg-[#A37432] text-white font-semibold shadow-sm' : 'text-[#6A5A44] hover:text-[#2C241A]'
              }`}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="rounded-2xl border border-[#D8C7A5] bg-[#FFF9F0] p-4 sm:p-6 shadow-[0_8px_24px_rgba(120,90,40,0.08)]">
        <div className="flex items-center justify-between pb-4 border-b border-[#D8C7A5] mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-serif font-bold text-[#2C241A]">September 2026</h2>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded-lg hover:bg-[#F4EAD7] text-[#6A5A44] hover:text-[#2C241A] transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1 rounded-lg hover:bg-[#F4EAD7] text-[#6A5A44] hover:text-[#2C241A] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[#C39A5B] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#C39A5B]" /> Site Visits
            </span>
            <span className="flex items-center gap-1.5 text-[#7A5520] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#A37432]" /> Follow-ups
            </span>
            <span className="flex items-center gap-1.5 text-[#547A61] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#547A61]" /> Tasks
            </span>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#6A5A44] uppercase tracking-wider pb-2 border-b border-[#D8C7A5]">
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
                    ? 'bg-[#A37432]/15 border-[#A37432] shadow-sm'
                    : 'bg-[#FFF9F0] border-[#D8C7A5] hover:border-[#A37432]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                      isToday ? 'bg-[#A37432] text-white font-extrabold' : 'text-[#2C241A]'
                    }`}
                  >
                    {day}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-extrabold text-[#7A5520] uppercase">
                      Today
                    </span>
                  )}
                </div>

                <div className="space-y-1 my-1 overflow-hidden">
                  {visits.map((v) => (
                    <div
                      key={v.id}
                      className="px-1.5 py-0.5 rounded bg-[#C39A5B]/15 border border-[#C39A5B]/30 text-[#7A5520] text-[10px] truncate font-medium"
                      title={v.propertyName}
                    >
                      📍 {v.timeSlot} {v.propertyName}
                    </div>
                  ))}
                  {fus.map((f) => (
                    <div
                      key={f.id}
                      className="px-1.5 py-0.5 rounded bg-[#A37432]/15 border border-[#A37432]/30 text-[#7A5520] text-[10px] truncate font-medium"
                      title={f.notes}
                    >
                      📞 {f.leadName}
                    </div>
                  ))}
                  {tks.map((t) => (
                    <div
                      key={t.id}
                      className="px-1.5 py-0.5 rounded bg-[#547A61]/10 border border-[#547A61]/20 text-[#547A61] text-[10px] truncate font-medium"
                      title={t.title}
                    >
                      ✓ {t.title}
                    </div>
                  ))}
                </div>

                <div className="text-[9px] text-[#6A5A44] text-right">
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
