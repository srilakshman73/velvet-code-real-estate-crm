'use client';

import React, { useState } from 'react';
import { useCRMStore } from '@/lib/store';
import { SiteVisit, SiteVisitStatus } from '@/types';
import { SiteVisitStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, formatTime, buildWhatsAppUrl } from '@/lib/utils';
import {
  CalendarCheck,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Phone,
  Camera,
  Star,
  User,
  Building2,
} from 'lucide-react';

export default function SiteVisitsPage() {
  const { siteVisits, scheduleSiteVisit, checkInVisit, checkOutVisit, properties, users, leads } =
    useCRMStore();

  const [activeTab, setActiveTab] = useState<'ALL' | 'TODAY' | 'UPCOMING' | 'COMPLETED'>('ALL');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [checkoutModalVisit, setCheckoutModalVisit] = useState<SiteVisit | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  const [newVisitForm, setNewVisitForm] = useState({
    leadId: '',
    customerPhone: '+91 63833 95915',
    propertyId: '',
    assignedAgentId: 'usr-admin-01',
    visitDate: new Date().toISOString().split('T')[0],
    timeSlot: '11:00 AM',
    notes: 'Buyer requested complete amenities walkthrough.',
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredVisits = siteVisits.filter((v) => {
    if (activeTab === 'TODAY') return v.visitDate === todayStr;
    if (activeTab === 'UPCOMING') return v.status === 'SCHEDULED' || v.status === 'CONFIRMED';
    if (activeTab === 'COMPLETED') return v.status === 'COMPLETED';
    return true;
  });

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const prop = properties.find((p) => p.id === newVisitForm.propertyId);
    const agent = users.find((u) => u.id === newVisitForm.assignedAgentId);
    const lead = leads.find((l) => l.id === newVisitForm.leadId);

    scheduleSiteVisit({
      leadId: newVisitForm.leadId,
      leadName: lead ? lead.name : 'Inquiry Client',
      customerPhone: newVisitForm.customerPhone,
      propertyId: newVisitForm.propertyId,
      propertyName: prop ? prop.title : 'Property View',
      propertyLocation: prop ? `${prop.locality}, ${prop.city}` : 'Metro Area',
      assignedAgentId: newVisitForm.assignedAgentId,
      assignedAgentName: agent ? agent.name : 'Velvet Code',
      visitDate: newVisitForm.visitDate,
      timeSlot: newVisitForm.timeSlot,
      status: 'CONFIRMED',
      notes: newVisitForm.notes,
    });

    setIsScheduleModalOpen(false);
  };

  const handleCompleteCheckout = () => {
    if (!checkoutModalVisit) return;
    checkOutVisit(checkoutModalVisit.id, feedbackRating, feedbackText);
    setCheckoutModalVisit(null);
    setFeedbackText('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#29251F] tracking-tight">
              Site Visits Management
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-[#A374]/15 text-[#7A5720] border border-[#A374]/40 rounded-full font-serif">
              {siteVisits.length} Recorded Visits
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#625B51] mt-1">
            Schedule luxury property viewings, dispatch WhatsApp directions, and record client impressions.
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={() => setIsScheduleModalOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Schedule Site Visit
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DDD4C5] pb-3">
        {[
          { id: 'ALL', label: 'All Visits' },
          { id: 'TODAY', label: "Today's Schedule" },
          { id: 'UPCOMING', label: 'Upcoming Confirmed' },
          { id: 'COMPLETED', label: 'Completed (5★ Feedback)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-[#A374] text-white shadow-sm'
                : 'bg-[#FFFDF8] text-[#625B51] hover:text-[#29251F] border border-[#DDD4C5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Visits List */}
      {filteredVisits.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="w-8 h-8" />}
          title="No site visits in this view"
          description="Schedule a new viewing to start tracking customer walkthroughs."
          actionLabel="Schedule Visit"
          onAction={() => setIsScheduleModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVisits.map((v) => (
            <div
              key={v.id}
              className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#DDD4C5] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)] space-y-4 flex flex-col justify-between hover:border-[#A374] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <SiteVisitStatusBadge status={v.status} />
                  <span className="text-xs font-bold text-[#7A5720] bg-[#F4F0E7] px-2.5 py-1 rounded-lg border border-[#DDD4C5]">
                    {v.timeSlot}
                  </span>
                </div>

                <h3 className="text-base font-serif font-bold text-[#29251F] leading-snug">
                  {v.propertyName}
                </h3>

                <p className="text-xs text-[#625B51] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#A374] flex-shrink-0" />
                  <span>{v.propertyLocation}</span>
                </p>

                <div className="p-3 rounded-xl bg-[#F4F0E7] border border-[#DDD4C5] text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#625B51]">Buyer:</span>
                    <span className="font-semibold text-[#29251F]">{v.leadName || 'Client'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#625B51]">Date:</span>
                    <span className="text-[#29251F]">{v.visitDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#625B51]">Assigned Agent:</span>
                    <span className="text-[#29251F]">{v.assignedAgentName}</span>
                  </div>
                </div>

                {v.feedback && (
                  <div className="p-2.5 rounded-lg bg-[#3D7258]/10 border border-[#3D7258]/20 text-xs text-[#3D7258]">
                    <div className="flex items-center gap-1 font-bold mb-0.5">
                      <Star className="w-3.5 h-3.5 fill-[#A374] text-[#A374]" />
                      <span>{v.rating} / 5 Stars Feedback</span>
                    </div>
                    <p className="italic text-[11px]">"{v.feedback}"</p>
                  </div>
                )}
              </div>

              {/* Action Controls */}
              <div className="pt-3 border-t border-[#DDD4C5] flex items-center justify-between text-xs">
                {v.status === 'CONFIRMED' || v.status === 'SCHEDULED' ? (
                  <>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => checkInVisit(v.id)}
                    >
                      Agent Check-In
                    </Button>
                    <Button
                      variant="emerald"
                      size="xs"
                      onClick={() => setCheckoutModalVisit(v)}
                    >
                      Complete & Rate
                    </Button>
                  </>
                ) : (
                  <span className="text-[#3D7258] text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Visit Completed
                  </span>
                )}

                <a
                  href={buildWhatsAppUrl(v.customerPhone || '916383395915', `Hello, your site visit for ${v.propertyName} is scheduled for ${v.visitDate} at ${v.timeSlot}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-[#3D7258]/10 text-[#3D7258] hover:bg-[#3D7258]/20 ml-auto transition-colors"
                  title="WhatsApp Confirmation"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Property Site Visit"
        description="Book a client viewing and dispatch automated WhatsApp confirmations."
      >
        <form onSubmit={handleSchedule} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select Buyer / Lead *"
              required
              value={newVisitForm.leadId}
              onChange={(e) => setNewVisitForm({ ...newVisitForm, leadId: e.target.value })}
            >
              <option value="">Select Buyer...</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.phone})
                </option>
              ))}
            </Select>

            <Select
              label="Select Property *"
              required
              value={newVisitForm.propertyId}
              onChange={(e) =>
                setNewVisitForm({ ...newVisitForm, propertyId: e.target.value })
              }
            >
              <option value="">Select Property...</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Visit Date *"
              type="date"
              required
              value={newVisitForm.visitDate}
              onChange={(e) => setNewVisitForm({ ...newVisitForm, visitDate: e.target.value })}
            />
            <Input
              label="Time Slot *"
              placeholder="e.g. 11:30 AM"
              required
              value={newVisitForm.timeSlot}
              onChange={(e) => setNewVisitForm({ ...newVisitForm, timeSlot: e.target.value })}
            />
          </div>

          <Select
            label="Assigned Agent"
            value={newVisitForm.assignedAgentId}
            onChange={(e) =>
              setNewVisitForm({ ...newVisitForm, assignedAgentId: e.target.value })
            }
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </Select>

          <Textarea
            label="Preparation Notes"
            rows={2}
            value={newVisitForm.notes}
            onChange={(e) => setNewVisitForm({ ...newVisitForm, notes: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DDD4C5]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsScheduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="md" className="font-bold">
              Schedule & Send WhatsApp
            </Button>
          </div>
        </form>
      </Modal>

      {/* Complete Visit Modal */}
      {checkoutModalVisit && (
        <Modal
          isOpen={true}
          onClose={() => setCheckoutModalVisit(null)}
          title="Complete Site Visit & Record Feedback"
          description={`Log customer feedback for ${checkoutModalVisit.propertyName}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-[#29251F] mb-1.5">
                Client Rating (1 to 5 Stars)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className={`p-2 rounded-lg border transition-all ${
                      feedbackRating >= star
                        ? 'bg-[#A374]/20 border-[#A374] text-[#7A5720]'
                        : 'bg-white border-[#DDD4C5] text-[#625B51]'
                    }`}
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              label="Client Feedback & Next Step"
              rows={3}
              placeholder="e.g. Loved the top floor balcony and cross ventilation. Ready for price negotiation."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DDD4C5]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCheckoutModalVisit(null)}
              >
                Cancel
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={handleCompleteCheckout}
                className="font-bold"
              >
                Save Completion
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
