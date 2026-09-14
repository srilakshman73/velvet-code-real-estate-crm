'use client';

import React, { useState } from 'react';
import { useCRMStore } from '@/lib/store';
import { Deal, DealStage } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal, Drawer } from '@/components/ui/Modal';
import { formatINR, formatDate } from '@/lib/utils';
import {
  Kanban as KanbanIcon,
  PlusCircle,
  DollarSign,
  User,
  Building,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Trash2,
  ChevronRight,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DealsPipelinePage() {
  const { deals, addDeal, updateDealStage, updateDeal, deleteDeal, properties, users, leads } =
    useCRMStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [newDealForm, setNewDealForm] = useState({
    title: '',
    dealValueINR: 14500000,
    stage: 'NEW_LEAD' as DealStage,
    probability: 20,
    expectedCloseDate: '2026-10-15',
    leadId: '',
    propertyId: '',
    assignedAgentId: 'usr-karthik-04',
    notes: '',
  });

  const stages: { key: DealStage; label: string; color: string }[] = [
    { key: 'NEW_LEAD', label: 'New Lead', color: 'border-zinc-700' },
    { key: 'QUALIFIED', label: 'Qualified', color: 'border-blue-500/40' },
    { key: 'SITE_VISIT', label: 'Site Visit', color: 'border-purple-500/40' },
    { key: 'NEGOTIATION', label: 'Negotiation', color: 'border-amber-500/40' },
    { key: 'DOCUMENTATION', label: 'Documentation', color: 'border-amber-400' },
    { key: 'CLOSED_WON', label: 'Closed Won 🏆', color: 'border-emerald-500' },
    { key: 'CLOSED_LOST', label: 'Closed Lost', color: 'border-rose-500/40' },
  ];

  // Pipeline Totals
  const totalPipelineValue = deals
    .filter((d) => d.stage !== 'CLOSED_LOST')
    .reduce((sum, d) => sum + d.dealValueINR, 0);

  const wonDealsValue = deals
    .filter((d) => d.stage === 'CLOSED_WON')
    .reduce((sum, d) => sum + d.dealValueINR, 0);

  const handleStageChange = (dealId: string, newStage: DealStage) => {
    updateDealStage(dealId, newStage);
    if (newStage === 'CLOSED_WON') {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#ffffff'],
        });
      } catch {
        // ignore
      }
    }
  };

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const assigned = users.find((u) => u.id === newDealForm.assignedAgentId);
    const prop = properties.find((p) => p.id === newDealForm.propertyId);
    const lead = leads.find((l) => l.id === newDealForm.leadId);

    addDeal({
      title: newDealForm.title,
      dealValueINR: Number(newDealForm.dealValueINR),
      stage: newDealForm.stage,
      probability: Number(newDealForm.probability),
      expectedCloseDate: newDealForm.expectedCloseDate,
      leadId: newDealForm.leadId,
      leadName: lead ? lead.name : undefined,
      propertyId: newDealForm.propertyId,
      propertyName: prop ? prop.title : undefined,
      assignedAgentId: newDealForm.assignedAgentId,
      assignedAgentName: assigned ? assigned.name : undefined,
      notes: newDealForm.notes,
    });

    setIsAddModalOpen(false);
  };

  const openDetail = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsDrawerOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sales Deals Pipeline
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
              {deals.length} Active Deals
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Total Pipeline Value:{' '}
            <strong className="text-amber-300 font-mono">{formatINR(totalPipelineValue, true)}</strong> • Closed Won:{' '}
            <strong className="text-emerald-400 font-mono">{formatINR(wonDealsValue, true)}</strong>
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Create New Deal
        </Button>
      </div>

      {/* Kanban Board Container */}
      <div className="overflow-x-auto pb-4">
        <div className="flex items-start gap-4 min-w-[1400px]">
          {stages.map((st) => {
            const stageDeals = deals.filter((d) => d.stage === st.key);
            const stageValue = stageDeals.reduce((sum, d) => sum + d.dealValueINR, 0);

            return (
              <div
                key={st.key}
                className="w-72 flex-shrink-0 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-xl flex flex-col max-h-[78vh]"
              >
                {/* Column Header */}
                <div className={`p-4 border-b border-zinc-800/80 ${st.color} border-t-2 rounded-t-2xl`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      {st.label}
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-zinc-900 text-zinc-300 rounded-md border border-zinc-800">
                      {stageDeals.length}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-amber-300 font-mono mt-1">
                    {formatINR(stageValue, true)}
                  </p>
                </div>

                {/* Cards List */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      onClick={() => openDetail(deal)}
                      className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/40 cursor-pointer shadow-md hover:shadow-lg transition-all space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                          {deal.title}
                        </h4>
                        <span className="text-[10px] font-bold text-emerald-400 flex-shrink-0">
                          {deal.probability}%
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-zinc-400">
                        <p className="truncate text-zinc-300">
                          {deal.propertyName || 'Property'}
                        </p>
                        <p className="text-xs font-extrabold text-amber-300 font-mono">
                          {formatINR(deal.dealValueINR, true)}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500">
                        <span>Agent: {deal.assignedAgentName?.split(' ')[0] || 'Vikram'}</span>
                        <span>{deal.expectedCloseDate || '2026-10'}</span>
                      </div>

                      {/* Quick Move Stage Trigger */}
                      <div
                        className="pt-1 flex items-center justify-between"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={deal.stage}
                          onChange={(e) =>
                            handleStageChange(deal.id, e.target.value as DealStage)
                          }
                          className="bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 rounded px-1.5 py-1 w-full outline-none focus:border-amber-400"
                        >
                          {stages.map((s) => (
                            <option key={s.key} value={s.key}>
                              Move to: {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deal Detail Drawer */}
      {selectedDeal && (
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={selectedDeal.title}
          subtitle={`Deal Value: ${formatINR(selectedDeal.dealValueINR)} • Probability: ${selectedDeal.probability}%`}
          size="lg"
        >
          <div className="space-y-6 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs">
                Deal Parameters & Milestones
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-zinc-500 block">Total Deal Value</span>
                  <span className="text-amber-300 font-extrabold text-base font-mono">
                    {formatINR(selectedDeal.dealValueINR)}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Current Stage</span>
                  <span className="text-white font-bold">{selectedDeal.stage}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Buyer Name</span>
                  <span className="text-white">{selectedDeal.leadName || 'Client'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Target Closing Date</span>
                  <span className="text-white">{selectedDeal.expectedCloseDate || '2026-09-30'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs">
                Deal Notes & Milestones
              </h4>
              <p className="text-xs text-zinc-300 bg-zinc-900 p-3 rounded-lg border border-zinc-850">
                {selectedDeal.notes || 'Legal review in progress.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <Button
                variant="danger"
                size="xs"
                onClick={() => {
                  deleteDeal(selectedDeal.id);
                  setIsDrawerOpen(false);
                }}
              >
                Delete Deal
              </Button>
              <Button
                variant="gold"
                size="xs"
                onClick={() => handleStageChange(selectedDeal.id, 'CLOSED_WON')}
              >
                Mark as Closed Won 🏆
              </Button>
            </div>
          </div>
        </Drawer>
      )}

      {/* Add Deal Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Sales Deal"
        description="Add a transaction opportunity to your pipeline."
      >
        <form onSubmit={handleCreateDeal} className="space-y-4 text-xs sm:text-sm">
          <Input
            label="Deal Title *"
            required
            placeholder="e.g. Emerald Heights 3BHK - Rahul Sharma"
            value={newDealForm.title}
            onChange={(e) => setNewDealForm({ ...newDealForm, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Deal Value (INR) *"
              type="number"
              required
              value={newDealForm.dealValueINR}
              onChange={(e) =>
                setNewDealForm({ ...newDealForm, dealValueINR: Number(e.target.value) })
              }
            />
            <Select
              label="Pipeline Stage"
              value={newDealForm.stage}
              onChange={(e) =>
                setNewDealForm({ ...newDealForm, stage: e.target.value as DealStage })
              }
              options={[
                { value: 'NEW_LEAD', label: 'New Lead' },
                { value: 'QUALIFIED', label: 'Qualified' },
                { value: 'SITE_VISIT', label: 'Site Visit' },
                { value: 'NEGOTIATION', label: 'Negotiation' },
                { value: 'DOCUMENTATION', label: 'Documentation' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Related Buyer / Lead"
              value={newDealForm.leadId}
              onChange={(e) => setNewDealForm({ ...newDealForm, leadId: e.target.value })}
            >
              <option value="">Select Buyer...</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.phone})
                </option>
              ))}
            </Select>

            <Select
              label="Property"
              value={newDealForm.propertyId}
              onChange={(e) => setNewDealForm({ ...newDealForm, propertyId: e.target.value })}
            >
              <option value="">Select Property...</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
          </div>

          <Textarea
            label="Deal Notes & Terms"
            rows={3}
            value={newDealForm.notes}
            onChange={(e) => setNewDealForm({ ...newDealForm, notes: e.target.value })}
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
              Save Deal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
