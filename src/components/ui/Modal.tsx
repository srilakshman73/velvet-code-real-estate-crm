import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2A1820]/35 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={cn(
          'relative w-full max-w-[96vw] sm:max-w-lg bg-[#FFF9FA] border border-[#EBCBD4] rounded-2xl shadow-2xl z-10 overflow-hidden text-[#3A2930] animate-in zoom-in-95 duration-150 my-auto flex flex-col',
          maxWidthMap[maxWidth]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#EBCBD4] bg-[#FFF5F7] sticky top-0 z-20">
          <div className="min-w-0 pr-3">
            {typeof title === 'string' ? (
              <h2 className="text-base sm:text-lg font-bold text-[#3A2930] tracking-tight truncate">{title}</h2>
            ) : (
              title
            )}
            {description && <p className="text-xs text-[#765D66] mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-[#9B828C] hover:text-[#3A2930] p-2 rounded-xl hover:bg-[#F8DDE5] transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center flex-shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 max-h-[82vh] sm:max-h-[80vh] overflow-y-auto overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'lg',
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeMap = {
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2A1820]/35 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div
          className={cn(
            'w-screen max-w-full bg-[#FFF9FA] border-l border-[#EBCBD4] shadow-2xl flex flex-col text-[#3A2930]',
            sizeMap[size]
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#EBCBD4] bg-[#FFF5F7]">
            <div className="min-w-0 pr-3">
              {typeof title === 'string' ? (
                <h3 className="text-base font-bold text-[#3A2930] tracking-tight truncate">{title}</h3>
              ) : (
                title
              )}
              {subtitle && <p className="text-xs text-[#765D66] mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-[#9B828C] hover:text-[#3A2930] p-2 rounded-xl hover:bg-[#F8DDE5] transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center flex-shrink-0"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden">{children}</div>
        </div>
      </div>
    </div>
  );
}
