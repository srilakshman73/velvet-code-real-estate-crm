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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#24211D] tracking-tight flex items-center gap-2">
              <Users2 className="w-6 h-6 text-[#A374]" />
              Team & Role Management
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-[#A374]/15 text-[#8F642B] border border-[#A374]/30 rounded-full">
              {users.length} / {currentPlanLimits.maxUsers} Seats Used
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#766F63] mt-1">
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
      <div className="rounded-2xl border border-[#DDD4C4] bg-[#FFFCF6] overflow-hidden shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-[#F7F3EA] border-b border-[#DDD4C4] text-[#766F63] font-semibold">
              <th className="p-4">Member</th>
              <th className="p-4">Role</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Permissions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDD4C4]/60">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#F7F3EA]/60 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#A374]/15 text-[#8F642B] font-serif font-bold flex items-center justify-center flex-shrink-0 border border-[#A374]/30">
                      {getInitials(u.name)}
                    </div>
                    <div>
                      <p className="font-serif font-bold text-[#24211D] text-sm">{u.name}</p>
                      <p className="text-xs text-[#766F63]">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-1 text-xs font-bold uppercase bg-[#F7F3EA] text-[#8F642B] rounded-md border border-[#DDD4C4]">
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-[#766F63]">{u.phone || '+91 94436 47190'}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#2E6B4F] font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#2E6B4F]" /> Active
                  </span>
                </td>
                <td className="p-4 text-right text-xs text-[#766F63]">
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
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DDD4C4]">
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
