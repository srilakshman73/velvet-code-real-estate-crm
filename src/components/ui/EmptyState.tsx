import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-[#FFFDF8] border border-[#D8CEBF] border-dashed aurum-card-shadow',
        className
      )}
    >
      <div className="p-4 rounded-2xl bg-[#F1ECE3] border border-[#D4C9B9] text-[#805B25] mb-4 shadow-xs">
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-[#29251F] tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#625B51] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="gold" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
