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
    gold: 'border-amber-500/30 hover:border-amber-500/50 bg-gradient-to-b from-zinc-900 via-zinc-900 to-amber-950/20 text-amber-300',
    emerald: 'border-emerald-500/30 hover:border-emerald-500/50 bg-gradient-to-b from-zinc-900 via-zinc-900 to-emerald-950/20 text-emerald-400',
    blue: 'border-blue-500/30 hover:border-blue-500/50 bg-gradient-to-b from-zinc-900 via-zinc-900 to-blue-950/20 text-blue-400',
    purple: 'border-purple-500/30 hover:border-purple-500/50 bg-gradient-to-b from-zinc-900 via-zinc-900 to-purple-950/20 text-purple-400',
    default: 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/90 text-zinc-300',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl p-5 border shadow-lg transition-all duration-200 group',
        accentStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1">
            {title}
          </p>
          <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight font-sans">
            {value}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-zinc-200 shadow-inner group-hover:scale-105 transition-transform">
          {icon}
        </div>
      </div>

      {(changePercent !== undefined || subtitle) && (
        <div className="mt-3.5 flex items-center justify-between text-xs pt-3 border-t border-zinc-800/60">
          {changePercent !== undefined && (
            <div className="flex items-center gap-1 font-medium">
              {isPositive ? (
                <span className="flex items-center text-emerald-400 gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{changePercent}%
                </span>
              ) : isNegative ? (
                <span className="flex items-center text-rose-400 gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {changePercent}%
                </span>
              ) : (
                <span className="flex items-center text-zinc-400 gap-0.5">
                  <Minus className="w-3.5 h-3.5" />
                  0%
                </span>
              )}
              <span className="text-zinc-500">{changeLabel}</span>
            </div>
          )}
          {subtitle && <span className="text-zinc-400 font-medium">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
