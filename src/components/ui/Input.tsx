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
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-[#29251F] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {effectiveLeftIcon && (
            <div className="absolute left-3 text-[#81786A] pointer-events-none flex items-center">
              {effectiveLeftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full bg-[#FFFDF8] border border-[#D8CEBF] rounded-xl px-3.5 py-2 text-sm text-[#29251F] placeholder:text-[#81786A] transition-colors focus:border-[#A374] focus:ring-1 focus:ring-[#A374]/30 outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs',
              effectiveLeftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'border-[#8B4A4A] focus:border-[#8B4A4A] focus:ring-[#8B4A4A]/20',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-[#81786A] flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-[#8B4A4A] font-medium mt-1">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#81786A] mt-1">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, rows = 3, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-[#29251F] mb-1.5">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          className={cn(
            'w-full bg-[#FFFDF8] border border-[#D8CEBF] rounded-xl px-3.5 py-2 text-sm text-[#29251F] placeholder:text-[#81786A] transition-colors focus:border-[#A374] focus:ring-1 focus:ring-[#A374]/30 outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-y shadow-2xs',
            error && 'border-[#8B4A4A] focus:border-[#8B4A4A] focus:ring-[#8B4A4A]/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#8B4A4A] font-medium mt-1">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, children, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-[#29251F] mb-1.5">
            {label}
          </label>
        )}
        <select
          id={inputId}
          ref={ref}
          className={cn(
            'w-full bg-[#FFFDF8] border border-[#D8CEBF] rounded-xl px-3.5 py-2 text-sm text-[#29251F] placeholder:text-[#81786A] transition-colors focus:border-[#A374] focus:ring-1 focus:ring-[#A374]/30 outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs',
            error && 'border-[#8B4A4A] focus:border-[#8B4A4A] focus:ring-[#8B4A4A]/20',
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#FFFDF8] text-[#29251F]">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="text-xs text-[#8B4A4A] font-medium mt-1">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
