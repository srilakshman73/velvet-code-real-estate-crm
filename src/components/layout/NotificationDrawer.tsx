'use client';

import React from 'react';
import Link from 'next/link';
import { useCRMStore } from '@/lib/store';
import { formatRelativeTime } from '@/lib/utils';
import {
  Bell,
  CheckCheck,
  MessageSquare,
  CalendarCheck,
  Trophy,
  Sparkles,
  CreditCard,
  X,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useCRMStore();

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'WHATSAPP':
        return <MessageSquare className="w-4 h-4 text-[#3D7258]" />;
      case 'VISIT':
        return <CalendarCheck className="w-4 h-4 text-[#A87932]" />;
      case 'LEAD':
        return <Trophy className="w-4 h-4 text-[#A374]" />;
      case 'AI':
        return <Sparkles className="w-4 h-4 text-[#7A5720]" />;
      case 'BILLING':
        return <CreditCard className="w-4 h-4 text-[#8B4A4A]" />;
      default:
        return <Bell className="w-4 h-4 text-[#A374]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2D261C]/25 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FFFDF8] border-l border-[#DDD4C5] shadow-2xl flex flex-col text-[#29251F]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#DDD4C5] bg-[#F8F5EE]/70">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#A374]/15 border border-[#A374]/30 text-[#7A5720]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#29251F] tracking-tight">
                  Notifications
                </h3>
                <p className="text-xs text-[#857C6E]">
                  {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg text-[#625B51] hover:text-[#29251F] hover:bg-[#ECE6DA] transition-colors text-xs flex items-center gap-1"
                >
                  <CheckCheck className="w-4 h-4 text-[#A374]" />
                  <span className="hidden sm:inline font-semibold">Mark read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#625B51] hover:text-[#29251F] hover:bg-[#ECE6DA] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-[#625B51]">
                <Bell className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#A374]" />
                <p className="text-sm font-bold text-[#29251F]">No notifications yet</p>
                <p className="text-xs text-[#625B51] mt-1">We will notify you when new leads or activities arrive.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    n.isRead
                      ? 'bg-[#F4F0E7]/50 border-[#DDD4C5]/60 opacity-80 hover:opacity-100 hover:bg-[#ECE6DA]'
                      : 'bg-[#FFFDF8] border-[#A374]/60 shadow-xs hover:border-[#A374]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-[#F4F0E7] border border-[#DDD4C5] flex-shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-[#29251F] truncate">
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-[#625B51] flex-shrink-0">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-[#625B51] mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      {n.link && (
                        <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#7A5720] hover:text-[#7A5720]">
                          <Link href={n.link} onClick={onClose} className="flex items-center gap-1">
                            View details <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#DDD4C5] bg-[#F8F5EE]">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-bold"
              onClick={() => {
                markAllNotificationsRead();
                onClose();
              }}
            >
              Clear & Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
