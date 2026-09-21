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
    name: 'Velvet Code Realty',
    slug: 'velvet-code-realty',
    businessType: 'AGENCY',
    phone: '+91 63833 95915',
    email: 'srilakshman73@gmail.com',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    address: 'Capital Park Towers, Anna Salai',
    tier: 'PROFESSIONAL',
    status: 'ACTIVE',
    usersCount: 1,
    leadsCount: 0,
    propertiesCount: 0,
    mrrINR: 0,
    createdAt: '2026-01-10T10:00:00Z',
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
          <h1 className="text-3xl font-serif font-bold text-[#2C241A] tracking-tight">Organizations & Tenants</h1>
          <p className="text-sm text-[#6A5A44] mt-1">
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
        <div className="p-3 bg-[#A37432]/15 border border-[#A37432]/30 rounded-xl text-xs text-[#7A5520] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#7A5520] flex-shrink-0" />
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
            icon={<Search className="w-4 h-4 text-[#6A5A44]" />}
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-[#FFF9F0] border border-[#D8C7A5] rounded-lg px-3 py-2 text-xs text-[#2C241A] focus:outline-none focus:border-[#A37432]"
          >
            <option value="ALL">All Tiers</option>
            <option value="STARTER">Starter Tier</option>
            <option value="PROFESSIONAL">Professional Tier</option>
            <option value="BUSINESS">Business Tier</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FFF9F0] border border-[#D8C7A5] rounded-lg px-3 py-2 text-xs text-[#2C241A] focus:outline-none focus:border-[#A37432]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PAST_DUE">Past Due</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <Card orientation="vertical" className="p-0 overflow-hidden bg-[#FFF9F0] border-[#D8C7A5] shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4EAD7] border-b border-[#D8C7A5] text-[#6A5A44]">
              <tr>
                <th className="py-3 px-4 font-semibold">Organization & ID</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold">Plan Tier</th>
                <th className="py-3 px-4 font-semibold">Usage (Users / Leads / Props)</th>
                <th className="py-3 px-4 font-semibold">MRR</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8C7A5]/60">
              {filteredTenants.map((org) => (
                <tr key={org.id} className="hover:bg-[#F7EEDC] transition-colors">
                  <td className="py-3 px-4 font-medium text-[#2C241A]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#A37432]/15 border border-[#A37432]/30 text-[#7A5520] font-serif flex items-center justify-center font-bold text-xs">
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-serif font-bold text-[#2C241A]">{org.name}</div>
                        <div className="text-[11px] text-[#6A5A44] font-mono">{org.id} &bull; {org.businessType}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#6A5A44]">
                    <div>{org.city}, {org.state}</div>
                    <div className="text-[10px] text-[#8A7A63]">{org.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={org.tier === 'BUSINESS' ? 'gold' : org.tier === 'PROFESSIONAL' ? 'info' : 'neutral'}>
                      {org.tier}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-[#6A5A44]">
                    <div className="flex items-center gap-2 font-mono">
                      <span>{org.usersCount} agents</span>
                      <span className="text-[#D8C7A5]">&bull;</span>
                      <span>{org.leadsCount} leads</span>
                      <span className="text-[#D8C7A5]">&bull;</span>
                      <span>{org.propertiesCount} props</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#547A61]">
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
                        icon={<UserCheck className="w-3.5 h-3.5 text-[#7A5520]" />}
                      >
                        Enter CRM
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleToggleStatus(org.id)}
                        className={org.status === 'ACTIVE' ? 'text-[#7A5520] hover:text-[#8A5E25]' : 'text-[#547A61]'}
                      >
                        {org.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setOrgToDelete(org)}
                        className="text-[#8B4A4A] hover:text-[#701E2B] hover:bg-[#8B4A4A]/10"
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
            <div className="flex items-start gap-3 p-3 bg-[#8B4A4A]/10 border border-[#8B4A4A]/20 rounded-xl text-[#8B4A4A] text-xs">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-[#8B4A4A] mt-0.5" />
              <div>
                <p className="font-bold text-[#8B4A4A]">Destructive Platform Action</p>
                <p className="mt-1 text-[#2C241A]">
                  Are you sure you want to permanently delete organization <strong className="text-[#8B4A4A]">{orgToDelete.name}</strong> ({orgToDelete.id})?
                </p>
                <p className="mt-1 text-[#6A5A44]">
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
