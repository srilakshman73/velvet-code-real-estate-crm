'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { VelvetCodeLogo } from '@/components/brand/VelvetCodeLogo';
import { useCRMStore } from '@/lib/store';
import {
  Building,
  Users,
  CreditCard,
  Layers,
  Receipt,
  Cpu,
  Settings,
  ArrowLeft,
  LayoutDashboard,
  Menu,
  X,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminAppShellProps {
  children: React.ReactNode;
}

export function AdminAppShell({ children }: AdminAppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser } = useCRMStore();

  const isOwner = currentUser.role === 'OWNER';

  const adminNav = [
    { label: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Organizations & Tenants', href: '/admin/organizations', icon: Building },
    { label: 'Platform Users', href: '/admin/users', icon: Users },
    { label: 'Subscriptions & Tiers', href: '/admin/subscriptions', icon: Layers },
    { label: 'Plans Configuration', href: '/admin/plans', icon: CreditCard },
    { label: 'Payments & Transactions', href: '/admin/payments', icon: Receipt },
    { label: 'AI & WhatsApp Usage', href: '/admin/usage', icon: Cpu },
    { label: 'Platform Settings', href: '/admin/settings', icon: Settings },
  ];

  // 403 Forbidden Access Guard for non-OWNER users
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-[#151515] text-[#F7F3EA] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#1E1B18] border border-[#8B2635]/40 space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#8B2635]/15 border border-[#8B2635]/30 text-[#8B2635] flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#F7F3EA]">403 — Access Denied</h1>
            <p className="text-xs text-[#DDD4C4]/80 mt-2 leading-relaxed">
              The SaaS Master Admin Headquarters is strictly restricted to the <strong>Velvet Code Platform Owner</strong>.
            </p>
            <p className="text-xs text-[#DDD4C4]/60 mt-2">
              Your account (<span className="text-[#F7F3EA] font-semibold">{currentUser.name}</span> &bull; {currentUser.role}) does not have global multi-tenant administrator authority.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/app">
              <Button variant="gold" className="w-full">
                Return to Your CRM Workspace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151515] text-[#F7F3EA] flex flex-col font-sans antialiased">
      {/* Top Admin Banner */}
      <header className="h-16 px-4 sm:px-8 bg-[#151515] border-b border-[#24221E] flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <VelvetCodeLogo variant="horizontal" href="/admin" size="sm" theme="dark" />
          <span className="hidden sm:inline-block px-2.5 py-1 text-[11px] font-bold tracking-widest uppercase bg-[#A374]/20 text-[#A374] border border-[#A374]/40 rounded-md">
            SaaS Master Console
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Owner Profile Badge */}
          <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#1E1B18] border border-[#332F2A] text-xs">
            <div className="w-6 h-6 rounded-md bg-[#A374] text-[#151515] font-bold text-[10px] flex items-center justify-center">
              SL
            </div>
            <div>
              <span className="font-bold text-[#F7F3EA]">Sri Lakshman</span>
              <span className="text-[#A374] font-mono text-[10px] ml-1.5 font-bold">(OWNER)</span>
            </div>
          </div>

          <Link href="/app">
            <Button variant="outline" size="xs" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Open CRM Workspace
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#DDD4C4] hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-[#151515] border-r border-[#24221E] p-4 space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-[#A374] uppercase tracking-wider px-3 mb-2">
              SaaS Administration
            </p>
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === '/admin' && pathname === '/admin/dashboard');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#A374]/20 text-[#F7F3EA] border-l-2 border-[#A374] font-bold shadow-inner'
                      : 'text-[#DDD4C4]/70 hover:text-white hover:bg-[#1E1B18]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#A374]' : 'text-[#DDD4C4]/60'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Metrics in Sidebar */}
          <div className="mt-auto p-4 rounded-xl bg-[#1E1B18] border border-[#332F2A] text-xs space-y-2">
            <div className="flex items-center justify-between text-[#DDD4C4]/70">
              <span>Platform MRR</span>
              <span className="font-bold text-[#3B825E] font-mono">₹0</span>
            </div>
            <div className="flex items-center justify-between text-[#DDD4C4]/70">
              <span>Active Orgs</span>
              <span className="font-bold text-[#F7F3EA] font-mono">1</span>
            </div>
            <div className="pt-2 border-t border-[#332F2A] text-[10px] text-[#DDD4C4]/50">
              Global Platform Master Tier
            </div>
          </div>
        </aside>

        {/* Main Admin View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#181614] text-[#F7F3EA]">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#151515]/90 backdrop-blur-sm p-6 pt-20">
          <div className="space-y-2">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                    isActive ? 'bg-[#A374]/20 text-[#A374] font-bold' : 'text-[#DDD4C4]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
