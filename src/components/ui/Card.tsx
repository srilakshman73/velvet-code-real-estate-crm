import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gold-border' | 'interactive';
  orientation?: 'vertical' | 'horizontal';
}

export function Card({ className, variant = 'default', orientation, children, ...props }: CardProps) {
  const variantClasses = {
    default: 'bg-[#FFF9F0] border border-[#D8C7A5] aurum-card-shadow',
    glass: 'bg-[#FFF9F0]/90 backdrop-blur-md border border-[#D8C7A5] shadow-xs',
    'gold-border':
      'bg-[#FFF9F0] border border-[#A37432]/60 shadow-[0_4px_20px_-4px_rgba(163,116,50,0.12)]',
    interactive:
      'bg-[#FFF9F0] border border-[#D8C7A5] hover:border-[#A37432] hover:shadow-[0_10px_28px_-4px_rgba(163,116,50,0.14)] transition-all duration-200 cursor-pointer',
  };

  return (
    <div
      className={cn('rounded-2xl p-5 sm:p-6 text-[#2C241A]', variantClasses[variant], className)}
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
    <div className={cn('flex items-center justify-between pb-4 mb-4 border-b border-[#D8C7A5]', className)} {...props}>
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
      className={cn('text-base font-bold text-[#2C241A] tracking-tight flex items-center gap-2', className)}
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
    <p className={cn('text-xs text-[#6A5A44] mt-1', className)} {...props}>
      {children}
    </p>
  );
}
