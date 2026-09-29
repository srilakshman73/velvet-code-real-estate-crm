'use client';

import React, { useState } from 'react';
import { useCRMStore } from '@/lib/store';
import { Client, AppointmentType, AppointmentStatus } from '@/types';
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
  Clock,
  MapPin,
  Trash2,
  Calendar,
} from 'lucide-react';

export default function ClientsPage() {
  const { clients, addClient, updateClient, deals, siteVisits, appointments, addAppointment, deleteAppointment, properties, users } = useCRMStore();
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

  // Client Appointment Scheduling State
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isSchedulingAppointment, setIsSchedulingAppointment] = useState(false);
  const [clientAppointmentForm, setClientAppointmentForm] = useState({
    title: '',
    appointmentType: 'MEETING' as AppointmentType,
    date: '2026-09-15',
    time: '11:00',
    durationMinutes: 60,
    propertyId: '',
    assignedUserId: '',
    location: '',
    reminderMinutes: 15,
    notes: '',
  });

  const handleOpenScheduleForClient = (client: Client) => {
    setClientAppointmentForm({
      title: `Portfolio Review / Consultation with ${client.name}`,
      appointmentType: 'MEETING',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '11:00',
      durationMinutes: 60,
      propertyId: properties[0]?.id || '',
      assignedUserId: users[0]?.id || '',
      location: client.preferredLocation || 'Corporate Headquarters',
      reminderMinutes: 15,
      notes: `Discussion regarding investment requirements (${client.requirements || 'Villas & commercial suites'})`,
    });
    setIsAppointmentModalOpen(true);
  };

  const handleCreateAppointmentForClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setIsSchedulingAppointment(true);

    try {
      const startIso = `${clientAppointmentForm.date}T${clientAppointmentForm.time}:00`;
      const startDate = new Date(startIso);
      const endDate = new Date(startDate.getTime() + clientAppointmentForm.durationMinutes * 60000);
      const prop = properties.find((p) => p.id === clientAppointmentForm.propertyId);
      const user = users.find((u) => u.id === clientAppointmentForm.assignedUserId);

      await addAppointment({
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        propertyId: clientAppointmentForm.propertyId || undefined,
        propertyTitle: prop?.title,
        assignedUserId: clientAppointmentForm.assignedUserId || users[0]?.id,
        assignedUserName: user?.name || users[0]?.name,
        title: clientAppointmentForm.title,
        description: clientAppointmentForm.notes,
        appointmentType: clientAppointmentForm.appointmentType,
        startAt: startDate.toISOString(),
        endAt: endDate.toISOString(),
        location: clientAppointmentForm.location,
        status: 'SCHEDULED',
        reminderMinutes: Number(clientAppointmentForm.reminderMinutes),
      });

      setIsAppointmentModalOpen(false);
    } catch (err: any) {
      alert(`Failed to schedule appointment: ${err.message}`);
    } finally {
      setIsSchedulingAppointment(false);
    }
  };

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#FCECEF] text-[#3A2930]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A2930] tracking-tight">
              Converted Clients
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-[#4A7C59]/15 text-[#4A7C59] border border-[#4A7C59]/30 rounded-full">
              {filteredClients.length} Active Clients
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#765D66] mt-1">
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
      <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#EBCBD4] shadow-[0_8px_24px_rgba(120,90,40,0.08)] flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-[#9B828C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients by name, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FFF5F7] border border-[#EBCBD4] rounded-xl text-xs text-[#3A2930] placeholder:text-[#9B828C] outline-none focus:border-[#B86B84]"
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
              className="p-6 rounded-2xl bg-[#FFF9FA] border border-[#EBCBD4] hover:border-[#B86B84] cursor-pointer shadow-[0_8px_24px_rgba(120,90,40,0.08)] hover:shadow-[0_8px_24px_rgba(163,116,50,0.15)] transition-all space-y-4 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#4A7C59]/15 text-[#4A7C59] border border-[#4A7C59]/30 rounded-md">
                    Verified Buyer
                  </span>
                  <span className="text-xs text-[#765D66]">
                    {client.totalDealsCount} Closed Deal{client.totalDealsCount > 1 ? 's' : ''}
                  </span>
                </div>

                <h3 className="text-lg font-serif font-bold text-[#3A2930] mt-3 group-hover:text-[#8C455C] transition-colors">
                  {client.name}
                </h3>
                <p className="text-xs text-[#765D66] mt-0.5 font-medium">{client.phone}</p>

                <div className="mt-4 p-3 rounded-xl bg-[#FFF5F7] border border-[#EBCBD4] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#765D66]">Lifetime Transactions:</span>
                    <span className="font-bold text-[#8C455C] font-mono">
                      {client.totalDealsValueINR ? formatINR(client.totalDealsValueINR, true) : 'â‚¹5.20 Cr'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#765D66]">Preferred Hub:</span>
                    <span className="text-[#3A2930] truncate max-w-[180px] font-medium">
                      {client.preferredLocation || 'South India Metros'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EBCBD4] flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                <span className="text-[#765D66] font-serif font-semibold">VIP Investor</span>
                <div className="flex items-center gap-2">
                  <a
                    href={buildWhatsAppUrl(client.phone, `Hello ${client.name}, connecting from Velvet Code.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-[#4A7C59]/10 text-[#4A7C59] hover:bg-[#4A7C59]/20 border border-[#4A7C59]/30 transition-colors"
                    title="WhatsApp Client"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`tel:${client.phone}`}
                    className="p-2 rounded-lg bg-[#FFF5F7] border border-[#EBCBD4] text-[#3A2930] hover:bg-[#FCECEF] transition-colors"
                    title="Call Client"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#765D66]" />
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
          subtitle={`Client ID: ${selectedClient.id} â€¢ Converted Customer Profile`}
          size="lg"
        >
          <div className="space-y-6 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-[#FFF9FA] border border-[#EBCBD4] space-y-3">
              <h4 className="font-bold text-[#8C455C] font-serif uppercase tracking-wider text-xs">
                Contact & Investment Profile
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#765D66] block">Phone</span>
                  <span className="text-[#3A2930] font-semibold">{selectedClient.phone}</span>
                </div>
                <div>
                  <span className="text-[#765D66] block">Email</span>
                  <span className="text-[#3A2930]">{selectedClient.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#765D66] block">Target Budget</span>
                  <span className="text-[#8C455C] font-bold font-mono">
                    {selectedClient.budgetINR ? formatINR(selectedClient.budgetINR) : 'â‚¹5.0 Cr+'}
                  </span>
                </div>
                <div>
                  <span className="text-[#765D66] block">Preferred Area</span>
                  <span className="text-[#3A2930]">{selectedClient.preferredLocation}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF9FA] border border-[#EBCBD4] space-y-2">
              <h4 className="font-bold text-[#8C455C] font-serif uppercase tracking-wider text-xs">
                Portfolio Requirements
              </h4>
              <p className="text-xs text-[#3A2930] bg-[#FFF5F7] p-3 rounded-lg border border-[#EBCBD4]">
                {selectedClient.requirements || 'Looking for beachside vacation homes and high ROI rental suites.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF9FA] border border-[#EBCBD4] space-y-2">
              <h4 className="font-bold text-[#8C455C] font-serif uppercase tracking-wider text-xs">
                Client History & Notes
              </h4>
              <p className="text-xs text-[#3A2930] bg-[#FFF5F7] p-3 rounded-lg border border-[#EBCBD4]">
                {selectedClient.notes || 'VIP Customer with verified funds.'}
              </p>
            </div>

            {/* Scheduled Appointments & Engagements */}
            <div className="p-4 rounded-xl bg-[#FFF5F7] border border-[#EBCBD4] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#8C455C] font-serif uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Scheduled Engagements
                </h4>
                <Button
                  variant="gold"
                  size="xs"
                  onClick={() => handleOpenScheduleForClient(selectedClient)}
                  leftIcon={<PlusCircle className="w-3 h-3" />}
                >
                  Schedule
                </Button>
              </div>

              {appointments.filter((a) => a.clientId === selectedClient.id).length === 0 ? (
                <p className="text-xs text-[#765D66] italic bg-[#FFF9FA] p-3 rounded-lg border border-[#EBCBD4]">
                  No upcoming meetings or viewings scheduled with this client. Click &quot;Schedule&quot; to book an appointment.
                </p>
              ) : (
                <div className="space-y-2">
                  {appointments
                    .filter((a) => a.clientId === selectedClient.id)
                    .map((apt) => (
                      <div
                        key={apt.id}
                        className="p-2.5 rounded-lg bg-[#FFF9FA] border border-[#EBCBD4] text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#3A2930]">{apt.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              apt.status === 'COMPLETED'
                                ? 'bg-[#4A7C59]/15 text-[#4A7C59] border border-[#4A7C59]/30'
                                : apt.status === 'CANCELLED'
                                ? 'bg-[#A84355]/15 text-[#A84355] border border-[#A84355]/30'
                                : 'bg-[#B86B84]/15 text-[#8C455C] border border-[#B86B84]/30'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#765D66]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#B86B84]" />
                            {new Date(apt.startAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                          {apt.location && (
                            <span className="flex items-center gap-1 truncate max-w-[160px]">
                              <MapPin className="w-3 h-3 text-[#B86B84]" />
                              {apt.location}
                            </span>
                          )}
                        </div>
                        {apt.description && (
                          <p className="text-[11px] text-[#765D66] italic">{apt.description}</p>
                        )}
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Delete this scheduled engagement?')) {
                                deleteAppointment(apt.id);
                              }
                            }}
                            className="text-[10px] text-[#A84355] hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-2.5 h-2.5" /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
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
              Save Client
            </Button>
          </div>
        </form>
      </Modal>

      {/* SCHEDULE APPOINTMENT FOR CLIENT MODAL */}
      {selectedClient && (
        <Modal
          isOpen={isAppointmentModalOpen}
          onClose={() => setIsAppointmentModalOpen(false)}
          title={`Schedule Engagement for ${selectedClient.name}`}
          description="Book a portfolio review, property viewing, or private consultation."
        >
          <form onSubmit={handleCreateAppointmentForClient} className="space-y-4 text-xs sm:text-sm">
            <Input
              label="Engagement Title *"
              required
              value={clientAppointmentForm.title}
              onChange={(e) =>
                setClientAppointmentForm({ ...clientAppointmentForm, title: e.target.value })
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Appointment Type"
                value={clientAppointmentForm.appointmentType}
                onChange={(e) =>
                  setClientAppointmentForm({
                    ...clientAppointmentForm,
                    appointmentType: e.target.value as AppointmentType,
                  })
                }
              >
                <option value="MEETING">In-Person Consultation</option>
                <option value="SITE_VISIT">Site Visit / Tour</option>
                <option value="PROPERTY_VISIT">Private Viewing</option>
                <option value="CALL">Phone / WhatsApp Call</option>
                <option value="PROPERTY_DISCUSSION">Contract Negotiation</option>
                <option value="OTHER">Other Engagement</option>
              </Select>

              <Select
                label="Reminder Alert"
                value={String(clientAppointmentForm.reminderMinutes)}
                onChange={(e) =>
                  setClientAppointmentForm({
                    ...clientAppointmentForm,
                    reminderMinutes: Number(e.target.value),
                  })
                }
              >
                <option value="5">5 minutes before</option>
                <option value="10">10 minutes before</option>
                <option value="15">15 minutes before</option>
                <option value="30">30 minutes before</option>
                <option value="60">1 hour before</option>
                <option value="1440">1 day before</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Date *"
                type="date"
                required
                value={clientAppointmentForm.date}
                onChange={(e) =>
                  setClientAppointmentForm({ ...clientAppointmentForm, date: e.target.value })
                }
              />
              <Input
                label="Start Time *"
                type="time"
                required
                value={clientAppointmentForm.time}
                onChange={(e) =>
                  setClientAppointmentForm({ ...clientAppointmentForm, time: e.target.value })
                }
              />
              <Input
                label="Duration (Minutes)"
                type="number"
                min={15}
                max={480}
                step={15}
                value={clientAppointmentForm.durationMinutes}
                onChange={(e) =>
                  setClientAppointmentForm({
                    ...clientAppointmentForm,
                    durationMinutes: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Associated Property"
                value={clientAppointmentForm.propertyId}
                onChange={(e) =>
                  setClientAppointmentForm({ ...clientAppointmentForm, propertyId: e.target.value })
                }
              >
                <option value="">Select property...</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.locality})
                  </option>
                ))}
              </Select>

              <Select
                label="Assigned Consultant"
                value={clientAppointmentForm.assignedUserId}
                onChange={(e) =>
                  setClientAppointmentForm({ ...clientAppointmentForm, assignedUserId: e.target.value })
                }
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </Select>
            </div>

            <Input
              label="Location / Meeting Venue"
              placeholder="e.g. VIP Lounge / Developer Office / Site"
              value={clientAppointmentForm.location}
              onChange={(e) =>
                setClientAppointmentForm({ ...clientAppointmentForm, location: e.target.value })
              }
            />

            <Textarea
              label="Meeting Objectives & Discussion Points"
              rows={3}
              placeholder="Investor preferences, portfolio diversification review..."
              value={clientAppointmentForm.notes}
              onChange={(e) =>
                setClientAppointmentForm({ ...clientAppointmentForm, notes: e.target.value })
              }
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EBCBD4]">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsAppointmentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gold"
                size="md"
                className="font-bold"
                disabled={isSchedulingAppointment}
              >
                {isSchedulingAppointment ? 'Scheduling...' : 'Confirm Appointment'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

