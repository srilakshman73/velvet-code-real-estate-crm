'use client';

import React from 'react';

export function DecorativeHeartBackground() {
  return (
    <div className="heart-bg-decoration" aria-hidden="true">
      {/* Desktop & Tablet Hearts */}
      <span className="heart-shape desktop-only text-4xl top-[8%] left-[4%] rotate-[-12deg]">♡</span>
      <span className="heart-shape desktop-only text-2xl top-[18%] right-[6%] rotate-[15deg]">♥</span>
      <span className="heart-shape desktop-only text-3xl top-[35%] left-[2%] rotate-[-8deg]">♥</span>
      <span className="heart-shape desktop-only text-5xl top-[48%] right-[3%] rotate-[20deg]">♡</span>
      <span className="heart-shape desktop-only text-2xl top-[65%] left-[5%] rotate-[10deg]">♡</span>
      <span className="heart-shape desktop-only text-4xl top-[82%] right-[5%] rotate-[-15deg]">♥</span>
      <span className="heart-shape desktop-only text-3xl top-[92%] left-[8%] rotate-[6deg]">♡</span>

      {/* Universal / Mobile-Friendly Subtle Hearts */}
      <span className="heart-shape text-xl top-[5%] right-[12%] rotate-[-10deg]">♡</span>
      <span className="heart-shape text-lg top-[28%] left-[8%] rotate-[12deg]">♥</span>
      <span className="heart-shape text-2xl top-[58%] right-[10%] rotate-[-18deg]">♡</span>
      <span className="heart-shape text-xl top-[88%] left-[12%] rotate-[8deg]">♥</span>
    </div>
  );
}
