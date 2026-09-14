'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { VelvetCodeLogo } from '@/components/brand/VelvetCodeLogo';
import { useCRMStore } from '@/lib/store';
import {
  ShieldAlert,
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
  TrendingUp,
  Shield,
  Lock,
  Headphones,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface AdminAppShellProps {
  children: React.ReactNode;
}

export function AdminAppShell({ children }: AdminAppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, hasAdminAccess } = useCRMStore();

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
      <div className="min-h-screen bg-[#07080A] text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-2xl bg-zinc-950 border border-rose-500/30 space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-white">403 — Access Denied</h1>
            <p className="text-xs text-zinc-400 mt-2">
              The SaaS Master Admin Headquarters is strictly restricted to the <strong>Velvet Code Platform Owner</strong> (<code className="text-amber-300">srilakshman73@gmail.com</code>).
            </p>
            <p className="text-xs text-zinc-500 mt-2">
              Your account (<span className="text-zinc-300">{currentUser.name}</span> &bull; {currentUser.role}) does not have global multi-tenant administrator authority.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/app">
              <Button variant="primary" className="w-full">
                Return to Your CRM Workspace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080A] text-zinc-100 flex flex-col font-sans antialiased">
      {/* Top Admin Banner */}
      <header className="h-16 px-4 sm:px-8 bg-zinc-950 border-b border-amber-500/20 flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <VelvetCodeLogo variant="horizontal" href="/admin" size="sm" />
          <span className="hidden sm:inline-block px-2.5 py-1 text-[11px] font-bold tracking-widest uppercase bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 border border-amber-500/30 rounded-md">
            SaaS Master Console
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Owner Profile Badge */}
          <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-amber-500/30 text-xs">
            <div className="w-6 h-6 rounded-md bg-amber-500 text-black font-bold text-[10px] flex items-center justify-center">
              VC
            </div>
            <div>
              <span className="font-semibold text-white">Velvet Code</span>
              <span className="text-amber-400 font-mono text-[10px] ml-1.5">(OWNER)</span>
            </div>
          </div>

          <Link href="/app">
            <Button variant="outline" size="xs" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Open CRM Workspace
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-zinc-950/80 border-r border-zinc-800/80 p-4 space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider px-3 mb-2">
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
                      ? 'bg-amber-500/20 text-amber-300 border-l-2 border-amber-400 font-semibold shadow-inner'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Metrics in Sidebar */}
          <div className="mt-auto p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Platform MRR</span>
              <span className="font-bold text-emerald-400 font-mono">₹12.4 Lakhs</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Active Orgs</span>
              <span className="font-bold text-white font-mono">864 / 1,248</span>
            </div>
            <div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-500">
              Root: <span className="text-zinc-300 font-mono">srilakshman73@gmail.com</span>
            </div>
          </div>
        </aside>

        {/* Main Admin View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0B0D11]">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-6 pt-20">
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
                    isActive ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-zinc-300'
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
