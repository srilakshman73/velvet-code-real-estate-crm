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
      <div className="min-h-screen bg-[#FCECEF] text-[#3A2930] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#FFF9FA] border border-[#EBCBD4] space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#A84355]/10 border border-[#A84355]/25 text-[#A84355] flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#3A2930]">403 â€” Access Denied</h1>
            <p className="text-xs text-[#765D66] mt-2 leading-relaxed">
              The SaaS Master Admin Headquarters is strictly restricted to the <strong>Velvet Code Platform Owner</strong>.
            </p>
            <p className="text-xs text-[#9B828C] mt-2">
              Your account (<span className="text-[#3A2930] font-semibold">{currentUser.name}</span> &bull; {currentUser.role}) does not have global multi-tenant administrator authority.
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
    <div className="min-h-screen bg-[#FCECEF] text-[#3A2930] flex flex-col font-sans antialiased">
      {/* Top Admin Banner */}
      <header className="h-16 px-4 sm:px-8 bg-[#FFF5F7] border-b border-[#EBCBD4] flex items-center justify-between z-30 shadow-2xs">
        <div className="flex items-center gap-4">
          <VelvetCodeLogo variant="horizontal" href="/admin" size="sm" theme="light" />
          <span className="hidden sm:inline-block px-2.5 py-1 text-[11px] font-bold tracking-widest uppercase bg-[#B86B84]/15 text-[#8C455C] border border-[#B86B84]/30 rounded-md font-serif">
            SaaS Master Console
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Owner Profile Badge */}
          <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#F8DDE5] border border-[#EBCBD4] text-xs shadow-2xs">
            <div className="w-6 h-6 rounded-md bg-[#B86B84] text-[#FFF9FA] font-bold text-[10px] flex items-center justify-center">
              SL
            </div>
            <div>
              <span className="font-bold text-[#3A2930]">Sri Lakshman</span>
              <span className="text-[#8C455C] font-mono text-[10px] ml-1.5 font-bold">(OWNER)</span>
            </div>
          </div>

          <Link href="/app">
            <Button variant="secondary" size="xs" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Open CRM Workspace
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#3A2930] hover:text-[#8C455C]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-[#EBCBD4] border-r border-[#EBCBD4] p-4 space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-[#765D66] uppercase tracking-wider px-3 mb-2 font-serif">
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
                      ? 'bg-[#FFF0F3] text-[#8C455C] border-l-2 border-[#B86B84] font-bold shadow-xs'
                      : 'text-[#3A2930] hover:text-[#8C455C] hover:bg-[#FFF5F7]/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#B86B84]' : 'text-[#765D66]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Metrics in Sidebar */}
          <div className="mt-auto p-4 rounded-xl bg-[#F8DDE5] border border-[#EBCBD4] text-xs space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-[#765D66]">
              <span>Platform MRR</span>
              <span className="font-bold text-[#4A7C59] font-mono">â‚¹0</span>
            </div>
            <div className="flex items-center justify-between text-[#765D66]">
              <span>Active Orgs</span>
              <span className="font-bold text-[#3A2930] font-mono">1</span>
            </div>
            <div className="pt-2 border-t border-[#EBCBD4] text-[10px] text-[#9B828C]">
              Global Platform Master Tier
            </div>
          </div>
        </aside>

        {/* Main Admin View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#FCECEF] text-[#3A2930]">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#3A2930]/30 backdrop-blur-xs p-6 pt-20">
          <div className="bg-[#EBCBD4] border border-[#EBCBD4] rounded-2xl p-4 space-y-2 shadow-2xl">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                    isActive ? 'bg-[#FFF0F3] text-[#8C455C] font-bold' : 'text-[#3A2930]'
                  }`}
                >
                  <Icon className="w-5 h-5 text-[#765D66]" />
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

