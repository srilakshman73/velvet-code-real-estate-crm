'use client';

import React, { useState } from 'react';
import { useCRMStore } from '@/lib/store';
import { Role } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { getInitials } from '@/lib/utils';
import { Users2, PlusCircle, Shield, Mail, Phone, CheckCircle2 } from 'lucide-react';

export default function TeamPage() {
  const { users, currentPlanLimits, checkLimit } = useCRMStore();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('AGENT');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const limitCheck = checkLimit('users');
    if (!limitCheck.allowed) {
      alert(limitCheck.reason);
      return;
    }
    alert(`Invitation dispatched to ${inviteEmail} as ${inviteRole}.`);
    setIsInviteModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#FCECEF] text-[#3A2930]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A2930] tracking-tight flex items-center gap-2">
              <Users2 className="w-6 h-6 text-[#B86B84]" />
              Team & Role Management
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-[#B86B84]/15 text-[#8C455C] border border-[#B86B84]/30 rounded-full">
              {users.length} / {currentPlanLimits.maxUsers} Seats Used
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#765D66] mt-1">
            Manage your real estate agents, sales managers, and role-based permissions.
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={() => setIsInviteModalOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Invite Team Member
        </Button>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-[#EBCBD4] bg-[#FFF9FA] overflow-hidden shadow-[0_8px_24px_rgba(120,90,40,0.08)]">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-[#FFF5F7] border-b border-[#EBCBD4] text-[#3A2930] font-semibold">
              <th className="p-4">Member</th>
              <th className="p-4">Role</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Permissions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBCBD4]/60">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#F7EEDC] transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#B86B84]/15 text-[#8C455C] font-serif font-bold flex items-center justify-center flex-shrink-0 border border-[#B86B84]/30">
                      {getInitials(u.name)}
                    </div>
                    <div>
                      <p className="font-serif font-bold text-[#3A2930] text-sm">{u.name}</p>
                      <p className="text-xs text-[#765D66]">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-1 text-xs font-bold uppercase bg-[#FFF5F7] text-[#8C455C] rounded-md border border-[#EBCBD4]">
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-[#765D66]">{u.phone || '+91 63833 95915'}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#4A7C59] font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#4A7C59]" /> Active
                  </span>
                </td>
                <td className="p-4 text-right text-xs text-[#765D66]">
                  {u.role === 'OWNER' ? 'Full Control' : u.role === 'ADMIN' ? 'Manage & Assign' : 'Assigned Leads Only'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Real Estate Consultant"
        description="Add an agent or manager to your workspace."
      >
        <form onSubmit={handleInvite} className="space-y-4 text-xs sm:text-sm">
          <Input
            label="Consultant Name *"
            required
            placeholder="e.g. Ramesh Balaji"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
          />
          <Input
            label="Work Email *"
            type="email"
            required
            placeholder="ramesh@apexrealty.in"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Select
            label="Role & Access Level"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as Role)}
            options={[
              { value: 'AGENT', label: 'Agent (Assigned Leads & Visits Only)' },
              { value: 'MANAGER', label: 'Manager (Team Pipeline & Approvals)' },
              { value: 'ADMIN', label: 'Admin (Full CRM Management)' },
            ]}
          />
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EBCBD4]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="md" className="font-bold">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

