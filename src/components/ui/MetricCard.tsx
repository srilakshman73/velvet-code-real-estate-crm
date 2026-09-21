import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  changePercent?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  variant?: 'gold' | 'emerald' | 'amber' | 'charcoal' | 'blue' | 'purple' | 'default';
  className?: string;
  subtitle?: string;
}

export function MetricCard({
  title,
  value,
  changePercent,
  changeLabel = 'vs last month',
  icon,
  variant = 'default',
  className,
  subtitle,
}: MetricCardProps) {
  const isPositive = (changePercent ?? 0) > 0;
  const isNegative = (changePercent ?? 0) < 0;

  const accentStyles: Record<string, string> = {
    gold: 'border-[#D8C7A5] hover:border-[#A37432]/80 bg-[#FFF9F0]',
    emerald: 'border-[#D8C7A5] hover:border-[#547A61]/80 bg-[#FFF9F0]',
    amber: 'border-[#D8C7A5] hover:border-[#A87932]/80 bg-[#FFF9F0]',
    charcoal: 'border-[#D8C7A5] hover:border-[#2C241A]/80 bg-[#FFF9F0]',
    blue: 'border-[#D8C7A5] hover:border-[#A37432]/80 bg-[#FFF9F0]',
    purple: 'border-[#D8C7A5] hover:border-[#A87932]/80 bg-[#FFF9F0]',
    default: 'border-[#D8C7A5] hover:border-[#A37432]/60 bg-[#FFF9F0]',
  };

  const iconAccent: Record<string, string> = {
    gold: 'bg-[#A37432]/15 border-[#A37432]/30 text-[#7A5520]',
    emerald: 'bg-[#547A61]/15 border-[#547A61]/30 text-[#547A61]',
    amber: 'bg-[#A87932]/15 border-[#A87932]/30 text-[#A87932]',
    charcoal: 'bg-[#2C241A]/10 border-[#2C241A]/20 text-[#2C241A]',
    blue: 'bg-[#A37432]/15 border-[#A37432]/30 text-[#7A5520]',
    purple: 'bg-[#A87932]/15 border-[#A87932]/30 text-[#A87932]',
    default: 'bg-[#F4EAD7] border-[#D8C7A5] text-[#7A5520]',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 sm:p-6 border aurum-card-shadow transition-all duration-200 group',
        accentStyles[variant] || accentStyles.default,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#6A5A44] mb-1">
            {title}
          </p>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#2C241A] tracking-tight font-sans">
            {value}
          </div>
        </div>
        <div
          className={cn(
            'p-3 rounded-xl border shadow-2xs group-hover:scale-105 transition-transform flex items-center justify-center',
            iconAccent[variant] || iconAccent.default
          )}
        >
          {icon}
        </div>
      </div>

      {(changePercent !== undefined || subtitle) && (
        <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-[#D8C7A5]/60">
          {changePercent !== undefined && (
            <div className="flex items-center gap-1 font-semibold">
              {isPositive ? (
                <span className="flex items-center text-[#547A61] gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{changePercent}%
                </span>
              ) : isNegative ? (
                <span className="flex items-center text-[#8B4A4A] gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {changePercent}%
                </span>
              ) : (
                <span className="flex items-center text-[#6A5A44] gap-0.5">
                  <Minus className="w-3.5 h-3.5" />
                  0%
                </span>
              )}
              <span className="text-[#6A5A44] font-normal">{changeLabel}</span>
            </div>
          )}
          {subtitle && <span className="text-[#8A7A63] font-medium">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
