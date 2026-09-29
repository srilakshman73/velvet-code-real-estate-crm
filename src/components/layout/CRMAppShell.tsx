'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { VelvetCodeLogo } from '@/components/brand/VelvetCodeLogo';
import { useCRMStore } from '@/lib/store';
import { GlobalSearchModal } from './GlobalSearchModal';
import { NotificationDrawer } from './NotificationDrawer';
import { RealtyAIFloatingWidget } from './RealtyAIFloatingWidget';
import { AppointmentReminderPopup } from './AppointmentReminderPopup';
import { Button } from '@/components/ui/Button';
import { getInitials } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  PlusCircle,
  Kanban,
  CalendarCheck,
  CheckSquare,
  Calendar,
  Clock,
  MessageSquare,
  Sparkles,
  BarChart3,
  Users2,
  FileText,
  CreditCard,
  Settings,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Building,
  LogOut,
  Shield,
  Zap,
} from 'lucide-react';

interface CRMAppShellProps {
  children: React.ReactNode;
}

export function CRMAppShell({ children }: CRMAppShellProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const {
    currentOrg,
    organizations,
    setCurrentOrg,
    currentUser,
    users,
    setCurrentUser,
    isOwnerSupportMode,
    exitSupportMode,
    subscription,
    currentPlanLimits,
    notifications,
    setIsSearchOpen,
  } = useCRMStore();

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    accent?: string;
  }

  interface NavGroup {
    group: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      group: 'OVERVIEW',
      items: [
        { label: 'Dashboard', href: '/app', icon: LayoutDashboard },
      ],
    },
    {
      group: 'CRM & CLIENTS',
      items: [
        { label: 'Leads', href: '/app/leads', icon: Users, badge: 'Hot' },
        { label: 'Clients', href: '/app/clients', icon: UserCheck },
      ],
    },
    {
      group: 'PROPERTIES',
      items: [
        { label: 'Properties', href: '/app/properties', icon: Building2 },
      ],
    },
    {
      group: 'SALES & PIPELINE',
      items: [
        { label: 'Deals Pipeline', href: '/app/deals', icon: Kanban },
        { label: 'Site Visits', href: '/app/site-visits', icon: CalendarCheck },
      ],
    },
    {
      group: 'ACTIVITY',
      items: [
        { label: 'Tasks', href: '/app/tasks', icon: CheckSquare },
        { label: 'Follow-ups', href: '/app/follow-ups', icon: Clock },
        { label: 'Calendar', href: '/app/calendar', icon: Calendar },
      ],
    },
    {
      group: 'COMMUNICATION & AI',
      items: [
        {
          label: 'WhatsApp CRM',
          href: '/app/whatsapp',
          icon: MessageSquare,
          accent: 'emerald',
        },
        {
          label: 'Realty AI',
          href: '/app/ai',
          icon: Sparkles,
          accent: 'gold',
        },
      ],
    },
    {
      group: 'ANALYTICS & WORKSPACE',
      items: [
        { label: 'Reports', href: '/app/reports', icon: BarChart3 },
        { label: 'Team', href: '/app/team', icon: Users2 },
        { label: 'Documents', href: '/app/documents', icon: FileText },
        { label: 'Billing', href: '/app/billing', icon: CreditCard },
        { label: 'Settings', href: '/app/settings', icon: Settings },
      ],
    },
  ];

  const mobileBottomNav = [
    { label: 'Home', href: '/app', icon: LayoutDashboard },
    { label: 'Leads', href: '/app/leads', icon: Users },
    { label: 'Properties', href: '/app/properties', icon: Building2 },
    { label: 'Deals', href: '/app/deals', icon: Kanban },
    { label: 'WhatsApp', href: '/app/whatsapp', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#FCECEF] text-[#3A2930] flex flex-col antialiased font-sans">
      <GlobalSearchModal />
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <RealtyAIFloatingWidget />
      <AppointmentReminderPopup />

      <div className="flex-1 flex overflow-hidden">
        {/* ========================================== */}
        {/* DESKTOP LUXURY CHAMPAGNE SIDEBAR */}
        {/* ========================================== */}
        <aside
          className={`hidden md:flex flex-col border-r border-[#EBCBD4] bg-[#EBCBD4] transition-all duration-300 z-30 ${
            isCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Brand Header */}
          <div className="h-20 px-4 flex items-center justify-between border-b border-[#EBCBD4]">
            {isCollapsed ? (
              <VelvetCodeLogo variant="icon" href="/app" size="sm" theme="light" />
            ) : (
              <VelvetCodeLogo variant="horizontal" href="/app" size="md" theme="light" />
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-[#765D66] hover:text-[#3A2930] rounded-lg hover:bg-[#FFF5F7]/60 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Multi-Tenant Organization Switcher */}
          {!isCollapsed && (
            <div className="p-3 border-b border-[#EBCBD4] relative">
              <div
                onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF9FA] hover:bg-[#FFF5F7] border border-[#EBCBD4] cursor-pointer transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#B86B84]/15 border border-[#B86B84]/30 flex items-center justify-center text-[#8C455C] font-bold text-xs flex-shrink-0">
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#3A2930] truncate">
                      {currentOrg.name}
                    </p>
                    <p className="text-[10px] text-[#8C455C] font-medium">
                      {subscription.tier} Plan â€¢ {currentOrg.city}
                    </p>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#9B828C] flex-shrink-0 ml-1" />
              </div>

              {/* Org Switcher Dropdown */}
              {isOrgDropdownOpen && (
                <div className="absolute top-full left-3 right-3 mt-1 bg-[#FFF9FA] border border-[#EBCBD4] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in">
                  <p className="text-[10px] font-bold text-[#9B828C] uppercase tracking-wider px-2 py-1 font-serif">
                    Switch Workspace Tenant
                  </p>
                  {organizations.map((org) => (
                    <div
                      key={org.id}
                      onClick={() => {
                        setCurrentOrg(org);
                        setIsOrgDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs ${
                        org.id === currentOrg.id
                          ? 'bg-[#FFF0F3] text-[#8C455C] font-bold border border-[#B86B84]/50'
                          : 'hover:bg-[#FFF5F7] text-[#3A2930]'
                      }`}
                    >
                      <span className="truncate">{org.name}</span>
                      <span className="text-[10px] text-[#9B828C]">{org.businessType}</span>
                    </div>
                  ))}
                  <div className="mt-1 pt-1 border-t border-[#EBCBD4]">
                    <Link
                      href="/onboarding"
                      onClick={() => setIsOrgDropdownOpen(false)}
                      className="flex items-center gap-1.5 p-1.5 text-xs text-[#8C455C] hover:text-[#9E546C] font-semibold"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Create New Workspace
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-5">
            {navGroups.map((grp, idx) => (
              <div key={idx}>
                {!isCollapsed && (
                  <p className="text-[10px] font-bold tracking-wider uppercase text-[#765D66] px-3 mb-1.5 font-serif">
                    {grp.group}
                  </p>
                )}
                <div className="space-y-0.5">
                  {grp.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/app' && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-[#FFF0F3] text-[#8C455C] border-l-2 border-[#B86B84] font-bold shadow-xs'
                            : 'text-[#3A2930] hover:text-[#8C455C] hover:bg-[#FFF5F7]/60'
                        } ${isCollapsed ? 'justify-center px-2' : ''}`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 ${
                            isActive
                              ? 'text-[#B86B84]'
                              : item.accent === 'emerald'
                              ? 'text-[#4A7C59]'
                              : item.accent === 'gold'
                              ? 'text-[#B86B84]'
                              : 'text-[#765D66]'
                          }`}
                        />
                        {!isCollapsed && (
                          <span className="flex-1 truncate">{item.label}</span>
                        )}
                        {!isCollapsed && item.badge && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#B86B84]/20 text-[#8C455C] rounded">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer: Subscription & Plan Tier */}
          {!isCollapsed && (
            <div className="p-3 border-t border-[#EBCBD4] bg-[#EBCBD4]">
              <div className="p-3 rounded-xl bg-[#FFF9FA] border border-[#EBCBD4] shadow-2xs">
                <div className="flex items-center justify-between text-xs font-semibold text-[#3A2930] mb-1.5">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Zap className="w-3.5 h-3.5 text-[#B86B84]" />
                    {subscription.tier} Plan
                  </span>
                  <Link
                    href="/app/billing"
                    className="text-[10px] font-bold text-[#8C455C] hover:underline"
                  >
                    Upgrade
                  </Link>
                </div>
                <div className="space-y-1 text-[10px] text-[#765D66]">
                  <div className="flex justify-between">
                    <span>Leads Quota</span>
                    <span className="text-[#3A2930] font-semibold">
                      {subscription.usage.leadsCount} / {currentPlanLimits.maxLeads === -1 ? 'âˆž' : currentPlanLimits.maxLeads}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#FCECEF] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#B86B84] rounded-full"
                      style={{
                        width: `${Math.min(
                          (subscription.usage.leadsCount /
                            (currentPlanLimits.maxLeads === -1 ? 1000 : currentPlanLimits.maxLeads)) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ========================================== */}
        {/* MAIN WORKSPACE CONTENT AREA */}
        {/* ========================================== */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FCECEF]">
          {/* Top Global Navigation Bar */}
          <header className="h-16 px-4 sm:px-6 bg-[#FFF5F7] border-b border-[#EBCBD4] backdrop-blur-md flex items-center justify-between z-20 shadow-2xs">
            {/* Mobile Header / Brand */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-[#3A2930] hover:text-[#8C455C] rounded-lg hover:bg-[#FCECEF]"
              >
                <Menu className="w-5 h-5" />
              </button>
              <VelvetCodeLogo variant="icon" href="/app" size="sm" theme="light" />
            </div>

            {/* Global Search Bar (Cmd+K) */}
            <div className="hidden sm:flex items-center flex-1 max-w-md">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-[#9B828C] bg-[#FFF9FA] border border-[#EBCBD4] hover:border-[#B86B84]/60 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-[#B86B84]" />
                  Search leads, properties, deals, tasks...
                </span>
                <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-[#FCECEF] border border-[#EBCBD4] rounded text-[#9B828C]">
                  âŒ˜K
                </kbd>
              </button>
            </div>

            {/* Right Top Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              {/* Quick Add Actions */}
              <div className="hidden lg:flex items-center gap-2">
                <Link href="/app/leads">
                  <Button variant="secondary" size="xs" leftIcon={<PlusCircle className="w-3.5 h-3.5 text-[#8C455C]" />}>
                    Add Lead
                  </Button>
                </Link>
                <Link href="/app/properties">
                  <Button variant="secondary" size="xs" leftIcon={<PlusCircle className="w-3.5 h-3.5 text-[#8C455C]" />}>
                    Add Property
                  </Button>
                </Link>
              </div>

              {/* Notifications Trigger */}
              <button
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2 text-[#765D66] hover:text-[#3A2930] rounded-xl hover:bg-[#FCECEF] border border-transparent hover:border-[#EBCBD4] transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#B86B84] rounded-full animate-pulse" />
                )}
              </button>

              {/* User Profile / Role Switcher */}
              <div className="relative">
                <div
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 rounded-xl bg-[#FFF9FA] hover:bg-[#FFF5F7] border border-[#EBCBD4] cursor-pointer transition-colors shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#B86B84] text-[#FFF9FA] font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                    {getInitials(currentUser.name)}
                  </div>
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-bold text-[#3A2930] leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-[#8C455C] font-semibold">
                      {currentUser.role}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#9B828C]" />
                </div>

                {/* User Switcher Dropdown */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#FFF9FA] border border-[#EBCBD4] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-[#EBCBD4] mb-1">
                      <p className="text-xs font-bold text-[#3A2930]">{currentUser.name}</p>
                      <p className="text-[11px] text-[#765D66] truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold uppercase bg-[#B86B84]/15 text-[#8C455C] rounded">
                        {currentUser.role}
                      </span>
                    </div>

                    <p className="text-[10px] font-bold text-[#9B828C] uppercase tracking-wider px-2 py-1 font-serif">
                      Switch Role Context
                    </p>
                    {users.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setIsUserDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs ${
                          u.id === currentUser.id
                            ? 'bg-[#FFF0F3] text-[#8C455C] font-bold'
                            : 'hover:bg-[#FFF5F7] text-[#3A2930]'
                        }`}
                      >
                        <span>{u.name}</span>
                        <span className="text-[10px] text-[#9B828C]">{u.role}</span>
                      </div>
                    ))}

                    <div className="mt-2 pt-2 border-t border-[#EBCBD4] space-y-1">
                      {currentUser.role === 'OWNER' && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-lg text-xs text-[#8C455C] hover:bg-[#FFF5F7] font-bold"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          SaaS Master Admin Panel
                        </Link>
                      )}
                      <Link
                        href="/login"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-lg text-xs text-[#A84355] hover:bg-[#A84355]/10 font-bold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Owner Support Mode Persistent Banner */}
          {isOwnerSupportMode && (
            <div className="bg-[#B86B84]/15 border-b border-[#B86B84]/30 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8C455C] z-20">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#B86B84] text-[#FFF9FA] font-bold text-[10px] uppercase">
                  OWNER SUPPORT MODE
                </span>
                <span>
                  Viewing tenant organization: <strong className="text-[#3A2930]">{currentOrg.name}</strong> ({currentOrg.id})
                </span>
              </div>
              <Link href="/admin/organizations">
                <button
                  onClick={exitSupportMode}
                  className="px-3 py-1 bg-[#B86B84] hover:bg-[#9E546C] text-[#FFF9FA] font-bold rounded-lg transition-colors cursor-pointer text-xs shadow-2xs"
                >
                  Exit Support Mode & Return to Admin &rarr;
                </button>
              </Link>
            </div>
          )}

          {/* Scrollable Page Body */}
          <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
            {children}
          </main>
        </div>
      </div>

      {/* ========================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {/* ========================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFF5F7]/95 border-t border-[#EBCBD4] backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-lg">
        {mobileBottomNav.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/app' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-[#8C455C] font-bold' : 'text-[#765D66] hover:text-[#3A2930]'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ========================================== */}
      {/* MOBILE FULL DRAWER MENU */}
      {/* ========================================== */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-[#3A2930]/30 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-[#EBCBD4] border-r border-[#EBCBD4] p-5 flex flex-col overflow-y-auto text-[#3A2930]">
            <div className="flex items-center justify-between pb-4 border-b border-[#EBCBD4]">
              <VelvetCodeLogo size="sm" href="/app" theme="light" />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-[#3A2930] hover:text-[#8C455C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 border-b border-[#EBCBD4]">
              <p className="text-xs font-bold text-[#3A2930]">{currentOrg.name}</p>
              <p className="text-[11px] text-[#8C455C] font-semibold">{subscription.tier} Plan</p>
            </div>

            <div className="py-4 flex-1 space-y-4">
              {navGroups.map((grp, i) => (
                <div key={i}>
                  <p className="text-[10px] font-bold text-[#9B828C] uppercase tracking-wider mb-2 font-serif">
                    {grp.group}
                  </p>
                  <div className="space-y-1">
                    {grp.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                            isActive
                              ? 'bg-[#FFF0F3] text-[#8C455C] font-bold'
                              : 'text-[#3A2930] hover:bg-[#FFF5F7]/60'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-[#765D66]" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#EBCBD4] space-y-2">
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-xs font-bold text-[#8C455C] py-1"
              >
                Velvet Code SaaS Admin â†—
              </Link>
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-xs font-bold text-[#A84355] py-1"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

