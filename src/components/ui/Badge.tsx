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
    xs: 'px-1.5 py-0.5 text-[10px] font-semibold rounded',
    sm: 'px-2 py-0.5 text-xs font-semibold rounded-md',
    md: 'px-2.5 py-1 text-xs font-bold rounded-md',
  };

  const variantClasses: Record<string, string> = {
    gold: 'bg-[#A374]/15 text-[#7A5320] border border-[#A374]/40',
    emerald: 'bg-[#2E6B4F]/15 text-[#2E6B4F] border border-[#2E6B4F]/35',
    success: 'bg-[#2E6B4F]/15 text-[#2E6B4F] border border-[#2E6B4F]/35',
    blue: 'bg-[#3D5A80]/15 text-[#293E58] border border-[#3D5A80]/30',
    info: 'bg-[#3D5A80]/15 text-[#293E58] border border-[#3D5A80]/30',
    purple: 'bg-[#6B5B95]/15 text-[#524474] border border-[#6B5B95]/30',
    amber: 'bg-[#B87B28]/15 text-[#8A5612] border border-[#B87B28]/35',
    warning: 'bg-[#B87B28]/15 text-[#8A5612] border border-[#B87B28]/35',
    rose: 'bg-[#8B2635]/15 text-[#8B2635] border border-[#8B2635]/30',
    error: 'bg-[#8B2635]/15 text-[#8B2635] border border-[#8B2635]/30',
    zinc: 'bg-[#EFE8DA] text-[#766F63] border border-[#DDD4C4]',
    neutral: 'bg-[#EFE8DA] text-[#766F63] border border-[#DDD4C4]',
    outline: 'bg-transparent text-[#766F63] border border-[#DDD4C4]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 leading-none whitespace-nowrap select-none',
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
