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
      gold: 'bg-[#A374] hover:bg-[#B8893C] active:bg-[#7A5320] text-[#171613] font-bold border border-[#A374]/60 shadow-[0_4px_16px_-2px_rgba(163,116,0,0.25)] hover:shadow-[0_6px_20px_-2px_rgba(163,116,0,0.35)] transition-all duration-200',
      primary: 'bg-[#A374] hover:bg-[#B8893C] active:bg-[#7A5320] text-[#171613] font-bold border border-[#A374]/60 shadow-[0_4px_16px_-2px_rgba(163,116,0,0.25)] hover:shadow-[0_6px_20px_-2px_rgba(163,116,0,0.35)] transition-all duration-200',
      secondary:
        'bg-[#FFFDF8] hover:bg-[#EFE8DA] text-[#26231E] border border-[#DCD3C2] shadow-xs active:scale-[0.99] transition-all',
      subtle:
        'bg-[#EFE8DA] hover:bg-[#E2D8C6] text-[#26231E] border border-[#DCD3C2] transition-all',
      outline:
        'bg-transparent hover:bg-[#A374]/10 text-[#7A5320] border border-[#A374]/60 hover:border-[#B8893C] active:scale-[0.99] transition-all',
      ghost:
        'bg-transparent hover:bg-[#EFE8DA]/80 text-[#756E63] hover:text-[#26231E] transition-colors',
      danger:
        'bg-[#8B3D3D] hover:bg-[#722E2E] text-white shadow-xs transition-all',
      emerald:
        'bg-[#2F6B52] hover:bg-[#24543F] text-white shadow-sm font-medium transition-all',
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
