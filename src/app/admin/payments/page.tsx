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

const MOCK_PAYMENTS: PaymentLog[] = [];

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
          <h1 className="text-3xl font-serif font-bold text-[#24211D] tracking-tight">Payment Receipts & GST Ledger</h1>
          <p className="text-sm text-[#766F63] mt-1">
            Real-time Razorpay payment transactions, automatic tax invoices, and monthly GST audit logs.
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
        <Card orientation="vertical" className="bg-[#FFFCF6] border-[#DDD4C4] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
          <span className="text-xs font-semibold text-[#766F63] uppercase tracking-wider font-serif">Gross Inflow (MTD)</span>
          <div className="text-2xl font-serif font-bold text-[#24211D] mt-2">₹0</div>
          <div className="text-xs text-[#2E6B4F] mt-1 flex items-center gap-1 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" /> 100% gateway uptime
          </div>
        </Card>

        <Card orientation="vertical" className="bg-[#FFFCF6] border-[#DDD4C4] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
          <span className="text-xs font-semibold text-[#766F63] uppercase tracking-wider font-serif">Total GST Collected (18%)</span>
          <div className="text-2xl font-serif font-bold text-[#8F642B] mt-2">₹0</div>
          <div className="text-xs text-[#766F63] mt-1">Ready for GSTR-1 e-filing</div>
        </Card>

        <Card orientation="vertical" className="bg-[#FFFCF6] border-[#DDD4C4] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
          <span className="text-xs font-semibold text-[#766F63] uppercase tracking-wider font-serif">Settled to ICICI Current A/C</span>
          <div className="text-2xl font-serif font-bold text-[#2E6B4F] mt-2">T+1 Daily Cycle</div>
          <div className="text-xs text-[#766F63] mt-1">Automatic Razorpay nodal transfer</div>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by Razorpay Payment ID or Tenant Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-[#766F63]" />}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-[#DDD4C4] rounded-lg px-3 py-2 text-xs text-[#24211D] focus:outline-none focus:border-[#A374]"
        >
          <option value="ALL">All Statuses</option>
          <option value="CAPTURED">Captured (Success)</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <Card orientation="vertical" className="p-0 overflow-hidden bg-[#FFFCF6] border-[#DDD4C4] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F3EA] border-b border-[#DDD4C4] text-[#766F63]">
              <tr>
                <th className="py-3 px-4 font-semibold">Payment ID & Org</th>
                <th className="py-3 px-4 font-semibold">Plan Item</th>
                <th className="py-3 px-4 font-semibold">Base Amount</th>
                <th className="py-3 px-4 font-semibold">GST (18%)</th>
                <th className="py-3 px-4 font-semibold">Total Paid</th>
                <th className="py-3 px-4 font-semibold">Method</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD4C4]/60">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#766F63]">
                    <Receipt className="w-8 h-8 text-[#DDD4C4] mx-auto mb-2" />
                    <p className="font-serif font-bold text-sm text-[#24211D]">No payment transactions yet</p>
                    <p className="text-xs">Real customer subscription payments and GST invoices will be recorded here.</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F7F3EA]/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-[#24211D]">
                      <div>
                        <div className="text-sm font-serif font-bold text-[#24211D]">{p.organizationName}</div>
                        <div className="text-[10px] text-[#766F63] font-mono">{p.razorpayPaymentId}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#766F63] font-medium">
                      {p.planTier}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#766F63]">
                      ₹{p.amountINR.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#766F63]">
                      ₹{p.gstINR.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#24211D]">
                      ₹{p.totalINR.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-[#766F63]">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
