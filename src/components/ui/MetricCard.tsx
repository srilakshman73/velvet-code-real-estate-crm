import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  changePercent?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  variant?: 'gold' | 'emerald' | 'blue' | 'purple' | 'default';
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

  const accentStyles = {
    gold: 'border-[#DDD4C4] hover:border-[#A374]/80 bg-[#FFFCF6]',
    emerald: 'border-[#DDD4C4] hover:border-[#2E6B4F]/80 bg-[#FFFCF6]',
    blue: 'border-[#DDD4C4] hover:border-[#3D5A80]/80 bg-[#FFFCF6]',
    purple: 'border-[#DDD4C4] hover:border-[#6B5B95]/80 bg-[#FFFCF6]',
    default: 'border-[#DDD4C4] hover:border-[#A374]/60 bg-[#FFFCF6]',
  };

  const iconAccent = {
    gold: 'bg-[#A374]/15 border-[#A374]/30 text-[#8F642B]',
    emerald: 'bg-[#2E6B4F]/15 border-[#2E6B4F]/30 text-[#2E6B4F]',
    blue: 'bg-[#3D5A80]/15 border-[#3D5A80]/30 text-[#293E58]',
    purple: 'bg-[#6B5B95]/15 border-[#6B5B95]/30 text-[#524474]',
    default: 'bg-[#F7F3EA] border-[#DDD4C4] text-[#8F642B]',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 sm:p-6 border aurum-card-shadow transition-all duration-200 group',
        accentStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#766F63] mb-1">
            {title}
          </p>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#24211D] tracking-tight font-sans">
            {value}
          </div>
        </div>
        <div
          className={cn(
            'p-3 rounded-xl border shadow-xs group-hover:scale-105 transition-transform flex items-center justify-center',
            iconAccent[variant]
          )}
        >
          {icon}
        </div>
      </div>

      {(changePercent !== undefined || subtitle) && (
        <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-[#DDD4C4]/60">
          {changePercent !== undefined && (
            <div className="flex items-center gap-1 font-semibold">
              {isPositive ? (
                <span className="flex items-center text-[#2E6B4F] gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{changePercent}%
                </span>
              ) : isNegative ? (
                <span className="flex items-center text-[#8B2635] gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {changePercent}%
                </span>
              ) : (
                <span className="flex items-center text-[#766F63] gap-0.5">
                  <Minus className="w-3.5 h-3.5" />
                  0%
                </span>
              )}
              <span className="text-[#766F63] font-normal">{changeLabel}</span>
            </div>
          )}
          {subtitle && <span className="text-[#766F63] font-medium">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
