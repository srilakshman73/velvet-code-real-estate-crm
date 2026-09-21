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
    gold: 'border-[#DCD3C2] hover:border-[#A374]/80 bg-[#FFFDF8]',
    emerald: 'border-[#DCD3C2] hover:border-[#2F6B52]/80 bg-[#FFFDF8]',
    amber: 'border-[#DCD3C2] hover:border-[#A87932]/80 bg-[#FFFDF8]',
    charcoal: 'border-[#DCD3C2] hover:border-[#171613]/80 bg-[#FFFDF8]',
    blue: 'border-[#DCD3C2] hover:border-[#A374]/80 bg-[#FFFDF8]',
    purple: 'border-[#DCD3C2] hover:border-[#A87932]/80 bg-[#FFFDF8]',
    default: 'border-[#DCD3C2] hover:border-[#A374]/60 bg-[#FFFDF8]',
  };

  const iconAccent: Record<string, string> = {
    gold: 'bg-[#A374]/15 border-[#A374]/30 text-[#8F642B]',
    emerald: 'bg-[#2F6B52]/15 border-[#2F6B52]/30 text-[#2F6B52]',
    amber: 'bg-[#A87932]/15 border-[#A87932]/30 text-[#A87932]',
    charcoal: 'bg-[#171613]/10 border-[#171613]/20 text-[#171613]',
    blue: 'bg-[#A374]/15 border-[#A374]/30 text-[#8F642B]',
    purple: 'bg-[#A87932]/15 border-[#A87932]/30 text-[#A87932]',
    default: 'bg-[#F7F3EA] border-[#DCD3C2] text-[#8F642B]',
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
          <p className="text-xs font-bold uppercase tracking-wider text-[#756E63] mb-1">
            {title}
          </p>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#26231E] tracking-tight font-sans">
            {value}
          </div>
        </div>
        <div
          className={cn(
            'p-3 rounded-xl border shadow-xs group-hover:scale-105 transition-transform flex items-center justify-center',
            iconAccent[variant] || iconAccent.default
          )}
        >
          {icon}
        </div>
      </div>

      {(changePercent !== undefined || subtitle) && (
        <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-[#DCD3C2]/60">
          {changePercent !== undefined && (
            <div className="flex items-center gap-1 font-semibold">
              {isPositive ? (
                <span className="flex items-center text-[#2F6B52] gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{changePercent}%
                </span>
              ) : isNegative ? (
                <span className="flex items-center text-[#8B3D3D] gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {changePercent}%
                </span>
              ) : (
                <span className="flex items-center text-[#756E63] gap-0.5">
                  <Minus className="w-3.5 h-3.5" />
                  0%
                </span>
              )}
              <span className="text-[#756E63] font-normal">{changeLabel}</span>
            </div>
          )}
          {subtitle && <span className="text-[#756E63] font-medium">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
