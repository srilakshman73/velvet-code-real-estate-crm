import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface VelvetCodeLogoProps {
  className?: string;
  variant?: 'full' | 'horizontal' | 'icon' | 'badge';
  href?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export function VelvetCodeLogo({
  className,
  variant = 'horizontal',
  href = '/',
  size = 'md',
  showTagline = true,
  theme = 'auto',
}: VelvetCodeLogoProps) {
  const sizeMap = {
    sm: { img: 28, text: 'text-sm', tag: 'text-[9px]' },
    md: { img: 36, text: 'text-base', tag: 'text-[10px]' },
    lg: { img: 46, text: 'text-xl', tag: 'text-xs' },
    xl: { img: 60, text: 'text-2xl', tag: 'text-xs' },
  };

  const currentSize = sizeMap[size];

  const textStyle =
    theme === 'dark'
      ? 'text-[#E9DFC8]'
      : 'text-[#2C241A]';

  const tagStyle =
    theme === 'dark'
      ? 'text-[#D8C7A5]/80'
      : 'text-[#8A7A63]';

  const content = (
    <div className={cn('flex items-center gap-3 select-none group', className)}>
      {/* Official Gold Metallic Brand Logo Symbol */}
      <div className="relative flex-shrink-0 overflow-hidden rounded-lg bg-[#2C241A] border border-[#A37432]/30 shadow-sm group-hover:border-[#A37432]/60 transition-colors">
        <Image
          src="/brand/velvet-code-logo.jpeg"
          alt="Velvet Code - Technology & Digital Solutions"
          width={currentSize.img}
          height={currentSize.img}
          className="object-contain"
          priority
        />
      </div>

      {variant !== 'icon' && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-tight">
            <span
              className={cn(
                'font-bold tracking-widest uppercase font-sans transition-colors',
                currentSize.text,
                textStyle
              )}
            >
              VELVET CODE
            </span>
          </div>
          {showTagline && (
            <span
              className={cn(
                'font-medium tracking-tight whitespace-nowrap',
                currentSize.tag,
                tagStyle
              )}
            >
              Technology & Digital Solutions
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="inline-flex items-center focus:outline-none">
      {content}
    </Link>
  );
}

export function VelvetCodeLogoFull({ className, theme = 'light' }: { className?: string; theme?: 'light' | 'dark' }) {
  const isDark = theme === 'dark';
  return (
    <div
      className={cn(
        'flex flex-col items-center text-center p-5 rounded-2xl border',
        isDark
          ? 'bg-[#2C241A] border-[#A37432]/30 text-[#E9DFC8]'
          : 'bg-[#FFF9F0] border-[#D8C7A5] text-[#2C241A] aurum-card-shadow',
        className
      )}
    >
      <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#A37432]/40 shadow-xl mb-3 bg-[#2C241A]">
        <Image
          src="/brand/velvet-code-logo.jpeg"
          alt="Velvet Code"
          fill
          sizes="96px"
          className="object-contain"
          priority
        />
      </div>
      <h2
        className={cn(
          'text-lg font-bold tracking-widest uppercase',
          isDark ? 'text-[#E9DFC8]' : 'text-[#2C241A]'
        )}
      >
        VELVET CODE
      </h2>
      <p className={cn('text-xs font-medium tracking-wide mt-1', isDark ? 'text-[#D8C7A5]' : 'text-[#8A7A63]')}>
        Technology & Digital Solutions
      </p>
    </div>
  );
}
