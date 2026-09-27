import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'rose' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'emerald' | 'subtle';
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
      variant = 'primary',
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
    const effectiveVariant = variant === 'gold' || variant === 'rose' ? 'primary' : variant;

    const sizeClasses = {
      xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5 min-h-[32px]',
      sm: 'px-3.5 py-1.5 text-xs font-semibold rounded-lg gap-2 min-h-[36px]',
      md: 'px-4.5 py-2.5 text-sm font-semibold rounded-xl gap-2 min-h-[44px]',
      lg: 'px-6 py-3.5 text-base font-semibold rounded-xl gap-2.5 min-h-[48px]',
    };

    const variantClasses = {
      primary:
        'bg-[#B86B84] hover:bg-[#9E546C] active:bg-[#8C455C] text-[#FFF9FA] font-bold border border-[#B86B84]/60 shadow-[0_4px_16px_-2px_rgba(184,107,132,0.30)] hover:shadow-[0_6px_20px_-2px_rgba(184,107,132,0.40)] transition-all duration-200',
      secondary:
        'bg-[#F8DDE5] hover:bg-[#F2DAE1] text-[#3A2930] hover:text-[#201519] border border-[#EBCBD4] shadow-2xs active:scale-[0.99] transition-all',
      subtle:
        'bg-[#FFF0F3] hover:bg-[#F8DDE5] text-[#3A2930] border border-[#EBCBD4] transition-all',
      outline:
        'bg-transparent hover:bg-[#B86B84]/10 text-[#B86B84] border border-[#B86B84]/60 hover:border-[#9E546C] active:scale-[0.99] transition-all',
      ghost:
        'bg-transparent hover:bg-[#FFF5F7] text-[#765D66] hover:text-[#3A2930] transition-colors',
      danger:
        'bg-[#A84355] hover:bg-[#8C3343] text-white shadow-xs transition-all',
      emerald:
        'bg-[#4A7C59] hover:bg-[#3B6648] text-white shadow-sm font-medium transition-all',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#B86B84] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FCECEF]',
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
