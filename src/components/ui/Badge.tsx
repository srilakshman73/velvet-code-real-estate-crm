import React from 'react';
import { cn } from '@/lib/utils';
import { LeadStatus, LeadPriority, DealStage, SiteVisitStatus, TaskPriority } from '@/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'gold'
    | 'emerald'
    | 'blue'
    | 'purple'
    | 'amber'
    | 'rose'
    | 'zinc'
    | 'outline'
    | 'success'
    | 'warning'
    | 'error'
    | 'neutral'
    | 'info';
  size?: 'xs' | 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'zinc',
  size = 'sm',
  children,
  ...props
}: BadgeProps) {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] font-medium rounded',
    sm: 'px-2 py-0.5 text-xs font-medium rounded-md',
    md: 'px-2.5 py-1 text-xs font-semibold rounded-md',
  };

  const variantClasses: Record<string, string> = {
    gold: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    blue: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    info: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    error: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    zinc: 'bg-zinc-800 text-zinc-300 border border-zinc-700/60',
    neutral: 'bg-zinc-800 text-zinc-300 border border-zinc-700/60',
    outline: 'bg-transparent text-zinc-400 border border-zinc-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 leading-none whitespace-nowrap',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const config: Record<LeadStatus, { label: string; variant: BadgeProps['variant'] }> = {
    NEW: { label: 'New Lead', variant: 'blue' },
    CONTACTED: { label: 'Contacted', variant: 'zinc' },
    QUALIFIED: { label: 'Qualified', variant: 'purple' },
    SITE_VISIT: { label: 'Site Visit', variant: 'amber' },
    NEGOTIATION: { label: 'Negotiation', variant: 'gold' },
    WON: { label: 'Won', variant: 'emerald' },
    LOST: { label: 'Lost', variant: 'rose' },
  };

  const item = config[status] || { label: status, variant: 'zinc' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: LeadPriority | TaskPriority }) {
  const config: Record<LeadPriority, { label: string; variant: BadgeProps['variant'] }> = {
    LOW: { label: 'Low', variant: 'zinc' },
    MEDIUM: { label: 'Medium', variant: 'blue' },
    HIGH: { label: 'High', variant: 'amber' },
    URGENT: { label: 'Urgent', variant: 'rose' },
  };

  const item = config[priority] || { label: priority, variant: 'zinc' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function DealStageBadge({ stage }: { stage: DealStage }) {
  const config: Record<DealStage, { label: string; variant: BadgeProps['variant'] }> = {
    NEW_LEAD: { label: 'New Lead', variant: 'zinc' },
    QUALIFIED: { label: 'Qualified', variant: 'blue' },
    SITE_VISIT: { label: 'Site Visit', variant: 'amber' },
    NEGOTIATION: { label: 'Negotiation', variant: 'purple' },
    DOCUMENTATION: { label: 'Documentation', variant: 'gold' },
    CLOSED_WON: { label: 'Closed Won 🎉', variant: 'emerald' },
    CLOSED_LOST: { label: 'Closed Lost', variant: 'rose' },
  };

  const item = config[stage] || { label: stage, variant: 'zinc' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function SiteVisitStatusBadge({ status }: { status: SiteVisitStatus }) {
  const config: Record<SiteVisitStatus, { label: string; variant: BadgeProps['variant'] }> = {
    SCHEDULED: { label: 'Scheduled', variant: 'blue' },
    CONFIRMED: { label: 'Confirmed', variant: 'gold' },
    COMPLETED: { label: 'Completed', variant: 'emerald' },
    CANCELLED: { label: 'Cancelled', variant: 'rose' },
    RESCHEDULED: { label: 'Rescheduled', variant: 'amber' },
  };

  const item = config[status] || { label: status, variant: 'zinc' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}
