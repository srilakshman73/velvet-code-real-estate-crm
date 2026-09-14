'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Download,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  ArrowUpRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatINR } from '@/lib/utils';

interface PaymentLog {
  id: string;
  razorpayPaymentId: string;
  organizationName: string;
  planTier: string;
  amountINR: number;
  gstINR: number;
  totalINR: number;
  paymentMethod: string;
  status: 'CAPTURED' | 'REFUNDED' | 'FAILED';
  date: string;
}

const MOCK_PAYMENTS: PaymentLog[] = [
  {
    id: 'pay-001',
    razorpayPaymentId: 'pay_Nz819K3XpLa912',
    organizationName: 'Velvet Realty Solutions',
    planTier: 'PROFESSIONAL (Monthly)',
    amountINR: 1499,
    gstINR: 270,
    totalINR: 1769,
    paymentMethod: 'UPI AutoPay (GPay)',
    status: 'CAPTURED',
    date: '2026-09-01 10:14 AM',
  },
  {
    id: 'pay-002',
    razorpayPaymentId: 'pay_Kq991L2ZbVw441',
    organizationName: 'Heritage Luxury Estates',
    planTier: 'BUSINESS (Annual)',
    amountINR: 38390,
    gstINR: 6910,
    totalINR: 45300,
    paymentMethod: 'HDFC Corporate Visa',
    status: 'CAPTURED',
    date: '2026-06-15 03:22 PM',
  },
  {
    id: 'pay-003',
    razorpayPaymentId: 'pay_Ty772M4NcXv819',
    organizationName: 'Metropolis Prime Properties',
    planTier: 'BUSINESS (Annual)',
    amountINR: 38390,
    gstINR: 6910,
    totalINR: 45300,
    paymentMethod: 'ICICI NetBanking',
    status: 'CAPTURED',
    date: '2026-05-10 11:45 AM',
  },
  {
    id: 'pay-004',
    razorpayPaymentId: 'pay_Op331Q8PwQa201',
    organizationName: 'Skyline Realtors & Advisors',
    planTier: 'STARTER (Monthly)',
    amountINR: 599,
    gstINR: 108,
    totalINR: 707,
    paymentMethod: 'Paytm UPI',
    status: 'CAPTURED',
    date: '2026-09-01 09:00 AM',
  },
  {
    id: 'pay-005',
    razorpayPaymentId: 'pay_Lm449X1VbTy889',
    organizationName: 'Kovai Urban Lands & Villas',
    planTier: 'PROFESSIONAL (Monthly)',
    amountINR: 1499,
    gstINR: 270,
    totalINR: 1769,
    paymentMethod: 'SBI Debit Card',
    status: 'FAILED',
    date: '2026-09-10 08:30 PM',
  },
  {
    id: 'pay-006',
    razorpayPaymentId: 'pay_Gh881W9LkLm332',
    organizationName: 'Coastal Bay Realty',
    planTier: 'STARTER (Monthly)',
    amountINR: 599,
    gstINR: 108,
    totalINR: 707,
    paymentMethod: 'Axis Bank NetBanking',
    status: 'REFUNDED',
    date: '2026-08-15 02:10 PM',
  },
];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentLog[]>(MOCK_PAYMENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.organizationName.toLowerCase().includes(search.toLowerCase()) ||
      p.razorpayPaymentId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Payments & Transactions</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Audit Razorpay payment gateway webhooks, 18% GST invoice generation, and automated settlements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={() => {
              const headers = 'ID,RazorpayID,Organization,Plan,BaseAmount,GST,Total,Method,Status,Date\n';
              const rows = payments.map((p) => `"${p.id}","${p.razorpayPaymentId}","${p.organizationName}","${p.planTier}",${p.amountINR},${p.gstINR},${p.totalINR},"${p.paymentMethod}","${p.status}","${p.date}"`).join('\n');
              const blob = new Blob([headers + rows], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `velvet_code_payments_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
            }}
          >
            Export GST Ledger
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card orientation="vertical">
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Gross Inflow (MTD)</span>
          <div className="text-2xl font-serif font-bold text-white mt-2">₹14.63 Lakhs</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> 98.4% payment capture success
          </div>
        </Card>

        <Card orientation="vertical">
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Total GST Collected (18%)</span>
          <div className="text-2xl font-serif font-bold text-amber-400 mt-2">₹2.23 Lakhs</div>
          <div className="text-xs text-neutral-400 mt-1">Ready for GSTR-1 e-filing</div>
        </Card>

        <Card orientation="vertical">
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Settled to ICICI Current A/C</span>
          <div className="text-2xl font-serif font-bold text-emerald-400 mt-2">T+1 Daily Cycle</div>
          <div className="text-xs text-neutral-400 mt-1">Automatic Razorpay nodal transfer</div>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by Razorpay Payment ID or Tenant Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-neutral-500" />}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-300 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="CAPTURED">Captured (Success)</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <Card orientation="vertical" className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400">
              <tr>
                <th className="py-3 px-4 font-medium">Payment ID & Org</th>
                <th className="py-3 px-4 font-medium">Plan Item</th>
                <th className="py-3 px-4 font-medium">Base Amount</th>
                <th className="py-3 px-4 font-medium">GST (18%)</th>
                <th className="py-3 px-4 font-medium">Total Paid</th>
                <th className="py-3 px-4 font-medium">Method</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-900/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-white">
                    <div>
                      <div className="text-sm font-semibold text-white">{p.organizationName}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{p.razorpayPaymentId}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-neutral-300 font-medium">
                    {p.planTier}
                  </td>
                  <td className="py-3 px-4 font-mono text-neutral-300">
                    ₹{p.amountINR.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-neutral-400">
                    ₹{p.gstINR.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    ₹{p.totalINR.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-neutral-400">
                    {p.paymentMethod}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={p.status === 'CAPTURED' ? 'success' : p.status === 'FAILED' ? 'error' : 'warning'}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="xs" icon={<Download className="w-3.5 h-3.5" />}>
                      PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
