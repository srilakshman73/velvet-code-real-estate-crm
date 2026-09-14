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
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'VISIT':
        return <CalendarCheck className="w-4 h-4 text-blue-400" />;
      case 'LEAD':
        return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'AI':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'BILLING':
        return <CreditCard className="w-4 h-4 text-rose-400" />;
      default:
        return <Bell className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Notifications
                </h3>
                <p className="text-xs text-zinc-400">
                  {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-xs flex items-center gap-1"
                >
                  <CheckCheck className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium text-zinc-400">No notifications yet</p>
                <p className="text-xs text-zinc-500 mt-1">We will notify you when new leads or activities arrive.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    n.isRead
                      ? 'bg-zinc-900/40 border-zinc-800/60 opacity-75 hover:opacity-100 hover:bg-zinc-800/40'
                      : 'bg-zinc-900/90 border-amber-500/30 shadow-md hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 flex-shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-white truncate">
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-zinc-400 flex-shrink-0">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      {n.link && (
                        <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300">
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
          <div className="p-4 border-t border-zinc-800 bg-zinc-950/60">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
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
