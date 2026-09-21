import React from 'react';
import { cn } from '@/lib/utils';
import { LeadStatus, LeadPriority, DealStage, SiteVisitStatus, TaskPriority } from '@/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'gold'
    | 'emerald'
    | 'amber'
    | 'rose'
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
    gold: 'bg-[#A374]/15 text-[#7A5720] border border-[#A374]/35',
    emerald: 'bg-[#3D7258]/15 text-[#3D7258] border border-[#3D7258]/30',
    success: 'bg-[#3D7258]/15 text-[#3D7258] border border-[#3D7258]/30',
    charcoal: 'bg-[#29251F]/10 text-[#29251F] border border-[#29251F]/20',
    amber: 'bg-[#A87932]/15 text-[#8A5612] border border-[#A87932]/30',
    warning: 'bg-[#A87932]/15 text-[#8A5612] border border-[#A87932]/30',
    rose: 'bg-[#8B4A4A]/15 text-[#8B4A4A] border border-[#8B4A4A]/30',
    error: 'bg-[#8B4A4A]/15 text-[#8B4A4A] border border-[#8B4A4A]/30',
    zinc: 'bg-[#ECE6DA] text-[#625B51] border border-[#DDD4C5]',
    neutral: 'bg-[#ECE6DA] text-[#625B51] border border-[#DDD4C5]',
    info: 'bg-[#D8C7A5]/25 text-[#7A5720] border border-[#D8C7A5]/40',
    outline: 'bg-transparent text-[#625B51] border border-[#DDD4C5]',
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
    NEW: { label: 'New Lead', variant: 'neutral' },
    CONTACTED: { label: 'Contacted', variant: 'neutral' },
    QUALIFIED: { label: 'Qualified', variant: 'gold' },
    SITE_VISIT: { label: 'Site Visit', variant: 'amber' },
    NEGOTIATION: { label: 'Negotiation', variant: 'gold' },
    WON: { label: 'Won', variant: 'emerald' },
    LOST: { label: 'Lost', variant: 'rose' },
  };

  const item = config[status] || { label: status, variant: 'neutral' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: LeadPriority | TaskPriority }) {
  const config: Record<LeadPriority, { label: string; variant: BadgeProps['variant'] }> = {
    LOW: { label: 'Low', variant: 'neutral' },
    MEDIUM: { label: 'Medium', variant: 'gold' },
    HIGH: { label: 'High', variant: 'amber' },
    URGENT: { label: 'Urgent', variant: 'rose' },
  };

  const item = config[priority] || { label: priority, variant: 'neutral' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function DealStageBadge({ stage }: { stage: DealStage }) {
  const config: Record<DealStage, { label: string; variant: BadgeProps['variant'] }> = {
    NEW_LEAD: { label: 'New Lead', variant: 'neutral' },
    QUALIFIED: { label: 'Qualified', variant: 'gold' },
    SITE_VISIT: { label: 'Site Visit', variant: 'amber' },
    NEGOTIATION: { label: 'Negotiation', variant: 'gold' },
    DOCUMENTATION: { label: 'Documentation', variant: 'charcoal' },
    CLOSED_WON: { label: 'Closed Won 🎉', variant: 'emerald' },
    CLOSED_LOST: { label: 'Closed Lost', variant: 'rose' },
  };

  const item = config[stage] || { label: stage, variant: 'neutral' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function SiteVisitStatusBadge({ status }: { status: SiteVisitStatus }) {
  const config: Record<SiteVisitStatus, { label: string; variant: BadgeProps['variant'] }> = {
    SCHEDULED: { label: 'Scheduled', variant: 'gold' },
    CONFIRMED: { label: 'Confirmed', variant: 'emerald' },
    COMPLETED: { label: 'Completed', variant: 'emerald' },
    CANCELLED: { label: 'Cancelled', variant: 'rose' },
    RESCHEDULED: { label: 'Rescheduled', variant: 'amber' },
  };

  const item = config[status] || { label: status, variant: 'neutral' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}
