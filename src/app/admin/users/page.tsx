'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  Building,
  Filter,
  UserX,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

interface GlobalUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  organizationName: string;
  organizationId: string;
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  lastActive: string;
  isSuperAdmin?: boolean;
}

const GLOBAL_USERS_DATA: GlobalUser[] = [
  {
    id: 'usr-admin-01',
    name: 'Sri Lakshman',
    email: 'srilakshman73@gmail.com',
    phone: '+91 63833 95915',
    role: 'SUPER_ADMIN',
    organizationName: 'Velvet Code HQ',
    organizationId: 'org-root-00',
    status: 'ACTIVE',
    lastActive: 'Just now',
    isSuperAdmin: true,
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<GlobalUser[]>(GLOBAL_USERS_DATA);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [userToDelete, setUserToDelete] = useState<GlobalUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.organizationName.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        setFeedbackMessage(data.message || `User ${userToDelete.name} deleted successfully.`);
      } else {
        setFeedbackMessage(data.error || 'Failed to delete user.');
      }
    } catch (err) {
      setFeedbackMessage('Failed to connect to deletion service.');
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#29251F] tracking-tight">Platform Users Directory</h1>
          <p className="text-sm text-[#625B51] mt-1">
            Browse and administer registered real estate agents, managers, and tenant owners across India.
          </p>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3 bg-[#A374]/15 border border-[#A374]/30 rounded-xl text-xs text-[#7A5720] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#7A5720] flex-shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by agent name, email, or brokerage organization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-[#625B51]" />}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-white border border-[#DDD4C5] rounded-lg px-3 py-2 text-xs text-[#29251F] focus:outline-none focus:border-[#A374]"
        >
          <option value="ALL">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="OWNER">Tenant Owner</option>
          <option value="ADMIN">Organization Admin</option>
          <option value="AGENT">Sales Agent</option>
        </select>
      </div>

      {/* Users Table */}
      <Card orientation="vertical" className="p-0 overflow-hidden bg-[#FFFDF8] border-[#DDD4C5] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F0E7] border-b border-[#DDD4C5] text-[#625B51]">
              <tr>
                <th className="py-3 px-4 font-semibold">User Profile</th>
                <th className="py-3 px-4 font-semibold">Organization</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Contact</th>
                <th className="py-3 px-4 font-semibold">Last Active</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD4C5]/60">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#F4F0E7]/60 transition-colors">
                  <td className="py-3 px-4 font-medium text-[#29251F]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#A374]/15 border border-[#A374]/30 text-[#7A5720] font-serif flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-serif font-bold text-[#29251F] flex items-center gap-1.5">
                          {user.name}
                          {user.isSuperAdmin && (
                            <span title="Master Platform Owner">
                              <Shield className="w-3.5 h-3.5 text-[#A374]" />
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#625B51] font-mono">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#625B51]">
                    <div className="font-semibold text-[#29251F]">{user.organizationName}</div>
                    <div className="text-[10px] text-[#625B51] font-mono">{user.organizationId}</div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={user.role === 'SUPER_ADMIN' ? 'gold' : user.role === 'OWNER' ? 'info' : 'neutral'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-[#625B51]">
                    <div>{user.email}</div>
                    <div className="text-[10px] text-[#625B51]">{user.phone}</div>
                  </td>
                  <td className="py-3 px-4 text-[#625B51]">
                    {user.lastActive}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={user.status === 'ACTIVE' ? 'success' : 'error'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {!user.isSuperAdmin && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setUserToDelete(user)}
                        className="text-[#8B4A4A] hover:text-[#701E2B] hover:bg-[#8B4A4A]/10"
                        icon={<Trash2 className="w-3.5 h-3.5" />}
                      >
                        Delete
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirmation Modal for Destructive Delete Action */}
      {userToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setUserToDelete(null)}
          title="Confirm User Deletion"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-[#8B4A4A]/10 border border-[#8B4A4A]/20 rounded-xl text-[#8B4A4A] text-xs">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-[#8B4A4A] mt-0.5" />
              <div>
                <p className="font-bold text-[#8B4A4A]">Destructive Platform Owner Action</p>
                <p className="mt-1 text-[#29251F]">
                  Are you sure you want to permanently delete user <strong className="text-[#8B4A4A]">{userToDelete.name}</strong> ({userToDelete.email}) belonging to <strong className="text-[#29251F]">{userToDelete.organizationName}</strong>?
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteUser}
                disabled={isDeleting}
                icon={<Trash2 className="w-4 h-4" />}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete User'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
