'use client';

import React, { useState } from 'react';
import { useCRMStore } from '@/lib/store';
import { Lead, LeadStatus, LeadPriority, LeadSource } from '@/types';
import { LeadStatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
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
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';

export default function LeadsPage() {
  const {
    leads,
    addLead,
    updateLead,
    deleteLead,
    importLeads,
    properties,
    users,
  } = useCRMStore();

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // New Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'WEBSITE' as LeadSource,
    status: 'NEW' as LeadStatus,
    priority: 'MEDIUM' as LeadPriority,
    budgetMaxINR: 15000000,
    preferredLocation: 'OMR, Chennai',
    interestedPropertyId: '',
    assignedToId: 'usr-admin-01',
    notes: '',
  });

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.interestedPropertyName &&
        lead.interestedPropertyName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'ALL' || lead.source === sourceFilter;
    const matchesPriority = priorityFilter === 'ALL' || lead.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesSource && matchesPriority;
  });

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    const assigned = users.find((u) => u.id === newLeadForm.assignedToId);
    const prop = properties.find((p) => p.id === newLeadForm.interestedPropertyId);

    const res = addLead({
      name: newLeadForm.name,
      phone: newLeadForm.phone,
      email: newLeadForm.email,
      source: newLeadForm.source,
      status: newLeadForm.status,
      priority: newLeadForm.priority,
      budgetMaxINR: Number(newLeadForm.budgetMaxINR),
      preferredLocation: newLeadForm.preferredLocation,
      interestedPropertyId: newLeadForm.interestedPropertyId,
      interestedPropertyName: prop ? prop.title : undefined,
      assignedToId: newLeadForm.assignedToId,
      assignedToName: assigned ? assigned.name : undefined,
      notes: newLeadForm.notes,
    });

    if (!res.success) {
      alert(res.error);
      return;
    }

    setIsAddModalOpen(false);
    setNewLeadForm({
      name: '',
      phone: '',
      email: '',
      source: 'WEBSITE',
      status: 'NEW',
      priority: 'MEDIUM',
      budgetMaxINR: 15000000,
      preferredLocation: 'OMR, Chennai',
      interestedPropertyId: '',
      assignedToId: 'usr-admin-01',
      notes: '',
    });
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Source', 'Status', 'Priority', 'Budget', 'Property', 'Score'];
    const rows = filteredLeads.map((l) => [
      `"${l.name}"`,
      `"${l.phone}"`,
      `"${l.email || ''}"`,
      l.source,
      l.status,
      l.priority,
      l.budgetMaxINR || 0,
      `"${l.interestedPropertyName || ''}"`,
      l.score,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VelvetCode_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDrawerOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#E8E1D5] text-[#29251F]">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#29251F] tracking-tight font-serif">
              Lead Management
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-[#A374]/20 text-[#805B25] border border-[#A374]/40 rounded-full">
              {filteredLeads.length} Leads
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#625B51] mt-1">
            Capture, score, qualify, and convert buyer inquiries across all channels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="subtle"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
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

      {/* Filter & View Switcher Bar */}
      <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#D4C9B9] aurum-card-shadow flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#625B51] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by name, phone, property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#E8E1D5] border border-[#D4C9B9] rounded-xl text-xs text-[#29251F] placeholder:text-[#625B51]/60 outline-none focus:border-[#A374]"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#E8E1D5] border border-[#D4C9B9] rounded-xl px-3 py-2 text-xs text-[#29251F] font-semibold outline-none focus:border-[#A374]"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New Lead</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="SITE_VISIT">Site Visit</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-[#E8E1D5] border border-[#D4C9B9] rounded-xl px-3 py-2 text-xs text-[#29251F] font-semibold outline-none focus:border-[#A374]"
          >
            <option value="ALL">All Sources</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="WEBSITE">Website</option>
            <option value="REFERRAL">Referral</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="PHONE">Phone</option>
            <option value="WALK_IN">Walk-in</option>
          </select>

          {/* View Mode Toggle */}
          <div className="bg-[#E8E1D5] border border-[#D4C9B9] p-1 rounded-xl flex items-center gap-1 ml-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-[#A374] text-[#151515]' : 'text-[#625B51] hover:text-[#29251F]'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'cards' ? 'bg-[#A374] text-[#151515]' : 'text-[#625B51] hover:text-[#29251F]'
              }`}
              title="Grid Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* LEADS LIST / TABLE / CARDS VIEW */}
      {/* ========================================== */}
      {filteredLeads.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No leads match your filter"
          description="Try clearing your search filters or add a new lead to start building your sales pipeline."
          actionLabel="Add Lead"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-[#D4C9B9] bg-[#FFFDF8] overflow-hidden aurum-card-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#E8E1D5] border-b border-[#D4C9B9] text-[#625B51] font-bold">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Interested Property</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Assigned Agent</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4C9B9]/60">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => openDetail(lead)}
                    className="hover:bg-[#F1ECE3]/40 cursor-pointer transition-colors group"
                  >
                    <td className="p-4">
                      <div className="font-bold text-[#29251F] text-sm group-hover:text-[#805B25] transition-colors">
                        {lead.name}
                      </div>
                      <div className="text-[11px] text-[#625B51] flex items-center gap-2 mt-0.5 font-medium">
                        <span>{lead.phone}</span>
                        {lead.email && <span>• {lead.email}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#E8E1D5] text-[#625B51] rounded border border-[#D4C9B9]">
                        {lead.source}
                      </span>
                    </td>
                    <td className="p-4">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="p-4 font-semibold text-[#29251F]">
                      {lead.interestedPropertyName || 'General Portfolio'}
                    </td>
                    <td className="p-4 font-bold text-[#805B25] font-mono">
                      {lead.budgetMaxINR ? formatINR(lead.budgetMaxINR, true) : 'Flexible'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-[#3D7258]">{lead.score}%</span>
                        <div className="w-12 h-1.5 bg-[#F1ECE3] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#3D7258] rounded-full"
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[#625B51] font-medium">
                      {lead.assignedToName || 'Unassigned'}
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={buildWhatsAppUrl(lead.phone, `Hello ${lead.name}, connecting regarding ${lead.interestedPropertyName || 'your inquiry'}.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-[#3D7258]/10 hover:bg-[#3D7258]/20 text-[#3D7258] border border-[#3D7258]/30 transition-colors"
                          title="Open WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`tel:${lead.phone}`}
                          className="p-1.5 rounded-lg bg-[#E8E1D5] hover:bg-[#F1ECE3] text-[#29251F] border border-[#D4C9B9] transition-colors"
                          title="Call Lead"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="p-1.5 rounded-lg text-[#625B51] hover:text-[#8B4A4A] hover:bg-[#8B4A4A]/10 transition-colors"
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
              className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#D4C9B9] hover:border-[#A374] cursor-pointer aurum-card-shadow hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <LeadStatusBadge status={lead.status} />
                  <PriorityBadge priority={lead.priority} />
                </div>

                <h3 className="text-base font-bold text-[#29251F] hover:text-[#805B25] transition-colors">
                  {lead.name}
                </h3>
                <p className="text-xs text-[#625B51] mt-0.5 font-medium">{lead.phone}</p>

                <div className="mt-3 p-3 rounded-xl bg-[#E8E1D5] border border-[#D4C9B9] text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#625B51]">Budget:</span>
                    <span className="font-bold text-[#805B25] font-mono">
                      {lead.budgetMaxINR ? formatINR(lead.budgetMaxINR, true) : 'Flexible'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#625B51]">Property:</span>
                    <span className="text-[#29251F] font-semibold truncate max-w-[160px]">
                      {lead.interestedPropertyName || 'General'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#D4C9B9] flex items-center justify-between text-xs">
                <span className="text-[#625B51]">Score: <strong className="text-[#3D7258]">{lead.score}%</strong></span>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={buildWhatsAppUrl(lead.phone, `Hello ${lead.name}, regarding your real estate inquiry.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[#3D7258]/10 text-[#3D7258] hover:bg-[#3D7258]/20"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`tel:${lead.phone}`}
                    className="p-1.5 rounded-lg bg-[#E8E1D5] text-[#29251F] border border-[#D4C9B9] hover:bg-[#F1ECE3]"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================== */}
      {/* LEAD PROFILE DETAIL DRAWER */}
      {/* ========================================== */}
      {selectedLead && (
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-bold text-[#29251F]">{selectedLead.name}</span>
              <LeadStatusBadge status={selectedLead.status} />
            </div>
          }
          subtitle={`Lead ID: ${selectedLead.id} • Conversion Probability: ${selectedLead.score}%`}
          size="lg"
        >
          <div className="space-y-6 text-xs sm:text-sm">
            {/* Quick Action Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <a
                href={buildWhatsAppUrl(selectedLead.phone, `Hello ${selectedLead.name}, connecting from Velvet Code.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#3D7258] hover:bg-[#2E5943] text-white font-bold text-xs shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp Chat
              </a>
              <a
                href={`tel:${selectedLead.phone}`}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#FFFDF8] hover:bg-[#F1ECE3] text-[#29251F] font-bold text-xs border border-[#D4C9B9]"
              >
                <Phone className="w-4 h-4 text-[#A87932]" />
                Call Phone
              </a>
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  const newStatus = selectedLead.status === 'NEGOTIATION' ? 'WON' : 'NEGOTIATION';
                  updateLead(selectedLead.id, { status: newStatus });
                  setSelectedLead({ ...selectedLead, status: newStatus });
                }}
              >
                Mark Next Stage
              </Button>
            </div>

            {/* Core Details */}
            <div className="p-4 rounded-xl bg-[#E8E1D5] border border-[#D4C9B9] space-y-3">
              <h4 className="font-bold text-[#805B25] text-xs uppercase tracking-wider">
                Contact & Profile Information
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#625B51] block">Phone Number</span>
                  <span className="text-[#29251F] font-bold">{selectedLead.phone}</span>
                </div>
                <div>
                  <span className="text-[#625B51] block">Email Address</span>
                  <span className="text-[#29251F]">{selectedLead.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#625B51] block">Lead Source</span>
                  <span className="text-[#29251F] font-medium">{selectedLead.source}</span>
                </div>
                <div>
                  <span className="text-[#625B51] block">Target Budget</span>
                  <span className="text-[#805B25] font-bold font-mono">
                    {selectedLead.budgetMaxINR ? formatINR(selectedLead.budgetMaxINR) : 'Flexible'}
                  </span>
                </div>
                <div>
                  <span className="text-[#625B51] block">Preferred City / Area</span>
                  <span className="text-[#29251F]">{selectedLead.preferredLocation || 'Chennai Metros'}</span>
                </div>
                <div>
                  <span className="text-[#625B51] block">Assigned Consultant</span>
                  <span className="text-[#29251F]">{selectedLead.assignedToName || 'Velvet Code'}</span>
                </div>
              </div>
            </div>

            {/* Interested Property */}
            <div className="p-4 rounded-xl bg-[#E8E1D5] border border-[#D4C9B9] space-y-2">
              <h4 className="font-bold text-[#805B25] text-xs uppercase tracking-wider">
                Property Interest
              </h4>
              <p className="text-sm font-bold text-[#29251F]">
                {selectedLead.interestedPropertyName || 'The Grand Emerald Heights - 3BHK'}
              </p>
            </div>

            {/* Notes & Activity */}
            <div className="p-4 rounded-xl bg-[#E8E1D5] border border-[#D4C9B9] space-y-2">
              <h4 className="font-bold text-[#805B25] text-xs uppercase tracking-wider">
                Consultant Notes
              </h4>
              <p className="text-xs text-[#625B51] leading-relaxed bg-[#FFFDF8] p-3 rounded-lg border border-[#D4C9B9]">
                {selectedLead.notes || 'No custom notes logged yet.'}
              </p>
            </div>

            {/* Realty AI Conversion Score */}
            <div className="p-4 rounded-xl bg-[#FFFDF8] border border-[#A374]/50 aurum-card-shadow space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#805B25] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Realty AI Score
                </span>
                <span className="text-lg font-extrabold text-[#3D7258]">{selectedLead.score}%</span>
              </div>
              <p className="text-xs text-[#625B51]">
                Based on verified budget, fast response rate, and site visit engagement history.
              </p>
            </div>
          </div>
        </Drawer>
      )}

      {/* ========================================== */}
      {/* ADD LEAD MODAL */}
      {/* ========================================== */}
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
            <Input
              label="Max Budget (INR)"
              type="number"
              placeholder="15000000"
              value={newLeadForm.budgetMaxINR}
              onChange={(e) =>
                setNewLeadForm({ ...newLeadForm, budgetMaxINR: Number(e.target.value) })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Lead Source"
              value={newLeadForm.source}
              onChange={(e) =>
                setNewLeadForm({ ...newLeadForm, source: e.target.value as LeadSource })
              }
              options={[
                { value: 'WEBSITE', label: 'Website Ingestion' },
                { value: 'WHATSAPP', label: 'WhatsApp Inbound' },
                { value: 'REFERRAL', label: 'Client Referral' },
                { value: 'INSTAGRAM', label: 'Instagram Ads' },
                { value: 'FACEBOOK', label: 'Facebook Campaign' },
                { value: 'PHONE', label: 'Direct Phone Call' },
                { value: 'WALK_IN', label: 'Office Walk-in' },
              ]}
            />

            <Select
              label="Initial Status"
              value={newLeadForm.status}
              onChange={(e) =>
                setNewLeadForm({ ...newLeadForm, status: e.target.value as LeadStatus })
              }
              options={[
                { value: 'NEW', label: 'New Lead' },
                { value: 'CONTACTED', label: 'Contacted' },
                { value: 'QUALIFIED', label: 'Qualified' },
                { value: 'SITE_VISIT', label: 'Site Visit' },
                { value: 'NEGOTIATION', label: 'Negotiation' },
              ]}
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

          <Textarea
            label="Initial Requirements & Notes"
            rows={3}
            placeholder="e.g. Looking for ready to move 3BHK on high floor with 2 car parks."
            value={newLeadForm.notes}
            onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4C9B9]">
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

      {/* ========================================== */}
      {/* IMPORT LEADS MODAL */}
      {/* ========================================== */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Leads from CSV / Excel"
        description="Upload your lead spreadsheet to automatically parse names, phone numbers, and budgets."
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <label className="border-2 border-dashed border-[#D4C9B9] rounded-2xl p-8 text-center bg-[#E8E1D5] hover:border-[#A374] transition-colors cursor-pointer block">
            <Upload className="w-8 h-8 text-[#805B25] mx-auto mb-2" />
            <p className="font-bold text-[#29251F]">Click to select or drop your .csv lead spreadsheet</p>
            <p className="text-[#625B51] text-xs mt-1">Supports UTF-8 CSV exports with Name, Phone, Email, Budget columns</p>
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
                    return;
                  }
                  const parsed: Partial<Lead>[] = [];
                  for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
                    if (cols[0] && cols[1]) {
                      parsed.push({
                        name: cols[0],
                        phone: cols[1],
                        email: cols[2] || undefined,
                        budgetMaxINR: cols[3] ? Number(cols[3].replace(/[^0-9]/g, '')) : undefined,
                        source: 'WEBSITE',
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
                };
                reader.readAsText(file);
              }}
            />
          </label>

          <div className="p-3.5 rounded-xl bg-[#E8E1D5] border border-[#D4C9B9] text-xs text-[#29251F]">
            <p className="font-bold text-[#805B25] mb-1">CSV Format Guidance:</p>
            <p className="text-[#625B51]">Columns: <code className="bg-white px-1 py-0.5 rounded border text-[#29251F]">Name, Phone, Email, Budget, Location</code></p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4C9B9]">
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
