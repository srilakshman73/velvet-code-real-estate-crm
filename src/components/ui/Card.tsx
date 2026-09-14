import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gold-border' | 'interactive';
  orientation?: 'vertical' | 'horizontal';
}

export function Card({ className, variant = 'default', orientation, children, ...props }: CardProps) {
  const variantClasses = {
    default: 'bg-zinc-900/90 border border-zinc-800/80 shadow-md',
    glass: 'bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-xl',
    'gold-border':
      'bg-zinc-900/95 border border-amber-500/30 shadow-xl shadow-amber-500/5',
    interactive:
      'bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200 cursor-pointer',
  };

  return (
    <div
      className={cn('rounded-xl p-5 text-zinc-100', variantClasses[variant], className)}
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
    <div className={cn('flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/60', className)} {...props}>
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
      className={cn('text-base font-semibold text-white tracking-tight flex items-center gap-2', className)}
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
    <p className={cn('text-xs text-zinc-400 mt-1', className)} {...props}>
      {children}
    </p>
  );
}
