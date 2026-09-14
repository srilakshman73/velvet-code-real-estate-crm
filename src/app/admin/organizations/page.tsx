'use client';

import React, { useState } from 'react';
import { useCRM } from '@/lib/store';
import { useRouter } from 'next/navigation';
import {
  Building,
  Search,
  Filter,
  MoreVertical,
  ShieldCheck,
  Ban,
  ArrowUpRight,
  ExternalLink,
  Plus,
  Download,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Trash2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { INITIAL_ORGANIZATIONS } from '@/lib/mock-data';
import { Organization, SubscriptionTier } from '@/types';

interface ExtendedOrg extends Organization {
  tier: SubscriptionTier;
  status: 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED';
  usersCount: number;
  leadsCount: number;
  propertiesCount: number;
  mrrINR: number;
}

const MOCK_TENANTS: ExtendedOrg[] = [
  {
    id: 'org-apex-01',
    name: 'Velvet Realty Solutions',
    slug: 'velvet-realty',
    businessType: 'AGENCY',
    phone: '+91 94436 47190',
    email: 'contact@velvetcode.in',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    address: '45, Anna Salai, Guindy',
    tier: 'PROFESSIONAL',
    status: 'ACTIVE',
    usersCount: 4,
    leadsCount: 24,
    propertiesCount: 12,
    mrrINR: 1499,
    createdAt: '2026-07-01T00:00:00Z',
  },
  {
    id: 'org-heritage-02',
    name: 'Heritage Luxury Estates',
    slug: 'heritage-luxury',
    businessType: 'BROKER',
    phone: '+91 80 4455 6677',
    email: 'info@heritageluxury.com',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    address: '100 Feet Road, Indiranagar',
    tier: 'BUSINESS',
    status: 'ACTIVE',
    usersCount: 12,
    leadsCount: 180,
    propertiesCount: 45,
    mrrINR: 3999,
    createdAt: '2026-06-15T00:00:00Z',
  },
  {
    id: 'org-metro-03',
    name: 'Metropolis Prime Properties',
    slug: 'metropolis-prime',
    businessType: 'BUILDER',
    phone: '+91 40 8899 0011',
    email: 'sales@metropolisprime.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    address: 'HITEC City Phase 2',
    tier: 'BUSINESS',
    status: 'ACTIVE',
    usersCount: 18,
    leadsCount: 320,
    propertiesCount: 95,
    mrrINR: 3999,
    createdAt: '2026-05-10T00:00:00Z',
  },
  {
    id: 'org-skyline-04',
    name: 'Skyline Realtors & Advisors',
    slug: 'skyline-realtors',
    businessType: 'PROPERTY_CONSULTANT',
    phone: '+91 22 7788 9900',
    email: 'hello@skylinerealtors.com',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    address: 'Bandra Kurla Complex',
    tier: 'STARTER',
    status: 'ACTIVE',
    usersCount: 2,
    leadsCount: 45,
    propertiesCount: 8,
    mrrINR: 499,
    createdAt: '2026-08-01T00:00:00Z',
  },
];

export default function AdminOrganizationsPage() {
  const { enterSupportMode } = useCRM();
  const router = useRouter();
  const [tenants, setTenants] = useState<ExtendedOrg[]>(MOCK_TENANTS);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [orgToDelete, setOrgToDelete] = useState<ExtendedOrg | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.city?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || t.tier === tierFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesTier && matchesStatus;
  });

  const handleToggleStatus = (orgId: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === orgId) {
          return {
            ...t,
            status: t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
          };
        }
        return t;
      })
    );
  };

  const handleImpersonate = (org: ExtendedOrg) => {
    enterSupportMode(org);
    router.push('/app/dashboard');
  };

  const handleDeleteOrganization = async () => {
    if (!orgToDelete) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/organizations/${orgToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok) {
        setTenants((prev) => prev.filter((t) => t.id !== orgToDelete.id));
        setFeedbackMessage(data.message || `Organization ${orgToDelete.name} and tenant records deleted successfully.`);
      } else {
        setFeedbackMessage(data.error || 'Failed to delete organization.');
      }
    } catch (err) {
      setFeedbackMessage('Failed to connect to organization deletion service.');
    } finally {
      setIsDeleting(false);
      setOrgToDelete(null);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Organizations & Tenants</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage multi-tenant brokerages, isolated database partitions, subscription tiers, and tenant lifecycle.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={() => {
              const headers = 'ID,Name,Type,City,Tier,Status,MRR,Users,Leads\n';
              const rows = tenants.map((t) => `"${t.id}","${t.name}","${t.businessType}","${t.city}","${t.tier}","${t.status}",${t.mrrINR},${t.usersCount},${t.leadsCount}`).join('\n');
              const blob = new Blob([headers + rows], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `velvet_code_tenants_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
            }}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search organizations by name, city, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-neutral-500" />}
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-300 focus:outline-none"
          >
            <option value="ALL">All Tiers</option>
            <option value="STARTER">Starter Tier</option>
            <option value="PROFESSIONAL">Professional Tier</option>
            <option value="BUSINESS">Business Tier</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PAST_DUE">Past Due</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <Card orientation="vertical" className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400">
              <tr>
                <th className="py-3 px-4 font-medium">Organization & ID</th>
                <th className="py-3 px-4 font-medium">Location</th>
                <th className="py-3 px-4 font-medium">Plan Tier</th>
                <th className="py-3 px-4 font-medium">Usage (Users / Leads / Props)</th>
                <th className="py-3 px-4 font-medium">MRR</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredTenants.map((org) => (
                <tr key={org.id} className="hover:bg-neutral-900/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm text-white font-semibold">{org.name}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">{org.id} &bull; {org.businessType}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-neutral-300">
                    <div>{org.city}, {org.state}</div>
                    <div className="text-[10px] text-neutral-500">{org.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={org.tier === 'BUSINESS' ? 'gold' : org.tier === 'PROFESSIONAL' ? 'info' : 'neutral'}>
                      {org.tier}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-neutral-300">
                    <div className="flex items-center gap-2 font-mono">
                      <span>{org.usersCount} agents</span>
                      <span className="text-neutral-600">&bull;</span>
                      <span>{org.leadsCount} leads</span>
                      <span className="text-neutral-600">&bull;</span>
                      <span>{org.propertiesCount} props</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                    ₹{org.mrrINR.toLocaleString()}/mo
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={org.status === 'ACTIVE' ? 'success' : org.status === 'PAST_DUE' ? 'warning' : 'error'}>
                      {org.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleImpersonate(org)}
                        title="Enter Tenant Workspace in Support Mode"
                        icon={<UserCheck className="w-3.5 h-3.5 text-amber-400" />}
                      >
                        Enter CRM
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleToggleStatus(org.id)}
                        className={org.status === 'ACTIVE' ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400'}
                      >
                        {org.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setOrgToDelete(org)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        title="Delete Organization"
                        icon={<Trash2 className="w-3.5 h-3.5" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirmation Modal for Destructive Delete Organization */}
      {orgToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setOrgToDelete(null)}
          title="Confirm Organization Deletion"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">Destructive Platform Action</p>
                <p className="mt-1">
                  Are you sure you want to permanently delete organization <strong className="text-white">{orgToDelete.name}</strong> ({orgToDelete.id})?
                </p>
                <p className="mt-1 text-rose-300/80">
                  This will immediately terminate all active tenant users, {orgToDelete.leadsCount} leads, {orgToDelete.propertiesCount} properties, and associated subscriptions.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOrgToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteOrganization}
                disabled={isDeleting}
                icon={<Trash2 className="w-4 h-4" />}
              >
                {isDeleting ? 'Deleting Organization...' : 'Confirm Delete Organization'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
