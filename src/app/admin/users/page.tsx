'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  Building,
  Filter,
  Trash2,
  AlertTriangle,
  Clock,
  CreditCard,
  RefreshCw,
  Calendar,
  Lock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { OwnerMonitoringUser } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<OwnerMonitoringUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Global Metrics
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeTrials: 0,
    paidSubscribers: 0,
    totalOrganizations: 0,
  });

  // Action states
  const [userToDelete, setUserToDelete] = useState<OwnerMonitoringUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Fetch users from server API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: sortBy,
      });

      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (planFilter !== 'ALL') params.set('plan', planFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        cache: 'no-store',
      });

      if (res.status === 403) {
        setIsForbidden(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to load registered platform users.');
      }

      const data = await res.json();
      setUsers(data.users || []);
      if (data.pagination) setPagination(data.pagination);
      if (data.metrics) setMetrics(data.metrics);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while loading customers.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, search, statusFilter, planFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok) {
        setFeedbackMessage(data.message || `User ${userToDelete.name} deleted successfully.`);
        fetchUsers();
      } else {
        setFeedbackMessage(data.error || 'Failed to delete user.');
      }
    } catch {
      setFeedbackMessage('Failed to connect to deletion service.');
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr || dateStr === 'Not provided' || dateStr === 'Never logged in') {
      return dateStr || 'Not provided';
    }
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // 403 FORBIDDEN STATE (Non-owner accounts)
  if (isForbidden) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#FFF9F0] border border-[#D8C7A5] space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#8B4A4A]/10 border border-[#8B4A4A]/25 text-[#8B4A4A] flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-[#2C241A]">403 — Owner Authorization Required</h1>
          <p className="text-xs text-[#6A5A44] leading-relaxed">
            The Registered Customer Monitoring Console contains sensitive multi-tenant platform records and is strictly restricted to the verified platform owner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#A37432]/15 text-[#7A5520] border border-[#A37432]/30">
              Live Customer Monitoring
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[#547A61] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#547A61] animate-pulse" />
              Verified Server Records
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2C241A] tracking-tight">
            Registered Customers & Workspaces
          </h1>
          <p className="text-xs sm:text-sm text-[#6A5A44] mt-1">
            Real-time multi-tenant monitoring of customer registrations, login activity, trial countdowns, and active subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers()}
            disabled={loading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            className="text-xs"
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Global Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card orientation="vertical" className="p-4 bg-[#FFF9F0] border-[#D8C7A5]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6A5A44]">Total Registered</span>
            <div className="w-8 h-8 rounded-lg bg-[#A37432]/15 text-[#7A5520] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#2C241A] mt-2">{metrics.totalUsers}</div>
          <p className="text-[10px] text-[#8A7A63] mt-1">Verified user accounts</p>
        </Card>

        <Card orientation="vertical" className="p-4 bg-[#FFF9F0] border-[#D8C7A5]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6A5A44]">Active Trials</span>
            <div className="w-8 h-8 rounded-lg bg-[#A87932]/15 text-[#A87932] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#2C241A] mt-2">{metrics.activeTrials}</div>
          <p className="text-[10px] text-[#8A7A63] mt-1">7-Day free trial window</p>
        </Card>

        <Card orientation="vertical" className="p-4 bg-[#FFF9F0] border-[#D8C7A5]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6A5A44]">Paid Subscribers</span>
            <div className="w-8 h-8 rounded-lg bg-[#547A61]/15 text-[#547A61] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#2C241A] mt-2">{metrics.paidSubscribers}</div>
          <p className="text-[10px] text-[#8A7A63] mt-1">Active paid tier plans</p>
        </Card>

        <Card orientation="vertical" className="p-4 bg-[#FFF9F0] border-[#D8C7A5]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6A5A44]">Tenant Workspaces</span>
            <div className="w-8 h-8 rounded-lg bg-[#7A5520]/15 text-[#7A5520] flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#2C241A] mt-2">{metrics.totalOrganizations}</div>
          <p className="text-[10px] text-[#8A7A63] mt-1">Isolated brokerages</p>
        </Card>
      </div>

      {/* Feedback banner */}
      {feedbackMessage && (
        <div className="p-3 bg-[#A37432]/15 border border-[#A37432]/30 rounded-xl text-xs text-[#7A5520] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#7A5520] flex-shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <Card orientation="vertical" className="p-4 bg-[#FFF9F0] border-[#D8C7A5] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="md:col-span-2">
            <Input
              placeholder="Search by full name, registered email, or organization..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              icon={<Search className="w-4 h-4 text-[#6A5A44]" />}
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 bg-[#FFF9F0] border border-[#D8C7A5] rounded-lg px-3 text-xs text-[#2C241A] focus:outline-none focus:border-[#A37432] font-medium"
            >
              <option value="ALL">All Account Statuses</option>
              <option value="TRIALING">Active 7-Day Trial</option>
              <option value="ACTIVE">Paid & Active</option>
              <option value="PAST_DUE">Past Due</option>
              <option value="EXPIRED">Trial Expired / Canceled</option>
            </select>
          </div>

          {/* Plan filter */}
          <div>
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 bg-[#FFF9F0] border border-[#D8C7A5] rounded-lg px-3 text-xs text-[#2C241A] focus:outline-none focus:border-[#A37432] font-medium"
            >
              <option value="ALL">All Subscription Plans</option>
              <option value="STARTER">Starter Tier</option>
              <option value="PROFESSIONAL">Professional Tier</option>
              <option value="BUSINESS">Business Tier</option>
            </select>
          </div>
        </div>

        {/* Sort selector & filter reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#D8C7A5]/50 text-xs">
          <div className="flex items-center gap-2 text-[#6A5A44]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#7A5520]" />
            <span className="font-semibold">Sort by:</span>
            <button
              onClick={() => {
                setSortBy('newest');
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                sortBy === 'newest'
                  ? 'bg-[#A37432] text-[#FFF9F0] font-bold'
                  : 'text-[#6A5A44] hover:bg-[#F4EAD7]'
              }`}
            >
              Newest Registered
            </button>
            <button
              onClick={() => {
                setSortBy('lastlogin');
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                sortBy === 'lastlogin'
                  ? 'bg-[#A37432] text-[#FFF9F0] font-bold'
                  : 'text-[#6A5A44] hover:bg-[#F4EAD7]'
              }`}
            >
              Recent Login
            </button>
            <button
              onClick={() => {
                setSortBy('name');
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                sortBy === 'name'
                  ? 'bg-[#A37432] text-[#FFF9F0] font-bold'
                  : 'text-[#6A5A44] hover:bg-[#F4EAD7]'
              }`}
            >
              Name A-Z
            </button>
          </div>

          {(search || statusFilter !== 'ALL' || planFilter !== 'ALL' || sortBy !== 'newest') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setPlanFilter('ALL');
                setSortBy('newest');
                setPage(1);
              }}
              className="text-[#7A5520] hover:text-[#A37432] font-semibold underline text-xs"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </Card>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-[#8B4A4A]/10 border border-[#8B4A4A]/25 text-[#8B4A4A] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="xs" onClick={() => fetchUsers()}>
            Try Again
          </Button>
        </div>
      )}

      {/* Customer Monitoring Table */}
      <Card orientation="vertical" className="p-0 overflow-hidden bg-[#FFF9F0] border-[#D8C7A5] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4EAD7] border-b border-[#D8C7A5] text-[#6A5A44]">
              <tr>
                <th className="py-3 px-4 font-bold">Customer Profile</th>
                <th className="py-3 px-4 font-bold">Workspace / Org</th>
                <th className="py-3 px-4 font-bold">Contact Info</th>
                <th className="py-3 px-4 font-bold">Registration Date</th>
                <th className="py-3 px-4 font-bold">Last Successful Login</th>
                <th className="py-3 px-4 font-bold">Plan & Subscription</th>
                <th className="py-3 px-4 font-bold">Trial Window</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8C7A5]/60">
              {loading ? (
                // SKELETON LOADING STATE
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#E9DFC8]" />
                        <div className="space-y-1.5">
                          <div className="w-24 h-3 bg-[#E9DFC8] rounded" />
                          <div className="w-16 h-2 bg-[#E9DFC8] rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4"><div className="w-28 h-3 bg-[#E9DFC8] rounded" /></td>
                    <td className="py-3.5 px-4"><div className="w-32 h-3 bg-[#E9DFC8] rounded" /></td>
                    <td className="py-3.5 px-4"><div className="w-24 h-3 bg-[#E9DFC8] rounded" /></td>
                    <td className="py-3.5 px-4"><div className="w-24 h-3 bg-[#E9DFC8] rounded" /></td>
                    <td className="py-3.5 px-4"><div className="w-20 h-4 bg-[#E9DFC8] rounded-full" /></td>
                    <td className="py-3.5 px-4"><div className="w-24 h-3 bg-[#E9DFC8] rounded" /></td>
                    <td className="py-3.5 px-4 text-right"><div className="w-12 h-5 bg-[#E9DFC8] rounded ml-auto" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                // EMPTY STATE
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-[#A37432]/10 text-[#7A5520] flex items-center justify-center mx-auto">
                        <Users className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-[#2C241A]">No registered customers match your search</h3>
                      <p className="text-xs text-[#6A5A44]">
                        Try searching for a different keyword or resetting your filter criteria.
                      </p>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          setSearch('');
                          setStatusFilter('ALL');
                          setPlanFilter('ALL');
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                // POPULATED USER ROWS
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F7EEDC] transition-colors">
                    {/* User Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#A37432]/15 border border-[#A37432]/30 text-[#7A5520] flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-[#2C241A] flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {user.isOwner && (
                              <span title="Master SaaS Platform Owner">
                                <Shield className="w-3.5 h-3.5 text-[#A37432]" />
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#8A7A63] font-mono">{user.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Organization & Team Size */}
                    <td className="py-3.5 px-4 text-[#6A5A44]">
                      <div className="font-semibold text-[#2C241A]">{user.organizationName}</div>
                      <div className="text-[10px] text-[#7A5520] font-medium flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3" />
                        <span>{user.organizationMemberCount} {user.organizationMemberCount === 1 ? 'member' : 'members'}</span>
                      </div>
                    </td>

                    {/* Contact details */}
                    <td className="py-3.5 px-4 text-[#6A5A44]">
                      <div className="flex items-center gap-1.5 text-[#2C241A]">
                        <Mail className="w-3 h-3 text-[#7A5520] flex-shrink-0" />
                        <span className="truncate max-w-[180px]">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#8A7A63] mt-0.5">
                        <Phone className="w-3 h-3 text-[#7A5520] flex-shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                    </td>

                    {/* Registration Date */}
                    <td className="py-3.5 px-4 text-[#2C241A]">
                      <div className="font-medium">{formatDate(user.registrationDate)}</div>
                      <div className="text-[10px] text-[#8A7A63]">Registered</div>
                    </td>

                    {/* Last Login Time */}
                    <td className="py-3.5 px-4 text-[#2C241A]">
                      {user.lastLoginAt && user.lastLoginAt !== 'Never logged in' ? (
                        <div>
                          <div className="font-semibold text-[#547A61]">{formatDate(user.lastLoginAt)}</div>
                          <div className="text-[10px] text-[#8A7A63]">Authenticated session</div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#8A7A63] italic">Never logged in</span>
                      )}
                    </td>

                    {/* Subscription & Tier */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <Badge
                          variant={
                            user.planTier === 'BUSINESS'
                              ? 'gold'
                              : user.planTier === 'PROFESSIONAL'
                              ? 'info'
                              : 'neutral'
                          }
                        >
                          {user.planName}
                        </Badge>
                        <div>
                          {user.subscriptionStatus === 'TRIALING' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#A87932] bg-[#A87932]/10 px-2 py-0.5 rounded-full border border-[#A87932]/25">
                              <Clock className="w-2.5 h-2.5" />
                              {user.isTrialActive ? `${user.trialDaysRemaining}d left in trial` : 'Trial expired'}
                            </span>
                          ) : user.subscriptionStatus === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#547A61] bg-[#547A61]/10 px-2 py-0.5 rounded-full border border-[#547A61]/25">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Active Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8B4A4A] bg-[#8B4A4A]/10 px-2 py-0.5 rounded-full border border-[#8B4A4A]/25">
                              {user.subscriptionStatus}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Trial window details */}
                    <td className="py-3.5 px-4 text-[#6A5A44]">
                      {user.subscriptionStatus === 'TRIALING' ? (
                        <div className="text-[11px]">
                          <div><strong className="text-[#2C241A]">Expires:</strong> {formatDate(user.trialEndDate)}</div>
                          <div className="text-[10px] text-[#8A7A63]">Start: {formatDate(user.trialStartDate)}</div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#8A7A63]">N/A (Paid Tier)</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {!user.isOwner && (
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-[#F4EAD7] border-t border-[#D8C7A5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6A5A44]">
          <div>
            Showing <strong className="text-[#2C241A]">{users.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}</strong> to{' '}
            <strong className="text-[#2C241A]">{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> of{' '}
            <strong className="text-[#2C241A]">{pagination.total}</strong> registered customers
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1 || loading}
              icon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <span className="px-2 text-xs font-bold text-[#2C241A]">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page >= pagination.totalPages || loading}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Confirmation Modal for User Deletion */}
      {userToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setUserToDelete(null)}
          title="Confirm User Account Deletion"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-[#8B4A4A]/10 border border-[#8B4A4A]/20 rounded-xl text-[#8B4A4A] text-xs">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-[#8B4A4A] mt-0.5" />
              <div>
                <p className="font-bold text-[#8B4A4A]">Destructive Platform Owner Action</p>
                <p className="mt-1 text-[#2C241A]">
                  Are you sure you want to permanently delete user <strong className="text-[#8B4A4A]">{userToDelete.name}</strong> ({userToDelete.email}) from workspace <strong className="text-[#2C241A]">{userToDelete.organizationName}</strong>?
                </p>
                <p className="mt-1.5 text-[11px] text-[#6A5A44]">
                  This removes the user account and associated credentials from the persistent database.
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
