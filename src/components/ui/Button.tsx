import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'emerald' | 'subtle';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'gold',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      icon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const effectiveLeftIcon = leftIcon || icon;
    const effectiveVariant = variant === 'primary' ? 'gold' : variant;

    const sizeClasses = {
      xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
      sm: 'px-3.5 py-1.5 text-xs font-semibold rounded-lg gap-2',
      md: 'px-4.5 py-2 text-sm font-semibold rounded-xl gap-2',
      lg: 'px-6 py-3 text-base font-semibold rounded-xl gap-2.5',
    };

    const variantClasses = {
      gold: 'bg-[#A374] hover:bg-[#8F642B] active:bg-[#7A5320] text-[#151515] font-bold border border-[#A374]/60 shadow-[0_4px_16px_-2px_rgba(163,116,0,0.25)] hover:shadow-[0_6px_20px_-2px_rgba(163,116,0,0.35)] transition-all duration-200',
      primary: 'bg-[#A374] hover:bg-[#8F642B] active:bg-[#7A5320] text-[#151515] font-bold border border-[#A374]/60 shadow-[0_4px_16px_-2px_rgba(163,116,0,0.25)] hover:shadow-[0_6px_20px_-2px_rgba(163,116,0,0.35)] transition-all duration-200',
      secondary:
        'bg-[#FFFCF6] hover:bg-[#EFE8DA] text-[#24211D] border border-[#DDD4C4] shadow-xs active:scale-[0.99] transition-all',
      subtle:
        'bg-[#EFE8DA] hover:bg-[#E5DDCB] text-[#24211D] border border-[#DDD4C4] transition-all',
      outline:
        'bg-transparent hover:bg-[#A374]/10 text-[#8F642B] border border-[#A374]/60 hover:border-[#8F642B] active:scale-[0.99] transition-all',
      ghost:
        'bg-transparent hover:bg-[#EFE8DA]/80 text-[#766F63] hover:text-[#24211D] transition-colors',
      danger:
        'bg-[#8B2635] hover:bg-[#731E2A] text-white shadow-xs transition-all',
      emerald:
        'bg-[#2E6B4F] hover:bg-[#24563F] text-white shadow-sm font-medium transition-all',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#A374] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F3EA]',
          sizeClasses[size],
          variantClasses[effectiveVariant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          effectiveLeftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
