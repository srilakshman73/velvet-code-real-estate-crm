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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2D261C]/25 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={cn(
          'relative w-full bg-[#FFFDF8] border border-[#D8CEBF] rounded-2xl shadow-2xl z-10 overflow-hidden text-[#29251F] animate-in zoom-in-95 duration-150',
          maxWidthMap[maxWidth]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[#D4C9B9] bg-[#F1ECE3]/80">
          <div>
            {typeof title === 'string' ? (
              <h2 className="text-lg font-bold text-[#29251F] tracking-tight">{title}</h2>
            ) : (
              title
            )}
            {description && <p className="text-xs text-[#625B51] mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-[#81786A] hover:text-[#29251F] p-1.5 rounded-lg hover:bg-[#E8E1D5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">{children}</div>
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
        className="fixed inset-0 bg-[#2D261C]/25 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={cn(
            'w-screen bg-[#FFFDF8] border-l border-[#D8CEBF] shadow-2xl flex flex-col text-[#29251F]',
            sizeMap[size]
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#D4C9B9] bg-[#F1ECE3]/80">
            <div>
              {typeof title === 'string' ? (
                <h3 className="text-base font-bold text-[#29251F] tracking-tight">{title}</h3>
              ) : (
                title
              )}
              {subtitle && <p className="text-xs text-[#625B51] mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-[#81786A] hover:text-[#29251F] p-1.5 rounded-lg hover:bg-[#E8E1D5] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
