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
      'bg-[#FFF9FA] border border-[#EBCBD4] shadow-[0_4px_20px_rgba(184,107,132,0.06)] rounded-2xl text-[#3A2930]',
    rose:
      'bg-[#FFF9FA] border border-[#D98FA5]/50 shadow-[0_4px_24px_rgba(184,107,132,0.1)] rounded-2xl text-[#3A2930]',
    gold:
      'bg-[#FFF9FA] border border-[#D98FA5]/50 shadow-[0_4px_24px_rgba(184,107,132,0.1)] rounded-2xl text-[#3A2930]',
    glass:
      'bg-[#FFF9FA]/85 backdrop-blur-md border border-[#EBCBD4]/80 shadow-[0_8px_32px_rgba(184,107,132,0.08)] rounded-2xl text-[#3A2930]',
    interactive:
      'bg-[#FFF9FA] border border-[#EBCBD4] hover:border-[#D98FA5] hover:shadow-[0_8px_30px_rgba(184,107,132,0.12)] transition-all duration-200 cursor-pointer rounded-2xl text-[#3A2930]',
    flat:
      'bg-[#FFF5F7] border border-[#EBCBD4] rounded-2xl text-[#3A2930]',
    dark:
      'bg-[#2A1820] border border-[#422633] text-[#FFF9FA] shadow-xl rounded-2xl',
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
      className={cn('flex items-center justify-between pb-4 border-b border-[#EBCBD4]/60 mb-4', className)}
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
      className={cn('text-base sm:text-lg font-bold text-[#3A2930] tracking-tight flex items-center gap-2', className)}
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
    <p className={cn('text-xs sm:text-sm text-[#765D66] mt-1', className)} {...props}>
      {children}
    </p>
  );
}
