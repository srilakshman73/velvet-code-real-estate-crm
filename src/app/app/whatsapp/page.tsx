'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCRMStore } from '@/lib/store';
import { WhatsAppConversation, WhatsAppMessage } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LeadStatusBadge } from '@/components/ui/Badge';
import { formatTime, formatRelativeTime, buildWhatsAppUrl } from '@/lib/utils';
import {
  MessageSquare,
  Send,
  Paperclip,
  Smile,
  Search,
  CheckCheck,
  Building,
  User,
  Phone,
  Zap,
  Sparkles,
  Sliders,
  ExternalLink,
  PlusCircle,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function WhatsAppCRMPage() {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    sendWhatsAppMessage,
    templates,
    properties,
    leads,
  } = useCRMStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedPropertyShare, setSelectedPropertyShare] = useState('');

  const activeConv =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const matchedLead = leads.find((l) => l.phone === activeConv?.customerPhone);

  const filteredConversations = conversations.filter(
    (c) =>
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerPhone.includes(searchTerm) ||
      c.lastMessageText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeConv) return;
    sendWhatsAppMessage(activeConv.id, messageInput);
    setMessageInput('');
  };

  const handleApplyTemplate = (templateBody: string) => {
    if (!activeConv) return;
    const filled = templateBody
      .replace(/{{customer_name}}/g, activeConv.customerName)
      .replace(/{{property_name}}/g, activeConv.interestedProperty || 'The Grand Emerald Heights')
      .replace(/{{agent_name}}/g, 'Karthik Subramanian')
      .replace(/{{site_visit_date}}/g, '15 Sep 2026')
      .replace(/{{site_visit_time}}/g, '11:00 AM')
      .replace(/{{property_price}}/g, activeConv.budget || '₹1.45 Cr');

    setMessageInput(filled);
    setIsTemplateModalOpen(false);
  };

  const handleShareProperty = () => {
    if (!selectedPropertyShare || !activeConv) return;
    const prop = properties.find((p) => p.id === selectedPropertyShare);
    if (!prop) return;

    const propMsg = `Here are the verified details for ${prop.title}:\n• Price: ₹${(prop.priceINR / 10000000).toFixed(2)} Cr\n• Location: ${prop.locality}, ${prop.city}\n• Area: ${prop.areaSqFt} sq.ft (${prop.bedrooms || 3} BHK)\n• Amenities: ${prop.amenities.slice(0, 3).join(', ')}\n\nWould you like me to schedule a private viewing?`;
    sendWhatsAppMessage(activeConv.id, propMsg, prop.featuredImageUrl);
    setSelectedPropertyShare('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1700px] mx-auto">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
              WhatsApp Cloud CRM
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Inbox Connected
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Official Business API Stream • Tappable click-to-chat with <strong className="text-emerald-400">+91 94436 47190</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/app/whatsapp/automation">
            <Button variant="outline" size="sm" leftIcon={<Zap className="w-3.5 h-3.5 text-amber-400" />}>
              Visual Automation Builder
            </Button>
          </Link>
          <a
            href={buildWhatsAppUrl('919443647190', 'Hello Velvet Code, I want to test the WhatsApp integration.')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            +91 94436 47190
          </a>
        </div>
      </div>

      {/* 4 WhatsApp KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
          <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            Messages Sent
          </p>
          <p className="text-2xl font-bold text-white font-mono">1,284</p>
          <p className="text-[11px] text-emerald-400 font-medium">99.8% Delivery Rate</p>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
          <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            Replies Received
          </p>
          <p className="text-2xl font-bold text-white font-mono">842</p>
          <p className="text-[11px] text-emerald-400 font-medium">65.5% High Engagement</p>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
          <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            Pending Replies
          </p>
          <p className="text-2xl font-bold text-amber-400 font-mono">37</p>
          <p className="text-[11px] text-zinc-400 font-medium">Avg response 4 mins</p>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
          <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            Active Chats
          </p>
          <p className="text-2xl font-bold text-emerald-400 font-mono">64</p>
          <p className="text-[11px] text-zinc-400 font-medium">In CRM Pipeline</p>
        </div>
      </div>

      {/* ========================================== */}
      {/* 3-COLUMN WHATSAPP CRM INBOX */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden h-[750px]">
        {/* ========================================== */}
        {/* COLUMN 1: CONVERSATIONS LIST (3 Cols) */}
        {/* ========================================== */}
        <div className="lg:col-span-4 border-r border-zinc-800 flex flex-col bg-zinc-950/90">
          <div className="p-3.5 border-b border-zinc-800 bg-zinc-900/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search WhatsApp messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-500 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
            {filteredConversations.map((conv) => {
              const isSelected = conv.id === activeConv?.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-zinc-900 border-l-2 border-emerald-400'
                      : 'hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="font-bold text-white text-xs truncate">
                      {conv.customerName}
                    </span>
                    <span className="text-[10px] text-zinc-500 flex-shrink-0">
                      {formatRelativeTime(conv.lastMessageAt)}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-1 leading-relaxed">
                    {conv.lastMessageText}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-emerald-400 font-mono">{conv.customerPhone}</span>
                    {conv.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-black font-extrabold text-[9px]">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================== */}
        {/* COLUMN 2: ACTIVE CHAT THREAD (5 Cols) */}
        {/* ========================================== */}
        <div className="lg:col-span-5 flex flex-col bg-zinc-900/30">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 border-b border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{activeConv.customerName}</h3>
                    {activeConv.leadStatus && (
                      <LeadStatusBadge status={activeConv.leadStatus} />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    {activeConv.customerPhone}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={() => setIsTemplateModalOpen(true)}
                    leftIcon={<FileText className="w-3.5 h-3.5 text-amber-400" />}
                  >
                    Templates
                  </Button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]">
                {activeConv.messages.map((msg) => {
                  const isOut = msg.direction === 'OUTBOUND';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isOut ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-md ${
                          isOut
                            ? 'bg-emerald-900/80 text-emerald-50 border border-emerald-500/30 rounded-tr-none'
                            : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none'
                        }`}
                      >
                        {msg.mediaUrl && (
                          <div className="mb-2 rounded-lg overflow-hidden border border-zinc-700">
                            <img
                              src={msg.mediaUrl}
                              alt="Attached Brochure"
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        )}
                        <p>{msg.body}</p>
                        <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-zinc-400">
                          <span>{msg.createdAt.split('T')[1]?.substring(0, 5) || '11:42'}</span>
                          {isOut && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Type a verified WhatsApp message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-emerald-400"
                />
                <Button type="submit" variant="emerald" size="sm" className="px-3">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500 text-xs">
              Select a conversation to begin messaging
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* COLUMN 3: CONTEXTUAL CRM SIDEBAR (3 Cols) */}
        {/* ========================================== */}
        <div className="lg:col-span-3 border-l border-zinc-800 p-4 bg-zinc-950/90 overflow-y-auto space-y-4 text-xs">
          <div className="pb-3 border-b border-zinc-800">
            <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] mb-2">
              Buyer CRM Context
            </h4>
            <p className="font-bold text-white text-sm">{activeConv?.customerName}</p>
            <p className="text-zinc-400">{activeConv?.customerPhone}</p>
          </div>

          <div className="space-y-2 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="flex justify-between">
              <span className="text-zinc-400">Budget:</span>
              <span className="font-bold text-amber-300">{activeConv?.budget || '₹1.45 Cr'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Property:</span>
              <span className="text-zinc-200 truncate max-w-[120px]">
                {activeConv?.interestedProperty || 'Emerald Heights'}
              </span>
            </div>
          </div>

          {/* 1-Click Property Share Tool */}
          <div className="space-y-2 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <p className="font-bold text-white text-[11px]">Instant Brochure Dispatch</p>
            <select
              value={selectedPropertyShare}
              onChange={(e) => setSelectedPropertyShare(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 rounded p-1.5 outline-none"
            >
              <option value="">Select Property Brochure...</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            {selectedPropertyShare && (
              <Button
                variant="emerald"
                size="xs"
                className="w-full mt-1"
                onClick={handleShareProperty}
              >
                Send Property Spec Sheet
              </Button>
            )}
          </div>

          {/* Deep Navigation */}
          <div className="space-y-1.5 pt-2">
            <Link
              href="/app/leads"
              className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 font-medium text-[11px]"
            >
              <span>View Full Lead Record</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </Link>
            <Link
              href="/app/site-visits"
              className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 font-medium text-[11px]"
            >
              <span>Schedule Site Visit</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* WhatsApp Templates Modal */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        title="WhatsApp Approved Message Templates"
        description="Select a pre-approved template with dynamic customer and property variables."
      >
        <div className="space-y-3 text-xs sm:text-sm">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => handleApplyTemplate(tpl.body)}
              className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-400 cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white group-hover:text-emerald-300">
                  {tpl.name}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded">
                  {tpl.category}
                </span>
              </div>
              <p className="text-xs text-zinc-300 italic">"{tpl.body}"</p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
