import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  changePercent?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  variant?: 'gold' | 'rose' | 'emerald' | 'amber' | 'charcoal' | 'blue' | 'purple' | 'default';
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
    rose: 'border-[#EBCBD4] hover:border-[#D98FA5] bg-[#FFF9FA]',
    gold: 'border-[#EBCBD4] hover:border-[#D98FA5] bg-[#FFF9FA]',
    emerald: 'border-[#EBCBD4] hover:border-[#4A7C59]/80 bg-[#FFF9FA]',
    amber: 'border-[#EBCBD4] hover:border-[#C07D38]/80 bg-[#FFF9FA]',
    charcoal: 'border-[#EBCBD4] hover:border-[#3A2930]/80 bg-[#FFF9FA]',
    blue: 'border-[#EBCBD4] hover:border-[#D98FA5] bg-[#FFF9FA]',
    purple: 'border-[#EBCBD4] hover:border-[#D98FA5] bg-[#FFF9FA]',
    default: 'border-[#EBCBD4] hover:border-[#D98FA5] bg-[#FFF9FA]',
  };

  const iconAccent: Record<string, string> = {
    rose: 'bg-[#B86B84]/15 border-[#B86B84]/30 text-[#8C455C]',
    gold: 'bg-[#B86B84]/15 border-[#B86B84]/30 text-[#8C455C]',
    emerald: 'bg-[#4A7C59]/15 border-[#4A7C59]/30 text-[#4A7C59]',
    amber: 'bg-[#C07D38]/15 border-[#C07D38]/30 text-[#C07D38]',
    charcoal: 'bg-[#3A2930]/10 border-[#3A2930]/20 text-[#3A2930]',
    blue: 'bg-[#B86B84]/15 border-[#B86B84]/30 text-[#8C455C]',
    purple: 'bg-[#B86B84]/15 border-[#B86B84]/30 text-[#8C455C]',
    default: 'bg-[#FFF5F7] border-[#EBCBD4] text-[#8C455C]',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-4 sm:p-6 border rose-card-shadow transition-all duration-200 group',
        accentStyles[variant] || accentStyles.default,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 pr-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#765D66] mb-1 truncate">
            {title}
          </p>
          <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#3A2930] tracking-tight font-sans truncate">
            {value}
          </div>
        </div>
        <div
          className={cn(
            'p-2.5 sm:p-3 rounded-xl border shadow-2xs group-hover:scale-105 transition-transform flex items-center justify-center flex-shrink-0',
            iconAccent[variant] || iconAccent.default
          )}
        >
          {icon}
        </div>
      </div>

      {(changePercent !== undefined || subtitle) && (
        <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs pt-2.5 sm:pt-3 border-t border-[#EBCBD4]/60">
          {changePercent !== undefined && (
            <div className="flex items-center gap-1 font-semibold flex-wrap">
              {isPositive ? (
                <span className="flex items-center text-[#4A7C59] gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{changePercent}%
                </span>
              ) : isNegative ? (
                <span className="flex items-center text-[#A84355] gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {changePercent}%
                </span>
              ) : (
                <span className="flex items-center text-[#765D66] gap-0.5">
                  <Minus className="w-3.5 h-3.5" />
                  0%
                </span>
              )}
              <span className="text-[#765D66] font-normal">{changeLabel}</span>
            </div>
          )}
          {subtitle && <span className="text-[#9B828C] font-medium">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
