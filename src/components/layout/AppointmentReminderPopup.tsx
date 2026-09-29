'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCRMStore } from '@/lib/store';
import { Calendar, Clock, MapPin, User, Building, X, ExternalLink, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function AppointmentReminderPopup() {
  const router = useRouter();
  const { notifications, markNotificationRead, appointments } = useCRMStore();
  const [activeReminder, setActiveReminder] = useState<{
    id: string;
    title: string;
    clientName?: string;
    propertyTitle?: string;
    time?: string;
    location?: string;
    appointmentId?: string;
  } | null>(null);

  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    // 1. Look for unread APPOINTMENT notifications
    const appointmentNotif = notifications.find(
      (n) => n.type === 'APPOINTMENT' && !n.isRead && !dismissedIds.includes(n.id)
    );

    if (appointmentNotif) {
      setActiveReminder({
        id: appointmentNotif.id,
        title: appointmentNotif.title,
        clientName: appointmentNotif.metadata?.clientName || 'Valued Client',
        propertyTitle: appointmentNotif.metadata?.propertyTitle || 'Prime Property',
        time: appointmentNotif.metadata?.time || 'Scheduled Time',
        location: appointmentNotif.metadata?.location || 'Site Venue',
        appointmentId: appointmentNotif.relatedEntityId,
      });
      return;
    }

    // 2. Also check if any upcoming appointment is within reminder time (fallback/backup)
    const now = Date.now();
    const upcomingDue = appointments.find((apt) => {
      if (dismissedIds.includes(apt.id)) return false;
      const aptTime = new Date(apt.startAt).getTime();
      const reminderMs = (apt.reminderMinutes || 15) * 60 * 1000;
      // Due if within [reminderMs before appointment ... 1 hour after]
      return now >= aptTime - reminderMs && now <= aptTime + 60 * 60 * 1000;
    });

    if (upcomingDue) {
      setActiveReminder({
        id: upcomingDue.id,
        title: upcomingDue.title,
        clientName: upcomingDue.clientName || 'Valued Client',
        propertyTitle: upcomingDue.propertyTitle || 'Prime Property',
        time: new Date(upcomingDue.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: upcomingDue.location || 'Site Venue',
        appointmentId: upcomingDue.id,
      });
    } else {
      setActiveReminder(null);
    }
  }, [notifications, appointments, dismissedIds]);

  if (!activeReminder) return null;

  const handleDismiss = () => {
    if (activeReminder) {
      setDismissedIds((prev) => [...prev, activeReminder.id]);
      markNotificationRead(activeReminder.id);
      setActiveReminder(null);
    }
  };

  const handleView = () => {
    if (activeReminder) {
      markNotificationRead(activeReminder.id);
      setDismissedIds((prev) => [...prev, activeReminder.id]);
      setActiveReminder(null);
      router.push('/app/calendar');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#FFF9FA] border-2 border-[#B86B84] rounded-2xl shadow-2xl p-5 text-[#3A2930] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#EBCBD4]">
          <div className="flex items-center gap-2 text-[#8C455C]">
            <div className="p-1.5 rounded-lg bg-[#B86B84]/15 animate-pulse">
              <BellRing className="w-4 h-4 text-[#8C455C]" />
            </div>
            <h4 className="text-sm font-serif font-bold text-[#3A2930]">Upcoming Appointment</h4>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-[#FCECEF] text-[#765D66] hover:text-[#3A2930] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Details Grid */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#765D66] w-16">Client:</span>
            <span className="font-bold text-[#3A2930] flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#B86B84]" />
              {activeReminder.clientName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#765D66] w-16">Property:</span>
            <span className="font-bold text-[#3A2930] flex items-center gap-1 truncate">
              <Building className="w-3.5 h-3.5 text-[#B86B84]" />
              {activeReminder.propertyTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#765D66] w-16">Time:</span>
            <span className="font-bold text-[#3A2930] flex items-center gap-1 text-[#4A7C59]">
              <Clock className="w-3.5 h-3.5 text-[#4A7C59]" />
              {activeReminder.time}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#765D66] w-16">Location:</span>
            <span className="font-medium text-[#3A2930] flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#B86B84]" />
              {activeReminder.location}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            type="button"
            variant="gold"
            size="xs"
            className="flex-1 text-xs font-bold"
            onClick={handleView}
            leftIcon={<ExternalLink className="w-3 h-3" />}
          >
            View Appointment
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="text-xs"
            onClick={handleDismiss}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
