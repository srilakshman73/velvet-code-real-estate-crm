import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format Indian Rupee (INR) into clean compact real estate notation (Lakhs, Crores, or Thousands)
 */
export function formatINR(amount: number, compact: boolean = false): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';

  if (compact) {
    if (amount >= 10000000) {
      const cr = amount / 10000000;
      return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      const lakh = amount / 100000;
      return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)} L`;
    }
    if (amount >= 1000) {
      const k = amount / 1000;
      return `₹${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
    }
    return `₹${amount}`;
  }

  // Standard Indian comma separator notation (e.g. 1,25,00,000)
  const numStr = Math.round(amount).toString();
  const lastThree = numStr.substring(numStr.length - 3);
  const otherNumbers = numStr.substring(0, numStr.length - 3);
  const formatted =
    otherNumbers !== ''
      ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
      : lastThree;

  return `₹${formatted}`;
}

export function formatINRPricePerSqFt(price: number, areaSqFt: number): string {
  if (!areaSqFt || areaSqFt <= 0) return '—';
  const rate = Math.round(price / areaSqFt);
  return `₹${rate.toLocaleString('en-IN')}/sq.ft`;
}

export function formatDate(dateString: string | Date | undefined): string {
  if (!dateString) return '—';
  const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(dateString: string | Date | undefined): string {
  if (!dateString) return '—';
  const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateTime(dateString: string | Date | undefined): string {
  if (!dateString) return '—';
  const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatRelativeTime(dateString: string | Date | undefined): string {
  if (!dateString) return '—';
  const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(d.getTime())) return '—';

  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return 'Yesterday';
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function getInitials(name: string): string {
  if (!name) return 'VC';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function truncate(text: string, maxLength: number = 60): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength) + '...';
}

export const PRIMARY_WHATSAPP_NUMBER = '+91 63833 95915';
export const PRIMARY_WHATSAPP_PHONE_CLEAN = '916383395915';
export const SECONDARY_WHATSAPP_NUMBER = '+91 63833 95915';
export const SECONDARY_WHATSAPP_PHONE_CLEAN = '916383395915';
export const DEFAULT_WHATSAPP_MESSAGE = 'Hello, I would like to know more about your Real Estate CRM.';

/**
 * Builds standard WhatsApp click-to-chat URL with country code and pre-filled message
 * Compatible with Desktop, Android, and iOS devices.
 */
export function buildWhatsAppUrl(
  phone: string = PRIMARY_WHATSAPP_PHONE_CLEAN,
  messageText: string = DEFAULT_WHATSAPP_MESSAGE
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '') || PRIMARY_WHATSAPP_PHONE_CLEAN;
  const encodedMsg = encodeURIComponent(
    messageText || DEFAULT_WHATSAPP_MESSAGE
  );
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}

