'use client';

import React, { useState } from 'react';
import { useCRMStore } from '@/lib/store';
import { Lead, LeadStatus, LeadPriority, LeadSource } from '@/types';
import { LeadStatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Combobox } from '@/components/ui/Combobox';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Modal, Drawer } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatINR, buildWhatsAppUrl } from '@/lib/utils';
import {
  Users,
  PlusCircle,
  Search,
  Download,
  Upload,
  Phone,
  MessageSquare,
  Trash2,
  Edit2,
  LayoutGrid,
  List,
  Sparkles,
  FileSpreadsheet,
  CheckSquare,
  Square,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react';

const PREDEFINED_LEAD_SOURCES = [
  { value: 'Website Ingestion', label: 'Website Ingestion' },
  { value: 'WhatsApp Inbound', label: 'WhatsApp Inbound' },
  { value: 'Client Referral', label: 'Client Referral' },
  { value: 'Instagram Ads', label: 'Instagram Ads' },
  { value: 'Facebook Campaign', label: 'Facebook Campaign' },
  { value: 'Direct Phone Call', label: 'Direct Phone Call' },
  { value: 'Office Walk-in', label: 'Office Walk-in' },
];

const PREDEFINED_LEAD_STATUSES = [
  { value: 'NEW', label: 'New Lead' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'SITE_VISIT', label: 'Site Visit' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
];

const PREDEFINED_LEAD_PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

/**
 * Normalizes numeric input to strip leading zeros while typing
 * 025 -> 25, 0025 -> 25, 00025000 -> 25000, empty -> empty
 */
function normalizeIntegerInput(raw: string): string {
  const digitsOnly = raw.replace(/\D/g, '');
  if (!digitsOnly) return '';
  return digitsOnly.replace(/^0+(?=\d)/, '');
}

export default function LeadsPage() {
  const {
    leads,
    addLead,
    updateLead,
    deleteLead,
    importLeads,
    properties,
    users,
    currentOrg,
  } = useCRMStore();

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Multi-Selection State
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // New Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'Website Ingestion',
    status: 'NEW',
    priority: 'MEDIUM' as LeadPriority,
    budgetMaxRaw: '',
    preferredLocation: '',
    interestedPropertyId: '',
    assignedToId: users[0]?.id || 'usr-admin-01',
    notes: '',
    imageUrl: undefined as string | undefined,
  });

  // Edit Lead Form State
  const [editLeadForm, setEditLeadForm] = useState({
    id: '',
    name: '',
    phone: '',
    email: '',
    source: '',
    status: '',
    priority: 'MEDIUM' as LeadPriority,
    budgetMaxRaw: '',
    preferredLocation: '',
    interestedPropertyId: '',
    assignedToId: '',
    notes: '',
    imageUrl: undefined as string | undefined,
  });

  // Collect all unique sources and statuses for filters
  const allKnownSources = Array.from(
    new Set([
      ...PREDEFINED_LEAD_SOURCES.map((s) => s.value),
      ...leads.map((l) => l.source).filter(Boolean),
    ])
  );

  const allKnownStatuses = Array.from(
    new Set([
      'NEW',
      'CONTACTED',
      'QUALIFIED',
      'SITE_VISIT',
      'NEGOTIATION',
      'WON',
      'LOST',
      ...leads.map((l) => l.status).filter(Boolean),
    ])
  );

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.interestedPropertyName &&
        lead.interestedPropertyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof lead.source === 'string' && lead.source.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof lead.status === 'string' && lead.status.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'ALL' || lead.source === sourceFilter;
    const matchesPriority = priorityFilter === 'ALL' || lead.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesSource && matchesPriority;
  });

  // Selection handlers
  const handleToggleSelectLead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  // Complete Multi-Sheet Excel Export Handler
  const handleExportExcel = async (selectedOnly = false) => {
    setIsExporting(true);
    setExportSuccessMsg(null);

    try {
      const targetIds = selectedOnly && selectedLeadIds.length > 0 ? selectedLeadIds : undefined;

      const response = await fetch('/api/leads/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: targetIds }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to generate Excel export workbook.');
      }

      // Read binary blob and trigger browser download
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'Velvet_Code_Real_Estate_Leads.xlsx';

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      const count = targetIds ? targetIds.length : filteredLeads.length;
      setExportSuccessMsg(`Successfully generated Excel workbook (${filename}) with ${count} leads across 4 sheets!`);
      setTimeout(() => setExportSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(`Excel Export Failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    const assigned = users.find((u) => u.id === newLeadForm.assignedToId);
    const prop = properties.find((p) => p.id === newLeadForm.interestedPropertyId);

    const budgetVal = newLeadForm.budgetMaxRaw
      ? Math.max(0, parseInt(newLeadForm.budgetMaxRaw, 10))
      : undefined;

    const res = addLead({
      name: newLeadForm.name.trim(),
      phone: newLeadForm.phone.trim(),
      email: newLeadForm.email.trim() || undefined,
      source: newLeadForm.source.trim() || 'Website Ingestion',
      status: newLeadForm.status.trim() || 'NEW',
      priority: newLeadForm.priority,
      budgetMaxINR: budgetVal,
      budgetMinINR: budgetVal ? Math.round(budgetVal * 0.7) : undefined,
      preferredLocation: newLeadForm.preferredLocation.trim() || undefined,
      interestedPropertyId: newLeadForm.interestedPropertyId || undefined,
      interestedPropertyName: prop ? prop.title : undefined,
      assignedToId: newLeadForm.assignedToId || undefined,
      assignedToName: assigned ? assigned.name : undefined,
      notes: newLeadForm.notes.trim() || undefined,
      imageUrl: newLeadForm.imageUrl,
    });

    if (!res.success) {
      alert(res.error);
      return;
    }

    // Reset Form
    setNewLeadForm({
      name: '',
      phone: '',
      email: '',
      source: 'Website Ingestion',
      status: 'NEW',
      priority: 'MEDIUM',
      budgetMaxRaw: '',
      preferredLocation: '',
      interestedPropertyId: '',
      assignedToId: users[0]?.id || 'usr-admin-01',
      notes: '',
      imageUrl: undefined,
    });

    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (lead: Lead) => {
    setEditLeadForm({
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email || '',
      source: lead.source || 'Website Ingestion',
      status: lead.status || 'NEW',
      priority: lead.priority || 'MEDIUM',
      budgetMaxRaw: lead.budgetMaxINR !== undefined ? String(lead.budgetMaxINR) : '',
      preferredLocation: lead.preferredLocation || '',
      interestedPropertyId: lead.interestedPropertyId || '',
      assignedToId: lead.assignedToId || '',
      notes: lead.notes || '',
      imageUrl: lead.imageUrl,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLeadForm.id) return;

    const assigned = users.find((u) => u.id === editLeadForm.assignedToId);
    const prop = properties.find((p) => p.id === editLeadForm.interestedPropertyId);

    const budgetVal = editLeadForm.budgetMaxRaw
      ? Math.max(0, parseInt(editLeadForm.budgetMaxRaw, 10))
      : undefined;

    const updates: Partial<Lead> = {
      name: editLeadForm.name.trim(),
      phone: editLeadForm.phone.trim(),
      email: editLeadForm.email.trim() || undefined,
      source: editLeadForm.source.trim() || 'Website Ingestion',
      status: editLeadForm.status.trim() || 'NEW',
      priority: editLeadForm.priority,
      budgetMaxINR: budgetVal,
      preferredLocation: editLeadForm.preferredLocation.trim() || undefined,
      interestedPropertyId: editLeadForm.interestedPropertyId || undefined,
      interestedPropertyName: prop ? prop.title : undefined,
      assignedToId: editLeadForm.assignedToId || undefined,
      assignedToName: assigned ? assigned.name : undefined,
      notes: editLeadForm.notes.trim() || undefined,
      imageUrl: editLeadForm.imageUrl,
    };

    updateLead(editLeadForm.id, updates);

    if (selectedLead && selectedLead.id === editLeadForm.id) {
      setSelectedLead({ ...selectedLead, ...updates });
    }

    setIsEditModalOpen(false);
  };

  const openDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDrawerOpen(true);
  };

  // Helper for lead initial badge
  const getLeadInitials = (name: string) => {
    return (
      name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'L'
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#FCECEF] text-[#3A2930]">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#3A2930] tracking-tight font-serif">
              Lead Management
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-[#B86B84]/15 text-[#8C455C] border border-[#B86B84]/30 rounded-full">
              {filteredLeads.length} Leads
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#765D66] mt-1">
            Capture, score, qualify, and convert buyer inquiries across all channels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Excel Export Button */}
          <Button
            variant="subtle"
            size="sm"
            onClick={() => handleExportExcel(false)}
            disabled={isExporting}
            leftIcon={
              isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8C455C]" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#4A7C59]" />
              )
            }
          >
            {isExporting ? 'Generating Excel...' : 'Export Excel (.xlsx)'}
          </Button>

          <Button
            variant="subtle"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            leftIcon={<Upload className="w-3.5 h-3.5" />}
          >
            Import
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Add New Lead
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {exportSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-[#4A7C59]/15 border border-[#4A7C59]/30 text-xs text-[#4A7C59] flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#4A7C59]" />
            <span className="font-semibold">{exportSuccessMsg}</span>
          </div>
          <button onClick={() => setExportSuccessMsg(null)} className="text-[#4A7C59] hover:text-[#3A2930]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Multi-Select Floating Action Bar */}
      {selectedLeadIds.length > 0 && (
        <div className="p-3.5 rounded-xl bg-[#3A2930] text-[#FFF9FA] border border-[#B86B84] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-slide-down">
          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-0.5 rounded-md bg-[#B86B84] text-white font-mono font-bold">
              {selectedLeadIds.length} Selected
            </span>
            <span>Leads chosen for export</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="gold"
              size="xs"
              onClick={() => handleExportExcel(true)}
              disabled={isExporting}
              leftIcon={
                isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                )
              }
            >
              {isExporting ? 'Exporting...' : `Export Selected (${selectedLeadIds.length})`}
            </Button>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => setSelectedLeadIds([])}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Filter & View Switcher Bar */}
      <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#EBCBD4] shadow-[0_8px_24px_rgba(120,90,40,0.08)] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#9B828C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by name, phone, source, property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FFF5F7] border border-[#EBCBD4] rounded-xl text-xs text-[#3A2930] placeholder:text-[#9B828C] outline-none focus:border-[#B86B84]"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FFF5F7] border border-[#EBCBD4] rounded-xl px-3 py-2 text-xs text-[#3A2930] font-semibold outline-none focus:border-[#B86B84]"
          >
            <option value="ALL">All Statuses</option>
            {allKnownStatuses.map((st) => {
              const matched = PREDEFINED_LEAD_STATUSES.find((p) => p.value === st);
              return (
                <option key={st} value={st}>
                  {matched ? matched.label : st}
                </option>
              );
            })}
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-[#FFF5F7] border border-[#EBCBD4] rounded-xl px-3 py-2 text-xs text-[#3A2930] font-semibold outline-none focus:border-[#B86B84]"
          >
            <option value="ALL">All Sources</option>
            {allKnownSources.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#FFF5F7] border border-[#EBCBD4] rounded-xl px-3 py-2 text-xs text-[#3A2930] font-semibold outline-none focus:border-[#B86B84]"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* View Switcher */}
          <div className="bg-[#FFF5F7] border border-[#EBCBD4] p-1 rounded-xl flex items-center gap-1 ml-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-[#B86B84] text-white shadow-sm' : 'text-[#765D66] hover:text-[#3A2930]'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'cards' ? 'bg-[#B86B84] text-white shadow-sm' : 'text-[#765D66] hover:text-[#3A2930]'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Leads View */}
      {filteredLeads.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No leads found"
          description={searchTerm ? "No leads matched your search criteria." : "Start by adding your first luxury buyer lead inquiry."}
          actionLabel="Add New Lead"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-[#EBCBD4] bg-[#FFF9FA] overflow-hidden shadow-[0_8px_24px_rgba(120,90,40,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FFF5F7] border-b border-[#EBCBD4] text-[#765D66] font-semibold">
                  <th className="p-4 w-10">
                    <button
                      onClick={handleSelectAllFiltered}
                      className="text-[#8C455C] hover:text-[#3A2930] transition-colors"
                      title="Select / Deselect All"
                    >
                      {selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#B86B84]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">Buyer Lead</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Interested Property</th>
                  <th className="p-4">Max Budget</th>
                  <th className="p-4">AI Score</th>
                  <th className="p-4">Assigned Consultant</th>
                  <th className="p-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBCBD4]/60">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => openDetail(lead)}
                    className={`hover:bg-[#F7EEDC] cursor-pointer transition-colors ${
                      selectedLeadIds.includes(lead.id) ? 'bg-[#B86B84]/10' : ''
                    }`}
                  >
                    <td className="p-4" onClick={(e) => handleToggleSelectLead(lead.id, e)}>
                      {selectedLeadIds.includes(lead.id) ? (
                        <CheckSquare className="w-4 h-4 text-[#B86B84]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#9B828C]" />
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {lead.imageUrl ? (
                          <img
                            src={lead.imageUrl}
                            alt={lead.name}
                            className="w-8 h-8 rounded-lg object-cover border border-[#EBCBD4] flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-[#FFF5F7] border border-[#EBCBD4] text-[#8C455C] font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {getLeadInitials(lead.name)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-[#3A2930] hover:text-[#8C455C]">{lead.name}</div>
                          <div className="text-[10px] text-[#9B828C]">{lead.preferredLocation || 'Tamil Nadu'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[#3A2930]">{lead.phone}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#FFF5F7] text-[#765D66] rounded border border-[#EBCBD4]">
                        {lead.source}
                      </span>
                    </td>
                    <td className="p-4">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="p-4 font-semibold text-[#3A2930]">
                      {lead.interestedPropertyName || 'General Portfolio'}
                    </td>
                    <td className="p-4 font-bold text-[#8C455C] font-mono">
                      {lead.budgetMaxINR ? formatINR(lead.budgetMaxINR, true) : 'Flexible'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-[#4A7C59]">{lead.score}%</span>
                        <div className="w-12 h-1.5 bg-[#FFF5F7] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#4A7C59] rounded-full"
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[#765D66] font-medium">
                      {lead.assignedToName || 'Unassigned'}
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(lead)}
                          className="p-1.5 rounded-lg bg-[#FFF5F7] hover:bg-[#FCECEF] text-[#3A2930] border border-[#EBCBD4] transition-colors cursor-pointer"
                          title="Edit Lead"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#8C455C]" />
                        </button>
                        <a
                          href={buildWhatsAppUrl(lead.phone, `Hello ${lead.name}, connecting regarding ${lead.interestedPropertyName || 'your inquiry'}.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-[#4A7C59]/10 hover:bg-[#4A7C59]/20 text-[#4A7C59] border border-[#4A7C59]/30 transition-colors"
                          title="Open WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`tel:${lead.phone}`}
                          className="p-1.5 rounded-lg bg-[#FFF5F7] hover:bg-[#FCECEF] text-[#3A2930] border border-[#EBCBD4] transition-colors"
                          title="Call Lead"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="p-1.5 rounded-lg text-[#765D66] hover:text-[#A84355] hover:bg-[#A84355]/10 transition-colors cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              onClick={() => openDetail(lead)}
              className={`p-5 rounded-2xl bg-[#FFF9FA] border hover:border-[#B86B84] cursor-pointer shadow-[0_8px_24px_rgba(120,90,40,0.08)] hover:shadow-md transition-all space-y-3 flex flex-col justify-between ${
                selectedLeadIds.includes(lead.id) ? 'border-[#B86B84] ring-2 ring-[#B86B84]/20' : 'border-[#EBCBD4]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleToggleSelectLead(lead.id, e)}
                      className="text-[#8C455C]"
                    >
                      {selectedLeadIds.includes(lead.id) ? (
                        <CheckSquare className="w-4 h-4 text-[#B86B84]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#9B828C]" />
                      )}
                    </button>
                    <LeadStatusBadge status={lead.status} />
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#FFF5F7] text-[#765D66] rounded border border-[#EBCBD4]">
                      {lead.source}
                    </span>
                  </div>
                  <PriorityBadge priority={lead.priority} />
                </div>

                <div className="flex items-center gap-3">
                  {lead.imageUrl ? (
                    <img
                      src={lead.imageUrl}
                      alt={lead.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#EBCBD4] flex-shrink-0 shadow-2xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#FFF5F7] border border-[#EBCBD4] text-[#8C455C] font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-2xs">
                      {getLeadInitials(lead.name)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-[#3A2930] hover:text-[#8C455C] transition-colors">
                      {lead.name}
                    </h3>
                    <p className="text-xs text-[#765D66] mt-0.5 font-medium">{lead.phone}</p>
                  </div>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-[#FFF5F7] border border-[#EBCBD4] text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#765D66]">Budget:</span>
                    <span className="font-bold text-[#8C455C] font-mono">
                      {lead.budgetMaxINR ? formatINR(lead.budgetMaxINR, true) : 'Flexible'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#765D66]">Property:</span>
                    <span className="text-[#3A2930] font-semibold truncate max-w-[160px]">
                      {lead.interestedPropertyName || 'General Portfolio'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EBCBD4] flex items-center justify-between text-xs">
                <span className="text-[#765D66]">Score: <strong className="text-[#4A7C59]">{lead.score}%</strong></span>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleOpenEdit(lead)}
                    className="p-1.5 rounded-lg bg-[#FFF5F7] text-[#8C455C] border border-[#EBCBD4] hover:bg-[#FCECEF] cursor-pointer"
                    title="Edit Lead"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={buildWhatsAppUrl(lead.phone, `Hello ${lead.name}, regarding your real estate inquiry.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[#4A7C59]/10 text-[#4A7C59] hover:bg-[#4A7C59]/20"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`tel:${lead.phone}`}
                    className="p-1.5 rounded-lg bg-[#FFF5F7] text-[#3A2930] border border-[#EBCBD4] hover:bg-[#FCECEF]"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LEAD PROFILE DETAIL DRAWER */}
      {selectedLead && (
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-bold text-[#3A2930]">{selectedLead.name}</span>
              <LeadStatusBadge status={selectedLead.status} />
            </div>
          }
          subtitle={`Lead ID: ${selectedLead.id} â€¢ Conversion Probability: ${selectedLead.score}%`}
          size="lg"
        >
          <div className="space-y-6 text-xs sm:text-sm">
            {/* Lead Image Display */}
            {selectedLead.imageUrl ? (
              <div className="relative h-52 w-full rounded-2xl overflow-hidden border border-[#EBCBD4] bg-[#FCECEF] shadow-2xs">
                <img
                  src={selectedLead.imageUrl}
                  alt={selectedLead.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#FFF5F7] border border-[#EBCBD4] flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#FFF9FA] border border-[#EBCBD4] text-[#8C455C] font-bold text-base flex items-center justify-center shadow-2xs">
                  {getLeadInitials(selectedLead.name)}
                </div>
                <div>
                  <h4 className="font-bold text-[#3A2930] text-sm">{selectedLead.name}</h4>
                  <p className="text-xs text-[#765D66]">No custom lead photo attached yet.</p>
                </div>
              </div>
            )}

            {/* Quick Action Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                href={buildWhatsAppUrl(selectedLead.phone, `Hello ${selectedLead.name}, connecting from Velvet Code.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#4A7C59] hover:bg-[#43644e] text-white font-bold text-xs shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                WhatsApp
              </a>
              <a
                href={`tel:${selectedLead.phone}`}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#FFF9FA] hover:bg-[#FFF5F7] text-[#3A2930] font-bold text-xs border border-[#EBCBD4]"
              >
                <Phone className="w-3.5 h-3.5 text-[#D98FA5]" />
                Call Phone
              </a>
              <Button
                variant="subtle"
                size="xs"
                onClick={() => handleOpenEdit(selectedLead)}
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              >
                Edit Lead
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  const newStatus = selectedLead.status === 'NEGOTIATION' ? 'WON' : 'NEGOTIATION';
                  updateLead(selectedLead.id, { status: newStatus });
                  setSelectedLead({ ...selectedLead, status: newStatus });
                }}
              >
                Mark Stage
              </Button>
            </div>

            {/* Core Details */}
            <div className="p-4 rounded-xl bg-[#FFF5F7] border border-[#EBCBD4] space-y-3">
              <h4 className="font-bold text-[#8C455C] text-xs uppercase tracking-wider">
                Contact & Profile Information
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#765D66] block">Phone Number</span>
                  <span className="text-[#3A2930] font-bold">{selectedLead.phone}</span>
                </div>
                <div>
                  <span className="text-[#765D66] block">Email Address</span>
                  <span className="text-[#3A2930]">{selectedLead.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#765D66] block">Lead Source</span>
                  <span className="text-[#3A2930] font-bold">{selectedLead.source}</span>
                </div>
                <div>
                  <span className="text-[#765D66] block">Status</span>
                  <span className="text-[#3A2930] font-bold">{selectedLead.status}</span>
                </div>
                <div>
                  <span className="text-[#765D66] block">Target Budget</span>
                  <span className="text-[#8C455C] font-bold font-mono">
                    {selectedLead.budgetMaxINR ? formatINR(selectedLead.budgetMaxINR) : 'Flexible'}
                  </span>
                </div>
                <div>
                  <span className="text-[#765D66] block">Preferred City / Area</span>
                  <span className="text-[#3A2930] font-medium">{selectedLead.preferredLocation || 'Chennai Metros'}</span>
                </div>
                <div>
                  <span className="text-[#765D66] block">Assigned Consultant</span>
                  <span className="text-[#3A2930] font-medium">{selectedLead.assignedToName || 'Sri Lakshman (OWNER)'}</span>
                </div>
              </div>
            </div>

            {/* Interested Property */}
            <div className="p-4 rounded-xl bg-[#FFF5F7] border border-[#EBCBD4] space-y-2">
              <h4 className="font-bold text-[#8C455C] text-xs uppercase tracking-wider">
                Property Interest
              </h4>
              <p className="text-sm font-bold text-[#3A2930]">
                {selectedLead.interestedPropertyName || 'General Portfolio'}
              </p>
            </div>

            {/* Notes & Activity */}
            <div className="p-4 rounded-xl bg-[#FFF5F7] border border-[#EBCBD4] space-y-2">
              <h4 className="font-bold text-[#8C455C] text-xs uppercase tracking-wider">
                Consultant Notes
              </h4>
              <p className="text-xs text-[#765D66] leading-relaxed bg-[#FFF9FA] p-3 rounded-lg border border-[#EBCBD4]">
                {selectedLead.notes || 'No custom notes logged yet.'}
              </p>
            </div>

            {/* Realty AI Conversion Score */}
            <div className="p-4 rounded-xl bg-[#FFF9FA] border border-[#B86B84]/50 shadow-[0_8px_24px_rgba(120,90,40,0.08)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8C455C] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Realty AI Score
                </span>
                <span className="text-lg font-extrabold text-[#4A7C59]">{selectedLead.score}%</span>
              </div>
              <p className="text-xs text-[#765D66]">
                Based on verified budget, fast response rate, and site visit engagement history.
              </p>
            </div>
          </div>
        </Drawer>
      )}

      {/* ADD LEAD MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Real Estate Lead"
        description="Enter buyer contact information, budget, and interested property."
      >
        <form onSubmit={handleCreateLead} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Buyer Full Name *"
              required
              placeholder="e.g. Senthil Nathan"
              value={newLeadForm.name}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
            />
            <Input
              label="Phone / WhatsApp Number *"
              required
              placeholder="+91 98400 11223"
              value={newLeadForm.phone}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="senthil@gmail.com"
              value={newLeadForm.email}
              onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
            />
            {/* Max Budget with Normalized Input (No leading zeros, empty state preserved) */}
            <Input
              label="Max Budget (INR)"
              type="text"
              placeholder="e.g. 2500000"
              value={newLeadForm.budgetMaxRaw}
              onChange={(e) =>
                setNewLeadForm({
                  ...newLeadForm,
                  budgetMaxRaw: normalizeIntegerInput(e.target.value),
                })
              }
              helperText={
                newLeadForm.budgetMaxRaw
                  ? `Formatted: ${formatINR(parseInt(newLeadForm.budgetMaxRaw, 10))}`
                  : undefined
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Searchable Combobox with Custom Typing for Lead Source */}
            <Combobox
              label="Lead Source"
              value={newLeadForm.source}
              onChange={(val) => setNewLeadForm({ ...newLeadForm, source: val })}
              options={PREDEFINED_LEAD_SOURCES}
              placeholder="Select or type custom source..."
              allowCustom={true}
            />

            {/* Searchable Combobox with Custom Typing for Initial Status */}
            <Combobox
              label="Initial Status"
              value={newLeadForm.status}
              onChange={(val) => setNewLeadForm({ ...newLeadForm, status: val })}
              options={PREDEFINED_LEAD_STATUSES}
              placeholder="Select or type custom status..."
              allowCustom={true}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Interested Property"
              value={newLeadForm.interestedPropertyId}
              onChange={(e) =>
                setNewLeadForm({ ...newLeadForm, interestedPropertyId: e.target.value })
              }
            >
              <option value="">Select property...</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({formatINR(p.priceINR, true)})
                </option>
              ))}
            </Select>

            <Select
              label="Assigned Agent"
              value={newLeadForm.assignedToId}
              onChange={(e) =>
                setNewLeadForm({ ...newLeadForm, assignedToId: e.target.value })
              }
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Preferred City / Area"
              placeholder="e.g. OMR Expressway, Chennai"
              value={newLeadForm.preferredLocation}
              onChange={(e) =>
                setNewLeadForm({ ...newLeadForm, preferredLocation: e.target.value })
              }
            />
            <Combobox
              label="Lead Priority"
              value={newLeadForm.priority}
              onChange={(val) => setNewLeadForm({ ...newLeadForm, priority: val as LeadPriority })}
              options={PREDEFINED_LEAD_PRIORITIES}
              placeholder="Select priority..."
              allowCustom={false}
            />
          </div>

          {/* Lead Photo / Property Image Upload Field */}
          <ImageUpload
            label="Lead / Property Image"
            value={newLeadForm.imageUrl}
            onChange={(img) => setNewLeadForm({ ...newLeadForm, imageUrl: img })}
            placeholderText="Click or drop lead/property photo to attach (JPG, JPEG, PNG)"
            helperText="Upload JPG, JPEG, or PNG photo (Max 5MB)"
          />

          <Textarea
            label="Initial Requirements & Notes"
            rows={3}
            placeholder="e.g. Looking for ready to move 3BHK on high floor with 2 car parks."
            value={newLeadForm.notes}
            onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EBCBD4]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="md" className="font-bold">
              Save Lead
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT LEAD MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Lead Information"
        description="Update buyer profile, custom status, budget, and image."
      >
        <form onSubmit={handleSaveEditLead} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Buyer Full Name *"
              required
              value={editLeadForm.name}
              onChange={(e) => setEditLeadForm({ ...editLeadForm, name: e.target.value })}
            />
            <Input
              label="Phone / WhatsApp Number *"
              required
              value={editLeadForm.phone}
              onChange={(e) => setEditLeadForm({ ...editLeadForm, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              value={editLeadForm.email}
              onChange={(e) => setEditLeadForm({ ...editLeadForm, email: e.target.value })}
            />
            {/* Max Budget with Normalized Input (No leading zeros, empty state preserved) */}
            <Input
              label="Max Budget (INR)"
              type="text"
              placeholder="e.g. 2500000"
              value={editLeadForm.budgetMaxRaw}
              onChange={(e) =>
                setEditLeadForm({
                  ...editLeadForm,
                  budgetMaxRaw: normalizeIntegerInput(e.target.value),
                })
              }
              helperText={
                editLeadForm.budgetMaxRaw
                  ? `Formatted: ${formatINR(parseInt(editLeadForm.budgetMaxRaw, 10))}`
                  : undefined
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Searchable Combobox with Custom Typing for Lead Source */}
            <Combobox
              label="Lead Source"
              value={editLeadForm.source}
              onChange={(val) => setEditLeadForm({ ...editLeadForm, source: val })}
              options={PREDEFINED_LEAD_SOURCES}
              placeholder="Select or type custom source..."
              allowCustom={true}
            />

            {/* Searchable Combobox with Custom Typing for Status */}
            <Combobox
              label="Status"
              value={editLeadForm.status}
              onChange={(val) => setEditLeadForm({ ...editLeadForm, status: val })}
              options={PREDEFINED_LEAD_STATUSES}
              placeholder="Select or type custom status..."
              allowCustom={true}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Interested Property"
              value={editLeadForm.interestedPropertyId}
              onChange={(e) =>
                setEditLeadForm({ ...editLeadForm, interestedPropertyId: e.target.value })
              }
            >
              <option value="">Select property...</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({formatINR(p.priceINR, true)})
                </option>
              ))}
            </Select>

            <Select
              label="Assigned Agent"
              value={editLeadForm.assignedToId}
              onChange={(e) =>
                setEditLeadForm({ ...editLeadForm, assignedToId: e.target.value })
              }
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Preferred City / Area"
              value={editLeadForm.preferredLocation}
              onChange={(e) =>
                setEditLeadForm({ ...editLeadForm, preferredLocation: e.target.value })
              }
            />
            <Combobox
              label="Lead Priority"
              value={editLeadForm.priority}
              onChange={(val) => setEditLeadForm({ ...editLeadForm, priority: val as LeadPriority })}
              options={PREDEFINED_LEAD_PRIORITIES}
              placeholder="Select priority..."
              allowCustom={false}
            />
          </div>

          {/* Lead Photo / Property Image Upload Field */}
          <ImageUpload
            label="Lead / Property Image"
            value={editLeadForm.imageUrl}
            onChange={(img) => setEditLeadForm({ ...editLeadForm, imageUrl: img })}
            placeholderText="Click or drop lead/property photo to attach (JPG, JPEG, PNG)"
            helperText="Upload JPG, JPEG, or PNG photo (Max 5MB)"
          />

          <Textarea
            label="Consultant Notes"
            rows={3}
            value={editLeadForm.notes}
            onChange={(e) => setEditLeadForm({ ...editLeadForm, notes: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EBCBD4]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="md" className="font-bold">
              Update Lead
            </Button>
          </div>
        </form>
      </Modal>

      {/* IMPORT LEADS MODAL */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Leads from CSV / Excel"
        description="Upload your lead spreadsheet to automatically parse names, phone numbers, and budgets."
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <label className="border-2 border-dashed border-[#EBCBD4] rounded-2xl p-8 text-center bg-[#FFF5F7] hover:border-[#B86B84] transition-colors cursor-pointer block">
            <Upload className="w-8 h-8 text-[#8C455C] mx-auto mb-2" />
            <p className="font-bold text-[#3A2930]">Click to select or drop your .csv lead spreadsheet</p>
            <p className="text-[#765D66] text-xs mt-1">Supports UTF-8 CSV exports with Name, Phone, Email, Budget columns</p>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  const text = event.target?.result as string;
                  if (!text) return;
                  const lines = text.split('\n').filter((l) => l.trim().length > 0);
                  if (lines.length <= 1) {
                    alert('No lead rows found in the selected CSV.');
                  } else {
                    const parsed: Partial<Lead>[] = [];
                    for (let i = 1; i < lines.length; i++) {
                      const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
                      if (cols[0] && cols[1]) {
                        const rawBudget = cols[3] ? normalizeIntegerInput(cols[3]) : '';
                        parsed.push({
                          name: cols[0],
                          phone: cols[1],
                          email: cols[2] || undefined,
                          budgetMaxINR: rawBudget ? parseInt(rawBudget, 10) : undefined,
                          source: cols[4] || 'Website Ingestion',
                          status: 'NEW',
                        });
                      }
                    }
                    if (parsed.length > 0) {
                      const count = importLeads(parsed);
                      alert(`Successfully imported ${count} leads.`);
                      setIsImportModalOpen(false);
                    } else {
                      alert('Could not parse any valid leads. Please ensure Column 1 is Name and Column 2 is Phone.');
                    }
                  }
                };
                reader.readAsText(file);
              }}
            />
          </label>

          <div className="p-3.5 rounded-xl bg-[#FFF5F7] border border-[#EBCBD4] text-xs text-[#3A2930]">
            <p className="font-bold text-[#8C455C] mb-1">CSV Format Guidance:</p>
            <p className="text-[#765D66]">Columns: <code className="bg-[#FFF9FA] px-1 py-0.5 rounded border border-[#EBCBD4] text-[#3A2930]">Name, Phone, Email, Budget, Source</code></p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EBCBD4]">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsImportModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

