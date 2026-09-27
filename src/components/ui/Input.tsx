import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, icon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const effectiveLeftIcon = leftIcon || icon;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs sm:text-sm font-semibold text-[#3A2930]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {effectiveLeftIcon && (
            <div className="absolute left-3 text-[#9B828C] pointer-events-none flex items-center">
              {effectiveLeftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full min-h-[44px] bg-[#FFFFFF] border border-[#EBCBD4] rounded-xl px-3.5 py-2 text-sm text-[#3A2930] placeholder:text-[#9B828C] outline-none transition-all duration-150',
              'focus:border-[#B86B84] focus:ring-2 focus:ring-[#B86B84]/20 focus:bg-[#FFFFFF]',
              effectiveLeftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-[#A84355] focus:border-[#A84355] focus:ring-[#A84355]/20',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-[#9B828C] pointer-events-none flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-[#A84355] font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#765D66]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-xs sm:text-sm font-semibold text-[#3A2930]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full min-h-[90px] bg-[#FFFFFF] border border-[#EBCBD4] rounded-xl p-3 text-sm text-[#3A2930] placeholder:text-[#9B828C] outline-none transition-all duration-150 resize-y',
            'focus:border-[#B86B84] focus:ring-2 focus:ring-[#B86B84]/20 focus:bg-[#FFFFFF]',
            error && 'border-[#A84355] focus:border-[#A84355] focus:ring-[#A84355]/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#A84355] font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#765D66]">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs sm:text-sm font-semibold text-[#3A2930]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full min-h-[44px] bg-[#FFFFFF] border border-[#EBCBD4] rounded-xl px-3.5 py-2 text-sm text-[#3A2930] outline-none transition-all duration-150',
            'focus:border-[#B86B84] focus:ring-2 focus:ring-[#B86B84]/20',
            error && 'border-[#A84355]',
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#FFF9FA] text-[#3A2930]">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="text-xs text-[#A84355] font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
