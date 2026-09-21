'use client';

import React, { useState } from 'react';
import { useCRMStore } from '@/lib/store';
import { Client } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal, Drawer } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatINR, buildWhatsAppUrl } from '@/lib/utils';
import {
  UserCheck,
  PlusCircle,
  Search,
  MessageSquare,
  Phone,
  Building,
  DollarSign,
  FileText,
  CalendarCheck,
  Sparkles,
} from 'lucide-react';

export default function ClientsPage() {
  const { clients, addClient, updateClient, deals, siteVisits } = useCRMStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [newClientForm, setNewClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    budgetINR: 25000000,
    preferredLocation: 'ECR & OMR, Chennai',
    requirements: 'Luxury residential villas & commercial office suites.',
    notes: 'Long-term client relationship.',
  });

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    addClient({
      name: newClientForm.name,
      phone: newClientForm.phone,
      email: newClientForm.email,
      budgetINR: Number(newClientForm.budgetINR),
      preferredLocation: newClientForm.preferredLocation,
      requirements: newClientForm.requirements,
      notes: newClientForm.notes,
    });
    setIsAddModalOpen(false);
    setNewClientForm({
      name: '',
      phone: '',
      email: '',
      budgetINR: 25000000,
      preferredLocation: 'ECR & OMR, Chennai',
      requirements: '',
      notes: '',
    });
  };

  const openDetail = (client: Client) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#E9DFC8] text-[#2C241A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C241A] tracking-tight">
              Converted Clients
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-[#547A61]/15 text-[#547A61] border border-[#547A61]/30 rounded-full">
              {filteredClients.length} Active Clients
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6A5A44] mt-1">
            Manage your active buyers, repeat real estate investors, and high-net-worth customer portfolios.
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Add Client
        </Button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#FFF9F0] border border-[#D8C7A5] shadow-[0_8px_24px_rgba(120,90,40,0.08)] flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-[#8A7A63] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients by name, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F4EAD7] border border-[#D8C7A5] rounded-xl text-xs text-[#2C241A] placeholder:text-[#8A7A63] outline-none focus:border-[#A37432]"
          />
        </div>
      </div>

      {/* Clients Cards Grid */}
      {filteredClients.length === 0 ? (
        <EmptyState
          icon={<UserCheck className="w-8 h-8" />}
          title="No clients found"
          description="Converted leads automatically transition into clients once their first deal is closed won."
          actionLabel="Add Client"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              onClick={() => openDetail(client)}
              className="p-6 rounded-2xl bg-[#FFF9F0] border border-[#D8C7A5] hover:border-[#A37432] cursor-pointer shadow-[0_8px_24px_rgba(120,90,40,0.08)] hover:shadow-[0_8px_24px_rgba(163,116,50,0.15)] transition-all space-y-4 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#547A61]/15 text-[#547A61] border border-[#547A61]/30 rounded-md">
                    Verified Buyer
                  </span>
                  <span className="text-xs text-[#6A5A44]">
                    {client.totalDealsCount} Closed Deal{client.totalDealsCount > 1 ? 's' : ''}
                  </span>
                </div>

                <h3 className="text-lg font-serif font-bold text-[#2C241A] mt-3 group-hover:text-[#7A5520] transition-colors">
                  {client.name}
                </h3>
                <p className="text-xs text-[#6A5A44] mt-0.5 font-medium">{client.phone}</p>

                <div className="mt-4 p-3 rounded-xl bg-[#F4EAD7] border border-[#D8C7A5] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#6A5A44]">Lifetime Transactions:</span>
                    <span className="font-bold text-[#7A5520] font-mono">
                      {client.totalDealsValueINR ? formatINR(client.totalDealsValueINR, true) : '₹5.20 Cr'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6A5A44]">Preferred Hub:</span>
                    <span className="text-[#2C241A] truncate max-w-[180px] font-medium">
                      {client.preferredLocation || 'South India Metros'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#D8C7A5] flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                <span className="text-[#6A5A44] font-serif font-semibold">VIP Investor</span>
                <div className="flex items-center gap-2">
                  <a
                    href={buildWhatsAppUrl(client.phone, `Hello ${client.name}, connecting from Velvet Code.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-[#547A61]/10 text-[#547A61] hover:bg-[#547A61]/20 border border-[#547A61]/30 transition-colors"
                    title="WhatsApp Client"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`tel:${client.phone}`}
                    className="p-2 rounded-lg bg-[#F4EAD7] border border-[#D8C7A5] text-[#2C241A] hover:bg-[#E9DFC8] transition-colors"
                    title="Call Client"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#6A5A44]" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      {selectedClient && (
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={selectedClient.name}
          subtitle={`Client ID: ${selectedClient.id} • Converted Customer Profile`}
          size="lg"
        >
          <div className="space-y-6 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-[#FFF9F0] border border-[#D8C7A5] space-y-3">
              <h4 className="font-bold text-[#7A5520] font-serif uppercase tracking-wider text-xs">
                Contact & Investment Profile
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#6A5A44] block">Phone</span>
                  <span className="text-[#2C241A] font-semibold">{selectedClient.phone}</span>
                </div>
                <div>
                  <span className="text-[#6A5A44] block">Email</span>
                  <span className="text-[#2C241A]">{selectedClient.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#6A5A44] block">Target Budget</span>
                  <span className="text-[#7A5520] font-bold font-mono">
                    {selectedClient.budgetINR ? formatINR(selectedClient.budgetINR) : '₹5.0 Cr+'}
                  </span>
                </div>
                <div>
                  <span className="text-[#6A5A44] block">Preferred Area</span>
                  <span className="text-[#2C241A]">{selectedClient.preferredLocation}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF9F0] border border-[#D8C7A5] space-y-2">
              <h4 className="font-bold text-[#7A5520] font-serif uppercase tracking-wider text-xs">
                Portfolio Requirements
              </h4>
              <p className="text-xs text-[#2C241A] bg-[#F4EAD7] p-3 rounded-lg border border-[#D8C7A5]">
                {selectedClient.requirements || 'Looking for beachside vacation homes and high ROI rental suites.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF9F0] border border-[#D8C7A5] space-y-2">
              <h4 className="font-bold text-[#7A5520] font-serif uppercase tracking-wider text-xs">
                Client History & Notes
              </h4>
              <p className="text-xs text-[#2C241A] bg-[#F4EAD7] p-3 rounded-lg border border-[#D8C7A5]">
                {selectedClient.notes || 'VIP Customer with verified funds.'}
              </p>
            </div>
          </div>
        </Drawer>
      )}

      {/* Add Client Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Converted Client"
        description="Register a verified buyer or investor into your client directory."
      >
        <form onSubmit={handleCreateClient} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Client Name *"
              required
              placeholder="e.g. Ramesh Balaji"
              value={newClientForm.name}
              onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
            />
            <Input
              label="Phone Number *"
              required
              placeholder="+91 98765 43210"
              value={newClientForm.phone}
              onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="client@domain.com"
              value={newClientForm.email}
              onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
            />
            <Input
              label="Investment Capacity (INR)"
              type="number"
              value={newClientForm.budgetINR}
              onChange={(e) =>
                setNewClientForm({ ...newClientForm, budgetINR: Number(e.target.value) })
              }
            />
          </div>

          <Input
            label="Preferred Location"
            placeholder="e.g. Whitefield, Bangalore"
            value={newClientForm.preferredLocation}
            onChange={(e) =>
              setNewClientForm({ ...newClientForm, preferredLocation: e.target.value })
            }
          />

          <Textarea
            label="Investment Requirements"
            rows={3}
            placeholder="e.g. 4BHK Villa in gated community with private garden."
            value={newClientForm.requirements}
            onChange={(e) =>
              setNewClientForm({ ...newClientForm, requirements: e.target.value })
            }
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D8C7A5]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="md" className="font-bold">
              Save Client
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
