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
}

export function VelvetCodeLogo({
  className,
  variant = 'horizontal',
  href = '/',
  size = 'md',
  showTagline = true,
}: VelvetCodeLogoProps) {
  const sizeMap = {
    sm: { img: 28, text: 'text-base', tag: 'text-[9px]' },
    md: { img: 36, text: 'text-lg', tag: 'text-[10px]' },
    lg: { img: 48, text: 'text-2xl', tag: 'text-xs' },
    xl: { img: 64, text: 'text-3xl', tag: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div className={cn('flex items-center gap-3 select-none group', className)}>
      {/* Official Gold Metallic Brand Logo Symbol */}
      <div className="relative flex-shrink-0 overflow-hidden rounded-lg bg-black border border-amber-500/20 shadow-md group-hover:border-amber-400/40 transition-colors">
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
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={cn(
                'font-bold tracking-wider uppercase text-white font-sans bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent',
                currentSize.text
              )}
            >
              VELVET CODE
            </span>
          </div>
          {showTagline && (
            <span
              className={cn(
                'text-zinc-400 font-medium tracking-tight mt-0.5 whitespace-nowrap',
                currentSize.tag
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

export function VelvetCodeLogoFull({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center text-center p-4 bg-zinc-950/80 rounded-2xl border border-amber-500/20', className)}>
      <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-amber-500/30 shadow-2xl mb-3">
        <Image
          src="/brand/velvet-code-logo.jpeg"
          alt="Velvet Code"
          fill
          sizes="112px"
          className="object-contain"
          priority
        />
      </div>
      <h2 className="text-xl font-bold tracking-widest uppercase bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
        VELVET CODE
      </h2>
      <p className="text-xs text-zinc-400 font-medium tracking-wide mt-1">
        Technology & Digital Solutions
      </p>
    </div>
  );
}
