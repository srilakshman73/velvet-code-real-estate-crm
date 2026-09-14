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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Converted Clients
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
              {filteredClients.length} Active Clients
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
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
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/90 shadow-md flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients by name, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 outline-none focus:border-amber-400/80"
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
              className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/90 hover:border-amber-500/40 cursor-pointer shadow-xl hover:shadow-amber-500/5 transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-md">
                    Verified Buyer
                  </span>
                  <span className="text-xs text-zinc-400">
                    {client.totalDealsCount} Closed Deal{client.totalDealsCount > 1 ? 's' : ''}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mt-3 hover:text-amber-300 transition-colors">
                  {client.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">{client.phone}</p>

                <div className="mt-4 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Lifetime Transactions:</span>
                    <span className="font-bold text-amber-300">
                      {client.totalDealsValueINR ? formatINR(client.totalDealsValueINR, true) : '₹5.20 Cr'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Preferred Hub:</span>
                    <span className="text-zinc-200 truncate max-w-[180px]">
                      {client.preferredLocation || 'South India Metros'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                <span className="text-zinc-500">VIP Investor</span>
                <div className="flex items-center gap-2">
                  <a
                    href={buildWhatsAppUrl(client.phone, `Hello ${client.name}, connecting from Velvet Code.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                    title="WhatsApp Client"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`tel:${client.phone}`}
                    className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                    title="Call Client"
                  >
                    <Phone className="w-3.5 h-3.5" />
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
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs">
                Contact & Investment Profile
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-zinc-500 block">Phone</span>
                  <span className="text-white font-semibold">{selectedClient.phone}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Email</span>
                  <span className="text-white">{selectedClient.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Target Budget</span>
                  <span className="text-amber-300 font-bold">
                    {selectedClient.budgetINR ? formatINR(selectedClient.budgetINR) : '₹5.0 Cr+'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Preferred Area</span>
                  <span className="text-white">{selectedClient.preferredLocation}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs">
                Portfolio Requirements
              </h4>
              <p className="text-xs text-zinc-300 bg-zinc-900 p-3 rounded-lg border border-zinc-850">
                {selectedClient.requirements || 'Looking for beachside vacation homes and high ROI rental suites.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs">
                Client History & Notes
              </h4>
              <p className="text-xs text-zinc-300 bg-zinc-900 p-3 rounded-lg border border-zinc-850">
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
              placeholder="e.g. Dr. Priya Raghavan"
              value={newClientForm.name}
              onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
            />
            <Input
              label="Phone Number *"
              required
              placeholder="+91 94436 47190"
              value={newClientForm.phone}
              onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="priya@domain.com"
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
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
