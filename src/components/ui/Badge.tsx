import React from 'react';
import { cn } from '@/lib/utils';
import { LeadStatus, LeadPriority, DealStage, SiteVisitStatus, TaskPriority } from '@/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'gold'
    | 'rose'
    | 'emerald'
    | 'amber'
    | 'zinc'
    | 'charcoal'
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
    gold: 'bg-[#B86B84]/15 text-[#8C455C] border border-[#B86B84]/35',
    rose: 'bg-[#B86B84]/15 text-[#8C455C] border border-[#B86B84]/35',
    emerald: 'bg-[#4A7C59]/15 text-[#4A7C59] border border-[#4A7C59]/30',
    success: 'bg-[#4A7C59]/15 text-[#4A7C59] border border-[#4A7C59]/30',
    charcoal: 'bg-[#3A2930]/10 text-[#3A2930] border border-[#3A2930]/20',
    amber: 'bg-[#C07D38]/15 text-[#9E6020] border border-[#C07D38]/30',
    warning: 'bg-[#C07D38]/15 text-[#9E6020] border border-[#C07D38]/30',
    error: 'bg-[#A84355]/15 text-[#A84355] border border-[#A84355]/30',
    zinc: 'bg-[#FFF5F7] text-[#765D66] border border-[#EBCBD4]',
    neutral: 'bg-[#FFF5F7] text-[#765D66] border border-[#EBCBD4]',
    info: 'bg-[#F8DDE5] text-[#8C455C] border border-[#EBCBD4]',
    outline: 'bg-transparent text-[#765D66] border border-[#EBCBD4]',
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

export function LeadStatusBadge({ status }: { status: LeadStatus | string }) {
  const config: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    NEW: { label: 'New Lead', variant: 'neutral' },
    CONTACTED: { label: 'Contacted', variant: 'neutral' },
    QUALIFIED: { label: 'Qualified', variant: 'rose' },
    SITE_VISIT: { label: 'Site Visit', variant: 'amber' },
    NEGOTIATION: { label: 'Negotiation', variant: 'rose' },
    WON: { label: 'Won', variant: 'emerald' },
    LOST: { label: 'Lost', variant: 'error' },
  };

  const item = config[status] || { label: status, variant: 'neutral' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: LeadPriority | TaskPriority }) {
  const config: Record<LeadPriority, { label: string; variant: BadgeProps['variant'] }> = {
    LOW: { label: 'Low', variant: 'neutral' },
    MEDIUM: { label: 'Medium', variant: 'rose' },
    HIGH: { label: 'High', variant: 'amber' },
    URGENT: { label: 'Urgent', variant: 'error' },
  };

  const item = config[priority] || { label: priority, variant: 'neutral' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function DealStageBadge({ stage }: { stage: DealStage }) {
  const config: Record<DealStage, { label: string; variant: BadgeProps['variant'] }> = {
    NEW_LEAD: { label: 'New Lead', variant: 'neutral' },
    QUALIFIED: { label: 'Qualified', variant: 'rose' },
    SITE_VISIT: { label: 'Site Visit', variant: 'amber' },
    NEGOTIATION: { label: 'Negotiation', variant: 'rose' },
    DOCUMENTATION: { label: 'Documentation', variant: 'charcoal' },
    CLOSED_WON: { label: 'Closed Won ✨', variant: 'emerald' },
    CLOSED_LOST: { label: 'Closed Lost', variant: 'error' },
  };

  const item = config[stage] || { label: stage, variant: 'neutral' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function SiteVisitStatusBadge({ status }: { status: SiteVisitStatus }) {
  const config: Record<SiteVisitStatus, { label: string; variant: BadgeProps['variant'] }> = {
    SCHEDULED: { label: 'Scheduled', variant: 'rose' },
    CONFIRMED: { label: 'Confirmed', variant: 'emerald' },
    COMPLETED: { label: 'Completed', variant: 'emerald' },
    CANCELLED: { label: 'Cancelled', variant: 'error' },
    RESCHEDULED: { label: 'Rescheduled', variant: 'amber' },
  };

  const item = config[status] || { label: status, variant: 'neutral' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}
