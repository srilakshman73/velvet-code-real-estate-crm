'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check, Plus } from 'lucide-react';

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: (ComboboxOption | string)[];
  placeholder?: string;
  allowCustom?: boolean;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Combobox({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select or type custom...',
  allowCustom = true,
  error,
  helperText,
  required,
  disabled,
  className,
  id,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize options to ComboboxOption objects
  const normalizedOptions: ComboboxOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  // Sync external value changes to local input
  useEffect(() => {
    // Find matching label if any, or use raw value
    const match = normalizedOptions.find(
      (opt) => opt.value === value || opt.label.toLowerCase() === (value || '').toLowerCase()
    );
    setInputValue(match ? match.label : value || '');
  }, [value]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(inputValue.toLowerCase()) ||
    opt.value.toLowerCase().includes(inputValue.toLowerCase())
  );

  const exactMatch = normalizedOptions.some(
    (opt) =>
      opt.label.toLowerCase() === inputValue.trim().toLowerCase() ||
      opt.value.toLowerCase() === inputValue.trim().toLowerCase()
  );

  const showCustomOption =
    allowCustom && inputValue.trim().length > 0 && !exactMatch;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (!isOpen) setIsOpen(true);
    // If custom typing is allowed, trigger onChange with typed string
    if (allowCustom) {
      // If it matches a known value, use that value, else pass raw typed string
      const matched = normalizedOptions.find(
        (opt) => opt.label.toLowerCase() === val.trim().toLowerCase()
      );
      onChange(matched ? matched.value : val);
    }
  };

  const handleSelectOption = (option: ComboboxOption) => {
    setInputValue(option.label);
    onChange(option.value);
    setIsOpen(false);
  };

  const handleSelectCustom = () => {
    if (!inputValue.trim()) return;
    onChange(inputValue.trim());
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        handleSelectOption(filteredOptions[0]);
      } else if (showCustomOption) {
        handleSelectCustom();
      } else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && !isOpen) {
      setIsOpen(true);
    }
  };

  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-[#2C241A] mb-1.5">
          {label} {required && <span className="text-[#8B4A4A]">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={cn(
            'w-full bg-[#FFF9F0] border border-[#D8C7A5] rounded-xl pl-3.5 pr-9 py-2 text-sm text-[#2C241A] placeholder:text-[#8A7A63] transition-colors focus:border-[#A37432] focus:ring-1 focus:ring-[#A37432]/30 outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs',
            error && 'border-[#8B4A4A] focus:border-[#8B4A4A] focus:ring-[#8B4A4A]/20'
          )}
        />

        <button
          type="button"
          onClick={() => {
            if (!disabled) {
              setIsOpen((prev) => !prev);
              if (!isOpen) inputRef.current?.focus();
            }
          }}
          className="absolute right-2.5 p-1 text-[#8A7A63] hover:text-[#2C241A] transition-colors cursor-pointer"
          tabIndex={-1}
          aria-label="Toggle options"
        >
          <ChevronDown
            className={cn('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180 text-[#A37432]')}
          />
        </button>
      </div>

      {error && <p className="text-xs text-[#8B4A4A] font-medium mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-[#8A7A63] mt-1">{helperText}</p>}

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1.5 bg-[#FFF9F0] border border-[#D8C7A5] rounded-xl shadow-[0_10px_25px_rgba(120,90,40,0.15)] max-h-60 overflow-y-auto divide-y divide-[#D8C7A5]/40 animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Filtered Predefined Options */}
          {filteredOptions.length > 0 ? (
            <div className="p-1">
              {filteredOptions.map((opt) => {
                const isSelected =
                  opt.value === value || opt.label.toLowerCase() === (value || '').toLowerCase();
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={cn(
                      'w-full text-left px-3 py-2 text-xs sm:text-sm rounded-lg flex items-center justify-between transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-[#A37432]/15 text-[#7A5520] font-bold'
                        : 'text-[#2C241A] hover:bg-[#F4EAD7]'
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#7A5520]" />}
                  </button>
                );
              })}
            </div>
          ) : (
            !showCustomOption && (
              <div className="p-3 text-center text-xs text-[#8A7A63]">
                No matching options found.
              </div>
            )
          )}

          {/* Custom option prompt */}
          {showCustomOption && (
            <div className="p-1 bg-[#F4EAD7]/60">
              <button
                type="button"
                onClick={handleSelectCustom}
                className="w-full text-left px-3 py-2 text-xs sm:text-sm rounded-lg flex items-center gap-2 text-[#7A5520] hover:bg-[#A37432]/20 font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#A37432]" />
                <span>
                  Use custom: <strong className="text-[#2C241A]">"{inputValue.trim()}"</strong>
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
