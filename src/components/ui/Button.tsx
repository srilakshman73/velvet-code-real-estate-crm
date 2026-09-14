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
      xs: 'px-2.5 py-1 text-xs rounded-md gap-1.5',
      sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-2',
      md: 'px-4 py-2 text-sm font-medium rounded-lg gap-2',
      lg: 'px-6 py-2.5 text-base font-semibold rounded-xl gap-2.5',
    };

    const variantClasses = {
      gold: 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black font-semibold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:brightness-105 active:scale-[0.99] border border-amber-300/40 transition-all duration-200',
      primary: 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black font-semibold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:brightness-105 active:scale-[0.99] border border-amber-300/40 transition-all duration-200',
      secondary:
        'bg-zinc-800/90 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/80 shadow-sm active:scale-[0.99] transition-all',
      outline:
        'bg-transparent hover:bg-amber-500/10 text-amber-300 border border-amber-500/40 hover:border-amber-400 active:scale-[0.99] transition-all',
      subtle:
        'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:text-white transition-all',
      ghost:
        'bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors',
      danger:
        'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/20 transition-all',
      emerald:
        'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 font-medium transition-all',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none transition-all outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
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
