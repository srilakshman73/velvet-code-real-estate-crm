import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gold-border' | 'interactive';
  orientation?: 'vertical' | 'horizontal';
}

export function Card({ className, variant = 'default', orientation, children, ...props }: CardProps) {
  const variantClasses = {
    default: 'bg-[#FFFDF8] border border-[#DDD4C5] aurum-card-shadow',
    glass: 'bg-[#FFFDF8]/90 backdrop-blur-md border border-[#DDD4C5] shadow-xs',
    'gold-border':
      'bg-[#FFFDF8] border border-[#A374]/60 shadow-[0_4px_20px_-4px_rgba(163,116,0,0.12)]',
    interactive:
      'bg-[#FFFDF8] border border-[#DDD4C5] hover:border-[#A374] hover:shadow-[0_10px_28px_-4px_rgba(163,116,0,0.14)] transition-all duration-200 cursor-pointer',
  };

  return (
    <div
      className={cn('rounded-2xl p-5 sm:p-6 text-[#29251F]', variantClasses[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between pb-4 mb-4 border-b border-[#DDD4C5]/80', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-base font-bold text-[#29251F] tracking-tight flex items-center gap-2', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-[#756D61] mt-1', className)} {...props}>
      {children}
    </p>
  );
}
