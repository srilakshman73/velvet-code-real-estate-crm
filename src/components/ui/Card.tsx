import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gold' | 'glass' | 'interactive' | 'flat' | 'dark' | 'rose';
  padded?: boolean;
  orientation?: string;
}

export function Card({
  className,
  variant = 'default',
  padded = true,
  orientation,
  children,
  ...props
}: CardProps) {
  const variantClasses = {
    default:
      'bg-[#FFF9F0] border border-[#D8C7A5] shadow-[0_4px_20px_rgba(163, 116, 50,0.06)] rounded-2xl text-[#2C241A]',
    rose:
      'bg-[#FFF9F0] border border-[#C39A5B]/50 shadow-[0_4px_24px_rgba(163, 116, 50,0.1)] rounded-2xl text-[#2C241A]',
    gold:
      'bg-[#FFF9F0] border border-[#C39A5B]/50 shadow-[0_4px_24px_rgba(163, 116, 50,0.1)] rounded-2xl text-[#2C241A]',
    glass:
      'bg-[#FFF9F0]/85 backdrop-blur-md border border-[#D8C7A5]/80 shadow-[0_8px_32px_rgba(163, 116, 50,0.08)] rounded-2xl text-[#2C241A]',
    interactive:
      'bg-[#FFF9F0] border border-[#D8C7A5] hover:border-[#C39A5B] hover:shadow-[0_8px_30px_rgba(163, 116, 50,0.12)] transition-all duration-200 cursor-pointer rounded-2xl text-[#2C241A]',
    flat:
      'bg-[#F4EAD7] border border-[#D8C7A5] rounded-2xl text-[#2C241A]',
    dark:
      'bg-[#1F1D19] border border-[#2D2A24] text-[#FFF9F0] shadow-xl rounded-2xl',
  };

  return (
    <div
      className={cn(
        'transition-colors',
        variantClasses[variant],
        padded && 'p-5 sm:p-6',
        className
      )}
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
    <div
      className={cn('flex items-center justify-between pb-4 border-b border-[#D8C7A5]/60 mb-4', className)}
      {...props}
    >
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
      className={cn('text-base sm:text-lg font-bold text-[#2C241A] tracking-tight flex items-center gap-2', className)}
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
    <p className={cn('text-xs sm:text-sm text-[#6A5A44] mt-1', className)} {...props}>
      {children}
    </p>
  );
}
