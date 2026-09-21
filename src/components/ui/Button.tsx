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
      gold: 'bg-[#A37432] hover:bg-[#8A5E25] active:bg-[#7A5520] text-[#FFF9F0] font-bold border border-[#A37432]/60 shadow-[0_4px_16px_-2px_rgba(163,116,50,0.22)] hover:shadow-[0_6px_20px_-2px_rgba(163,116,50,0.30)] transition-all duration-200',
      primary: 'bg-[#A37432] hover:bg-[#8A5E25] active:bg-[#7A5520] text-[#FFF9F0] font-bold border border-[#A37432]/60 shadow-[0_4px_16px_-2px_rgba(163,116,50,0.22)] hover:shadow-[0_6px_20px_-2px_rgba(163,116,50,0.30)] transition-all duration-200',
      secondary:
        'bg-[#F5EAD3] hover:bg-[#E9DFC8] text-[#4A3922] hover:text-[#2C241A] border border-[#CDB78F] shadow-2xs active:scale-[0.99] transition-all',
      subtle:
        'bg-[#EFE2C8] hover:bg-[#D8C7A5] text-[#2C241A] border border-[#D8C7A5] transition-all',
      outline:
        'bg-transparent hover:bg-[#A37432]/10 text-[#7A5520] border border-[#A37432]/60 hover:border-[#8A5E25] active:scale-[0.99] transition-all',
      ghost:
        'bg-transparent hover:bg-[#F4EAD7] text-[#8A7A63] hover:text-[#2C241A] transition-colors',
      danger:
        'bg-[#8B4A4A] hover:bg-[#723636] text-white shadow-xs transition-all',
      emerald:
        'bg-[#547A61] hover:bg-[#3D7258] text-white shadow-sm font-medium transition-all',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#A37432] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E9DFC8]',
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
