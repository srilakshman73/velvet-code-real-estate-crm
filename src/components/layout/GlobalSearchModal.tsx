'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCRMStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';
import {
  Search,
  Users,
  Building2,
  Kanban,
  CalendarCheck,
  CheckSquare,
  MessageSquare,
  Sparkles,
  BarChart3,
  CreditCard,
  Settings,
  ArrowRight,
  X,
} from 'lucide-react';

export function GlobalSearchModal() {
  const router = useRouter();
  const {
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    leads,
    properties,
    deals,
    tasks,
  } = useCRMStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const q = searchQuery.toLowerCase().trim();

  // Matched Categories
  const matchedLeads = q
    ? leads
        .filter(
          (l) =>
            l.name.toLowerCase().includes(q) ||
            l.phone.includes(q) ||
            (l.email && l.email.toLowerCase().includes(q)) ||
            (l.interestedPropertyName && l.interestedPropertyName.toLowerCase().includes(q))
        )
        .slice(0, 4)
    : [];

  const matchedProperties = q
    ? properties
        .filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.locality.toLowerCase().includes(q) ||
            p.city.toLowerCase().includes(q)
        )
        .slice(0, 4)
    : [];

  const matchedDeals = q
    ? deals
        .filter(
          (d) =>
            d.title.toLowerCase().includes(q) ||
            (d.leadName && d.leadName.toLowerCase().includes(q))
        )
        .slice(0, 3)
    : [];

  const matchedTasks = q
    ? tasks.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const quickNav = [
    { label: 'CRM Dashboard', href: '/app', icon: BarChart3 },
    { label: 'Leads Management', href: '/app/leads', icon: Users },
    { label: 'Properties Inventory', href: '/app/properties', icon: Building2 },
    { label: 'Sales Deals Pipeline', href: '/app/deals', icon: Kanban },
    { label: 'Site Visits Tracker', href: '/app/site-visits', icon: CalendarCheck },
    { label: 'Tasks & Follow-ups', href: '/app/tasks', icon: CheckSquare },
    { label: 'WhatsApp CRM Inbox', href: '/app/whatsapp', icon: MessageSquare },
    { label: 'Ask Realty AI', href: '/app/ai', icon: Sparkles },
    { label: 'Billing & Subscriptions', href: '/app/billing', icon: CreditCard },
    { label: 'Workspace Settings', href: '/app/settings', icon: Settings },
  ];

  const filteredNav = q
    ? quickNav.filter((n) => n.label.toLowerCase().includes(q)).slice(0, 4)
    : quickNav.slice(0, 6);

  const handleSelect = (href: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2D261C]/25 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      <div className="relative w-full max-w-2xl bg-[#FFFDF8] border border-[#D4C9B9] rounded-2xl shadow-2xl overflow-hidden z-10 text-[#29251F] animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#D4C9B9] bg-[#F1ECE3]/70">
          <Search className="w-5 h-5 text-[#A374] mr-3 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads, properties, deals, tasks, or jump to page... (Esc to exit)"
            className="w-full bg-transparent text-sm text-[#29251F] placeholder:text-[#958B7D] outline-none font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#81786A] hover:text-[#29251F] p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-[#F1ECE3] text-[#625B51] rounded border border-[#D4C9B9]">
            ESC
          </span>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Leads */}
          {matchedLeads.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-[#625B51] uppercase tracking-wider px-3 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#A374]" />
                Leads
              </p>
              <div className="space-y-1">
                {matchedLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => handleSelect('/app/leads')}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F1ECE3] cursor-pointer group transition-colors"
                  >
                    <div>
                      <div className="text-sm font-bold text-[#29251F] group-hover:text-[#805B25]">
                        {lead.name}
                      </div>
                      <div className="text-xs text-[#625B51]">
                        {lead.phone} • {lead.interestedPropertyName || 'General Lead'} • {lead.status}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#625B51] group-hover:text-[#805B25] group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Properties */}
          {matchedProperties.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-[#625B51] uppercase tracking-wider px-3 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#A374]" />
                Properties
              </p>
              <div className="space-y-1">
                {matchedProperties.map((prop) => (
                  <div
                    key={prop.id}
                    onClick={() => handleSelect('/app/properties')}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F1ECE3] cursor-pointer group transition-colors"
                  >
                    <div>
                      <div className="text-sm font-bold text-[#29251F] group-hover:text-[#805B25]">
                        {prop.title}
                      </div>
                      <div className="text-xs text-[#625B51]">
                        {formatINR(prop.priceINR, true)} • {prop.locality}, {prop.city} • {prop.status}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#625B51] group-hover:text-[#805B25] group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deals */}
          {matchedDeals.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-[#625B51] uppercase tracking-wider px-3 mb-1.5 flex items-center gap-1.5">
                <Kanban className="w-3.5 h-3.5 text-[#A374]" />
                Deals Pipeline
              </p>
              <div className="space-y-1">
                {matchedDeals.map((deal) => (
                  <div
                    key={deal.id}
                    onClick={() => handleSelect('/app/deals')}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F1ECE3] cursor-pointer group transition-colors"
                  >
                    <div>
                      <div className="text-sm font-bold text-[#29251F] group-hover:text-[#805B25]">
                        {deal.title}
                      </div>
                      <div className="text-xs text-[#625B51]">
                        {formatINR(deal.dealValueINR, true)} • Stage: {deal.stage} • Probability: {deal.probability}%
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#625B51] group-hover:text-[#805B25] group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Navigation */}
          <div>
            <p className="text-[11px] font-bold text-[#625B51] uppercase tracking-wider px-3 mb-1.5">
              Quick Navigation
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {filteredNav.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.href}
                    onClick={() => handleSelect(item.href)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F1ECE3] cursor-pointer group transition-colors"
                  >
                    <div className="p-1.5 rounded-lg bg-[#E8E1D5] border border-[#D4C9B9] group-hover:bg-[#A374]/20 text-[#805B25] transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-[#29251F] group-hover:text-[#805B25]">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#E8E1D5] border-t border-[#D4C9B9] text-[11px] text-[#625B51]">
          <span>Search Velvet Code CRM</span>
          <div className="flex items-center gap-3">
            <span>
              Use <kbd className="px-1 py-0.5 rounded bg-[#F1ECE3] border border-[#D4C9B9] font-mono">↑</kbd>{' '}
              <kbd className="px-1 py-0.5 rounded bg-[#F1ECE3] border border-[#D4C9B9] font-mono">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#F1ECE3] border border-[#D4C9B9] font-mono">ESC</kbd> to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
