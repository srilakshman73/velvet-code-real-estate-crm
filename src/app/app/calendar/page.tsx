'use client';

import React, { useState } from 'react';
import { useCRMStore } from '@/lib/store';
import { Appointment, AppointmentType, AppointmentStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal, Drawer } from '@/components/ui/Modal';
import { formatINR } from '@/lib/utils';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  CalendarCheck,
  Clock,
  MapPin,
  User,
  Building,
  Phone,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  AlertCircle,
  Video,
  Users,
  Compass,
} from 'lucide-react';

const APPOINTMENT_TYPES: { value: AppointmentType; label: string }[] = [
  { value: 'SITE_VISIT', label: 'Site Visit / Physical Tour' },
  { value: 'PROPERTY_VISIT', label: 'Property Viewing' },
  { value: 'MEETING', label: 'In-Person Consultation' },
  { value: 'CALL', label: 'Phone / Video Call' },
  { value: 'PROPERTY_DISCUSSION', label: 'Property Discussion & Negotiation' },
  { value: 'OTHER', label: 'Other Engagement' },
];

const APPOINTMENT_STATUSES: { value: AppointmentStatus; label: string }[] = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'RESCHEDULED', label: 'Rescheduled' },
];

const REMINDER_OPTIONS = [
  { value: 5, label: '5 minutes before' },
  { value: 10, label: '10 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
];

export default function CalendarPage() {
  const {
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    siteVisits,
    followUps,
    tasks,
    leads,
    clients,
    properties,
    users,
  } = useCRMStore();

  const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK' | 'DAY'>('MONTH');

  // Active view date: default to September 14, 2026 to showcase full mock data and upcoming appointments
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 14));

  // Modal / Drawer states
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSavingAppointment, setIsSavingAppointment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form state for scheduling
  const [appointmentForm, setAppointmentForm] = useState<{
    id?: string;
    title: string;
    appointmentType: AppointmentType;
    leadId: string;
    clientId: string;
    propertyId: string;
    assignedUserId: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    status: AppointmentStatus;
    reminderMinutes: number;
    description: string;
  }>({
    title: '',
    appointmentType: 'SITE_VISIT',
    leadId: '',
    clientId: '',
    propertyId: '',
    assignedUserId: users[0]?.id || '',
    date: '2026-09-15',
    startTime: '10:00',
    endTime: '11:00',
    location: 'Site Office, Emerald Heights',
    status: 'SCHEDULED',
    reminderMinutes: 15,
    description: '',
  });

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 8, 14));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Compute calendar days for Month view
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Convert Sunday=0 to Monday=0 (Mon=0, Tue=1, ..., Sun=6)
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const trailingDaysCount = startDayOfWeek;

  // Total grid cells (multiple of 7)
  const totalCells = Math.ceil((trailingDaysCount + daysInMonth) / 7) * 7;

  // Events helper by date formatted as YYYY-MM-DD
  const getEventsForDateString = (dateStr: string) => {
    const apts = appointments.filter((a) => a.startAt.startsWith(dateStr));
    const visits = siteVisits.filter((v) => v.visitDate === dateStr);
    const fus = followUps.filter((f) => f.scheduledAt.startsWith(dateStr));
    const tks = tasks.filter((t) => t.dueDate.startsWith(dateStr));
    return { apts, visits, fus, tks };
  };

  const openScheduleForDay = (dateStr: string) => {
    setAppointmentForm({
      title: 'Site Visit / Buyer Consultation',
      appointmentType: 'SITE_VISIT',
      leadId: '',
      clientId: '',
      propertyId: properties[0]?.id || '',
      assignedUserId: users[0]?.id || '',
      date: dateStr,
      startTime: '10:30',
      endTime: '11:30',
      location: properties[0] ? `${properties[0].locality}, ${properties[0].city}` : 'Main Office',
      status: 'SCHEDULED',
      reminderMinutes: 15,
      description: '',
    });
    setIsEditMode(false);
    setIsScheduleModalOpen(true);
  };

  const handleOpenDetail = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setIsDetailDrawerOpen(true);
  };

  const handleOpenEdit = (apt: Appointment) => {
    const startDate = new Date(apt.startAt);
    const endDate = new Date(apt.endAt);

    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    const dateStr = `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-${pad(startDate.getDate())}`;
    const startTimeStr = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
    const endTimeStr = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;

    setAppointmentForm({
      id: apt.id,
      title: apt.title,
      appointmentType: apt.appointmentType,
      leadId: apt.leadId || '',
      clientId: apt.clientId || '',
      propertyId: apt.propertyId || '',
      assignedUserId: apt.assignedUserId || users[0]?.id || '',
      date: dateStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      location: apt.location || '',
      status: apt.status,
      reminderMinutes: apt.reminderMinutes || 15,
      description: apt.description || '',
    });

    setIsEditMode(true);
    setIsDetailDrawerOpen(false);
    setIsScheduleModalOpen(true);
  };

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAppointment(true);

    try {
      const startIso = `${appointmentForm.date}T${appointmentForm.startTime}:00`;
      const endIso = `${appointmentForm.date}T${appointmentForm.endTime}:00`;

      const lead = leads.find((l) => l.id === appointmentForm.leadId);
      const client = clients.find((c) => c.id === appointmentForm.clientId);
      const prop = properties.find((p) => p.id === appointmentForm.propertyId);
      const user = users.find((u) => u.id === appointmentForm.assignedUserId);

      if (isEditMode && appointmentForm.id) {
        await updateAppointment(appointmentForm.id, {
          title: appointmentForm.title,
          appointmentType: appointmentForm.appointmentType,
          leadId: appointmentForm.leadId || undefined,
          leadName: lead?.name,
          clientId: appointmentForm.clientId || undefined,
          clientName: client?.name,
          propertyId: appointmentForm.propertyId || undefined,
          propertyTitle: prop?.title,
          assignedUserId: appointmentForm.assignedUserId || undefined,
          assignedUserName: user?.name,
          startAt: new Date(startIso).toISOString(),
          endAt: new Date(endIso).toISOString(),
          location: appointmentForm.location || undefined,
          status: appointmentForm.status,
          reminderMinutes: Number(appointmentForm.reminderMinutes),
          description: appointmentForm.description || undefined,
        });
      } else {
        await addAppointment({
          title: appointmentForm.title,
          appointmentType: appointmentForm.appointmentType,
          leadId: appointmentForm.leadId || undefined,
          leadName: lead?.name,
          clientId: appointmentForm.clientId || undefined,
          clientName: client?.name,
          propertyId: appointmentForm.propertyId || undefined,
          propertyTitle: prop?.title,
          assignedUserId: appointmentForm.assignedUserId || undefined,
          assignedUserName: user?.name,
          startAt: new Date(startIso).toISOString(),
          endAt: new Date(endIso).toISOString(),
          location: appointmentForm.location || undefined,
          status: appointmentForm.status,
          reminderMinutes: Number(appointmentForm.reminderMinutes),
          description: appointmentForm.description || undefined,
        });
      }

      setIsScheduleModalOpen(false);
    } catch (err: any) {
      alert(`Failed to save appointment: ${err.message}`);
    } finally {
      setIsSavingAppointment(false);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (confirm('Are you sure you want to cancel and delete this appointment?')) {
      await deleteAppointment(id);
      setIsDetailDrawerOpen(false);
      setSelectedAppointment(null);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
    await updateAppointment(id, { status: newStatus });
    if (selectedAppointment && selectedAppointment.id === id) {
      setSelectedAppointment({ ...selectedAppointment, status: newStatus });
    }
  };

  // Helper for appointment type colors & badges
  const getAppointmentTypeBadge = (type: AppointmentType) => {
    switch (type) {
      case 'SITE_VISIT':
        return { label: 'Site Visit', bg: 'bg-[#B86B84]/15', text: 'text-[#8C455C]', border: 'border-[#B86B84]/30' };
      case 'PROPERTY_VISIT':
        return { label: 'Viewing', bg: 'bg-[#4A7C59]/15', text: 'text-[#4A7C59]', border: 'border-[#4A7C59]/30' };
      case 'MEETING':
        return { label: 'Meeting', bg: 'bg-[#6B5B95]/15', text: 'text-[#6B5B95]', border: 'border-[#6B5B95]/30' };
      case 'CALL':
        return { label: 'Phone Call', bg: 'bg-[#D98FA5]/25', text: 'text-[#8C455C]', border: 'border-[#D98FA5]/40' };
      default:
        return { label: 'Consultation', bg: 'bg-[#B86B84]/10', text: 'text-[#8C455C]', border: 'border-[#B86B84]/20' };
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#FCECEF] text-[#3A2930]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A2930] tracking-tight">
              Real Estate Activity &amp; Appointment Calendar
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-[#B86B84]/15 text-[#8C455C] border border-[#B86B84]/30 rounded-full">
              {appointments.length} Appointments Scheduled
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#765D66] mt-1">
            Manage site viewings, buyer consultations, client video calls, and property negotiation schedules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="gold"
            size="sm"
            onClick={() => {
              const pad = (n: number) => (n < 10 ? `0${n}` : n);
              const todayStr = `${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}-${pad(currentDate.getDate())}`;
              openScheduleForDay(todayStr);
            }}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Schedule Appointment
          </Button>

          <div className="bg-[#FFF9FA] border border-[#EBCBD4] p-1 rounded-xl flex text-xs shadow-xs">
            <button
              onClick={() => setViewMode('MONTH')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === 'MONTH'
                  ? 'bg-[#B86B84] text-white font-semibold shadow-xs'
                  : 'text-[#765D66] hover:text-[#3A2930]'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('WEEK')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === 'WEEK'
                  ? 'bg-[#B86B84] text-white font-semibold shadow-xs'
                  : 'text-[#765D66] hover:text-[#3A2930]'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('DAY')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === 'DAY'
                  ? 'bg-[#B86B84] text-white font-semibold shadow-xs'
                  : 'text-[#765D66] hover:text-[#3A2930]'
              }`}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Controls & View Header */}
      <div className="rounded-2xl border border-[#EBCBD4] bg-[#FFF9FA] p-4 sm:p-6 shadow-[0_8px_24px_rgba(120,90,40,0.08)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBCBD4]">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-serif font-bold text-[#3A2930]">{monthName}</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-[#FFF5F7] text-[#765D66] hover:text-[#3A2930] transition-colors border border-[#EBCBD4] cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-[#FFF5F7] text-[#765D66] hover:text-[#3A2930] transition-colors border border-[#EBCBD4] cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <Button variant="secondary" size="xs" onClick={handleToday} className="ml-1">
                Today
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[#8C455C] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B86B84]" /> Appointments
            </span>
            <span className="flex items-center gap-1.5 text-[#D98FA5] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D98FA5]" /> Site Visits
            </span>
            <span className="flex items-center gap-1.5 text-[#4A7C59] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4A7C59]" /> Tasks
            </span>
          </div>
        </div>

        {/* 1. MONTH VIEW */}
        {viewMode === 'MONTH' && (
          <div>
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#765D66] uppercase tracking-wider pb-2 border-b border-[#EBCBD4]">
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
              {Array.from({ length: totalCells }).map((_, index) => {
                const cellDayNumber = index - trailingDaysCount + 1;
                const isCurrentMonthDay = cellDayNumber > 0 && cellDayNumber <= daysInMonth;

                let dayDisplay = cellDayNumber;
                let dayDate = new Date(year, month, cellDayNumber);

                if (cellDayNumber <= 0) {
                  dayDisplay = prevMonthLastDay + cellDayNumber;
                  dayDate = new Date(year, month - 1, dayDisplay);
                } else if (cellDayNumber > daysInMonth) {
                  dayDisplay = cellDayNumber - daysInMonth;
                  dayDate = new Date(year, month + 1, dayDisplay);
                }

                const pad = (n: number) => (n < 10 ? `0${n}` : n);
                const dayStr = `${dayDate.getFullYear()}-${pad(dayDate.getMonth() + 1)}-${pad(dayDisplay)}`;
                const { apts, visits, fus, tks } = getEventsForDateString(dayStr);
                const isSelected = dayDate.toDateString() === currentDate.toDateString();

                return (
                  <div
                    key={index}
                    onClick={() => isCurrentMonthDay && setCurrentDate(dayDate)}
                    className={`min-h-[110px] p-2 rounded-xl border flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-[#B86B84]/15 border-[#B86B84] shadow-sm ring-1 ring-[#B86B84]'
                        : isCurrentMonthDay
                        ? 'bg-[#FFF9FA] border-[#EBCBD4] hover:border-[#B86B84]/60'
                        : 'bg-[#FFF9FA]/40 border-[#EBCBD4]/40 opacity-40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                          isSelected ? 'bg-[#B86B84] text-white font-extrabold' : 'text-[#3A2930]'
                        }`}
                      >
                        {dayDisplay}
                      </span>
                      {isCurrentMonthDay && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openScheduleForDay(dayStr);
                          }}
                          className="text-[#9B828C] hover:text-[#8C455C] p-0.5 rounded transition-colors"
                          title="Schedule on this day"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1 my-1 overflow-hidden">
                      {/* Real Appointments */}
                      {apts.map((apt) => (
                        <div
                          key={apt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(apt);
                          }}
                          className="px-1.5 py-0.5 rounded bg-[#B86B84]/20 border border-[#B86B84]/40 text-[#8C455C] text-[10px] truncate font-bold cursor-pointer hover:bg-[#B86B84]/30 transition-colors flex items-center gap-1"
                          title={`${apt.title} (${apt.status})`}
                        >
                          <CalendarCheck className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{apt.title}</span>
                        </div>
                      ))}

                      {/* Site Visits */}
                      {visits.map((v) => (
                        <div
                          key={v.id}
                          className="px-1.5 py-0.5 rounded bg-[#D98FA5]/15 border border-[#D98FA5]/30 text-[#8C455C] text-[10px] truncate font-medium flex items-center gap-1"
                          title={v.propertyName}
                        >
                          <Compass className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{v.timeSlot} {v.propertyName}</span>
                        </div>
                      ))}

                      {/* Tasks */}
                      {tks.map((t) => (
                        <div
                          key={t.id}
                          className="px-1.5 py-0.5 rounded bg-[#4A7C59]/10 border border-[#4A7C59]/20 text-[#4A7C59] text-[10px] truncate font-medium flex items-center gap-1"
                          title={t.title}
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{t.title}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[9px] text-[#765D66] text-right font-medium">
                      {apts.length + visits.length + fus.length + tks.length > 0 &&
                        `${apts.length + visits.length + fus.length + tks.length} events`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. WEEK VIEW */}
        {viewMode === 'WEEK' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, i) => {
                const dayOffset = (i - ((currentDate.getDay() + 6) % 7));
                const weekDay = new Date(currentDate);
                weekDay.setDate(currentDate.getDate() + dayOffset);

                const pad = (n: number) => (n < 10 ? `0${n}` : n);
                const dayStr = `${weekDay.getFullYear()}-${pad(weekDay.getMonth() + 1)}-${pad(weekDay.getDate())}`;
                const { apts, visits, tks } = getEventsForDateString(dayStr);
                const isSelected = weekDay.toDateString() === currentDate.toDateString();

                return (
                  <div
                    key={i}
                    onClick={() => setCurrentDate(weekDay)}
                    className={`p-3 rounded-2xl border flex flex-col justify-between space-y-3 min-h-[350px] transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#B86B84]/15 border-[#B86B84] shadow-md ring-1 ring-[#B86B84]'
                        : 'bg-[#FFF9FA] border-[#EBCBD4] hover:border-[#B86B84]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-[#EBCBD4] pb-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#765D66]">
                          {weekDay.toLocaleDateString('default', { weekday: 'short' })}
                        </p>
                        <p className="text-base font-bold font-serif text-[#3A2930]">
                          {weekDay.getDate()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openScheduleForDay(dayStr);
                        }}
                        className="text-[#8C455C] hover:bg-[#B86B84]/20 p-1 rounded-md"
                        title="Add appointment"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 flex-1 overflow-y-auto">
                      {apts.length === 0 && visits.length === 0 && tks.length === 0 ? (
                        <p className="text-[11px] text-[#9B828C] italic text-center py-4">
                          No events
                        </p>
                      ) : (
                        <>
                          {apts.map((a) => (
                            <div
                              key={a.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetail(a);
                              }}
                              className="p-2 rounded-xl bg-[#FFF5F7] border border-[#B86B84]/40 hover:bg-[#B86B84]/15 transition-colors space-y-1"
                            >
                              <div className="flex items-center justify-between text-[10px] font-bold text-[#8C455C]">
                                <span>{new Date(a.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span>{a.appointmentType}</span>
                              </div>
                              <p className="text-xs font-bold text-[#3A2930] line-clamp-1">{a.title}</p>
                              {a.location && (
                                <p className="text-[10px] text-[#765D66] truncate flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-[#B86B84]" /> {a.location}
                                </p>
                              )}
                            </div>
                          ))}

                          {visits.map((v) => (
                            <div
                              key={v.id}
                              className="p-2 rounded-xl bg-[#D98FA5]/15 border border-[#D98FA5]/30 space-y-0.5 text-xs text-[#8C455C]"
                            >
                              <span className="text-[10px] font-bold">Site Visit: {v.timeSlot}</span>
                              <p className="font-semibold line-clamp-1">{v.propertyName}</p>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. DAY VIEW */}
        {viewMode === 'DAY' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#FFF5F7] border border-[#EBCBD4] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#8C455C]">
                  Day Schedule
                </span>
                <h3 className="text-xl font-serif font-bold text-[#3A2930] mt-0.5">
                  {currentDate.toLocaleDateString('default', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
              </div>
              <Button
                variant="gold"
                size="sm"
                onClick={() => {
                  const pad = (n: number) => (n < 10 ? `0${n}` : n);
                  const dayStr = `${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}-${pad(currentDate.getDate())}`;
                  openScheduleForDay(dayStr);
                }}
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Schedule Appointment for this Day
              </Button>
            </div>

            {(() => {
              const pad = (n: number) => (n < 10 ? `0${n}` : n);
              const dayStr = `${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}-${pad(currentDate.getDate())}`;
              const { apts, visits, tks } = getEventsForDateString(dayStr);

              if (apts.length === 0 && visits.length === 0 && tks.length === 0) {
                return (
                  <div className="p-12 text-center text-[#765D66] bg-[#FFF5F7] rounded-2xl border border-[#EBCBD4] space-y-3">
                    <CalendarCheck className="w-10 h-10 text-[#B86B84] mx-auto" />
                    <h4 className="font-serif font-bold text-base text-[#3A2930]">
                      No events scheduled for this day
                    </h4>
                    <p className="text-xs max-w-sm mx-auto">
                      Use the &quot;Schedule Appointment&quot; button above to book property viewings, client calls, or site visits.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {apts.map((a) => {
                    const badge = getAppointmentTypeBadge(a.appointmentType);
                    return (
                      <div
                        key={a.id}
                        onClick={() => handleOpenDetail(a)}
                        className="p-5 rounded-2xl bg-[#FFF9FA] border border-[#EBCBD4] hover:border-[#B86B84] shadow-xs cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}>
                              {badge.label}
                            </span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                              a.status === 'COMPLETED'
                                ? 'bg-[#4A7C59]/15 text-[#4A7C59]'
                                : a.status === 'CANCELLED'
                                ? 'bg-[#A84355]/15 text-[#A84355]'
                                : 'bg-[#B86B84]/15 text-[#8C455C]'
                            }`}>
                              {a.status}
                            </span>
                          </div>

                          <h4 className="text-base font-bold font-serif text-[#3A2930] group-hover:text-[#8C455C] transition-colors">
                            {a.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-[#765D66]">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3.5 h-3.5 text-[#B86B84]" />
                              {new Date(a.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(a.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {a.leadName && (
                              <span className="flex items-center gap-1 font-medium text-[#3A2930]">
                                <User className="w-3.5 h-3.5 text-[#B86B84]" />
                                Lead: {a.leadName}
                              </span>
                            )}
                            {a.clientName && (
                              <span className="flex items-center gap-1 font-medium text-[#3A2930]">
                                <User className="w-3.5 h-3.5 text-[#4A7C59]" />
                                Client: {a.clientName}
                              </span>
                            )}
                            {a.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-[#B86B84]" />
                                {a.location}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(a);
                            }}
                            leftIcon={<Edit2 className="w-3 h-3" />}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAppointment(a.id);
                            }}
                            leftIcon={<Trash2 className="w-3 h-3" />}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* APPOINTMENT SCHEDULING / EDIT MODAL */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={isEditMode ? 'Edit Scheduled Appointment' : 'Schedule New CRM Appointment'}
        description="Book a client site visit, consultation, or call with automated pop-up reminders."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveAppointment} className="space-y-4 text-xs sm:text-sm">
          <Input
            label="Appointment Title *"
            required
            placeholder="e.g. Luxury 3BHK Site Inspection with Ramesh Balaji"
            value={appointmentForm.title}
            onChange={(e) => setAppointmentForm({ ...appointmentForm, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Appointment Type *"
              value={appointmentForm.appointmentType}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  appointmentType: e.target.value as AppointmentType,
                })
              }
              options={APPOINTMENT_TYPES}
            />

            <Select
              label="Appointment Status"
              value={appointmentForm.status}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  status: e.target.value as AppointmentStatus,
                })
              }
              options={APPOINTMENT_STATUSES}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Date *"
              type="date"
              required
              value={appointmentForm.date}
              onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
            />
            <Input
              label="Start Time *"
              type="time"
              required
              value={appointmentForm.startTime}
              onChange={(e) => setAppointmentForm({ ...appointmentForm, startTime: e.target.value })}
            />
            <Input
              label="End Time *"
              type="time"
              required
              value={appointmentForm.endTime}
              onChange={(e) => setAppointmentForm({ ...appointmentForm, endTime: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Associate with Lead (Optional)"
              value={appointmentForm.leadId}
              onChange={(e) => {
                const leadId = e.target.value;
                const lead = leads.find((l) => l.id === leadId);
                setAppointmentForm({
                  ...appointmentForm,
                  leadId,
                  propertyId: lead?.interestedPropertyId || appointmentForm.propertyId,
                });
              }}
            >
              <option value="">None (General Event)</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.phone})
                </option>
              ))}
            </Select>

            <Select
              label="Associate with Client (Optional)"
              value={appointmentForm.clientId}
              onChange={(e) =>
                setAppointmentForm({ ...appointmentForm, clientId: e.target.value })
              }
            >
              <option value="">None</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Interested Property"
              value={appointmentForm.propertyId}
              onChange={(e) =>
                setAppointmentForm({ ...appointmentForm, propertyId: e.target.value })
              }
            >
              <option value="">Select property...</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.locality})
                </option>
              ))}
            </Select>

            <Select
              label="Assigned Real Estate Consultant *"
              value={appointmentForm.assignedUserId}
              onChange={(e) =>
                setAppointmentForm({ ...appointmentForm, assignedUserId: e.target.value })
              }
              options={users.map((u) => ({
                value: u.id,
                label: `${u.name} (${u.role})`,
              }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location / Meeting Link"
              placeholder="e.g. Site Office, Emerald Heights or Google Meet URL"
              value={appointmentForm.location}
              onChange={(e) =>
                setAppointmentForm({ ...appointmentForm, location: e.target.value })
              }
            />

            <Select
              label="Pop-up Reminder Alert"
              value={String(appointmentForm.reminderMinutes)}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  reminderMinutes: Number(e.target.value),
                })
              }
              options={REMINDER_OPTIONS}
            />
          </div>

          <Textarea
            label="Consultation Agenda / Notes"
            rows={3}
            placeholder="Key discussion points, floor plans to share, payment schedule..."
            value={appointmentForm.description}
            onChange={(e) =>
              setAppointmentForm({ ...appointmentForm, description: e.target.value })
            }
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EBCBD4]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsScheduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              size="md"
              className="font-bold"
              disabled={isSavingAppointment}
            >
              {isSavingAppointment
                ? 'Saving...'
                : isEditMode
                ? 'Update Appointment'
                : 'Confirm & Schedule'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* APPOINTMENT DETAIL DRAWER */}
      {selectedAppointment && (
        <Drawer
          isOpen={isDetailDrawerOpen}
          onClose={() => setIsDetailDrawerOpen(false)}
          title={selectedAppointment.title}
          subtitle={`Appointment ID: ${selectedAppointment.id}`}
        >
          <div className="space-y-6 text-xs sm:text-sm">
            {/* Status & Quick Change */}
            <div className="p-4 rounded-xl bg-[#FFF9FA] border border-[#EBCBD4] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#765D66] uppercase tracking-wider">
                  Current Status
                </span>
                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    selectedAppointment.status === 'COMPLETED'
                      ? 'bg-[#4A7C59]/15 text-[#4A7C59] border border-[#4A7C59]/30'
                      : selectedAppointment.status === 'CANCELLED'
                      ? 'bg-[#A84355]/15 text-[#A84355] border border-[#A84355]/30'
                      : 'bg-[#B86B84]/15 text-[#8C455C] border border-[#B86B84]/30'
                  }`}
                >
                  {selectedAppointment.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#EBCBD4]">
                <button
                  onClick={() => handleUpdateStatus(selectedAppointment.id, 'CONFIRMED')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#4A7C59]/10 text-[#4A7C59] hover:bg-[#4A7C59]/20 transition-colors"
                >
                  Mark Confirmed
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedAppointment.id, 'COMPLETED')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#4A7C59] text-white hover:opacity-90 transition-opacity"
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedAppointment.id, 'CANCELLED')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#A84355]/10 text-[#A84355] hover:bg-[#A84355]/20 transition-colors"
                >
                  Mark Cancelled
                </button>
              </div>
            </div>

            {/* Date & Time */}
            <div className="p-4 rounded-xl bg-[#FFF5F7] border border-[#EBCBD4] space-y-2">
              <h4 className="font-bold text-[#8C455C] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Date &amp; Timing
              </h4>
              <p className="text-sm font-bold text-[#3A2930]">
                {new Date(selectedAppointment.startAt).toLocaleDateString('default', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-xs text-[#765D66] font-mono">
                {new Date(selectedAppointment.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                {new Date(selectedAppointment.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-[11px] text-[#8C455C] pt-1">
                Reminder notification scheduled {selectedAppointment.reminderMinutes || 15} minutes before.
              </p>
            </div>

            {/* Location */}
            {selectedAppointment.location && (
              <div className="p-4 rounded-xl bg-[#FFF9FA] border border-[#EBCBD4] space-y-1.5">
                <h4 className="font-bold text-[#8C455C] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Location / Venue
                </h4>
                <p className="text-xs text-[#3A2930] font-medium">{selectedAppointment.location}</p>
              </div>
            )}

            {/* Associated Entities */}
            <div className="p-4 rounded-xl bg-[#FFF9FA] border border-[#EBCBD4] space-y-3">
              <h4 className="font-bold text-[#8C455C] text-xs uppercase tracking-wider">
                Associated CRM Contacts &amp; Units
              </h4>
              <div className="space-y-2 text-xs">
                {selectedAppointment.leadName && (
                  <div className="flex justify-between border-b border-[#EBCBD4] pb-1.5">
                    <span className="text-[#765D66]">Lead:</span>
                    <span className="font-bold text-[#3A2930]">{selectedAppointment.leadName}</span>
                  </div>
                )}
                {selectedAppointment.clientName && (
                  <div className="flex justify-between border-b border-[#EBCBD4] pb-1.5">
                    <span className="text-[#765D66]">Client:</span>
                    <span className="font-bold text-[#3A2930]">{selectedAppointment.clientName}</span>
                  </div>
                )}
                {selectedAppointment.propertyTitle && (
                  <div className="flex justify-between border-b border-[#EBCBD4] pb-1.5">
                    <span className="text-[#765D66]">Property:</span>
                    <span className="font-bold text-[#3A2930]">{selectedAppointment.propertyTitle}</span>
                  </div>
                )}
                {selectedAppointment.assignedUserName && (
                  <div className="flex justify-between">
                    <span className="text-[#765D66]">Assigned Agent:</span>
                    <span className="font-bold text-[#3A2930]">{selectedAppointment.assignedUserName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {selectedAppointment.description && (
              <div className="p-4 rounded-xl bg-[#FFF9FA] border border-[#EBCBD4] space-y-1.5">
                <h4 className="font-bold text-[#8C455C] text-xs uppercase tracking-wider">
                  Notes &amp; Agenda
                </h4>
                <p className="text-xs text-[#765D66] bg-[#FFF5F7] p-3 rounded-lg border border-[#EBCBD4] leading-relaxed">
                  {selectedAppointment.description}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-[#EBCBD4] flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpenEdit(selectedAppointment)}
                leftIcon={<Edit2 className="w-4 h-4" />}
              >
                Edit Specifications
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Delete Appointment
              </Button>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
}
