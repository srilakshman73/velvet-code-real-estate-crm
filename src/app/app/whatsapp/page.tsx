'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCRMStore } from '@/lib/store';
import { WhatsAppConversation, WhatsAppMessage } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
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
    currentUser,
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

  const totalSent = conversations.reduce(
    (sum, c) => sum + c.messages.filter((m) => m.direction === 'OUTBOUND').length,
    0
  );
  const totalReceived = conversations.reduce(
    (sum, c) => sum + c.messages.filter((m) => m.direction === 'INBOUND').length,
    0
  );
  const totalUnread = conversations.filter((c) => c.unreadCount > 0).length;

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
      .replace(/{{property_name}}/g, activeConv.interestedProperty || 'Residential Property')
      .replace(/{{agent_name}}/g, currentUser.name || 'Sri Lakshman')
      .replace(/{{site_visit_date}}/g, 'Tomorrow')
      .replace(/{{site_visit_time}}/g, '11:00 AM')
      .replace(/{{property_price}}/g, activeConv.budget || 'Market Price');

    setMessageInput(filled);
    setIsTemplateModalOpen(false);
  };

  const handleShareProperty = () => {
    if (!selectedPropertyShare || !activeConv) return;
    const prop = properties.find((p) => p.id === selectedPropertyShare);
    if (!prop) return;

    const propMsg = `Here are the verified details for ${prop.title}:\n• Price: ₹${(prop.priceINR / 10000000).toFixed(2)} Cr\n• Location: ${prop.locality}, ${prop.city}\n• Area: ${prop.areaSqFt} sq.ft (${prop.bedrooms || 3} BHK)\n• Amenities: ${prop.amenities.slice(0, 3).join(', ')}\n\nWould you like to schedule a private viewing?`;
    sendWhatsAppMessage(activeConv.id, propMsg, prop.featuredImageUrl);
    setSelectedPropertyShare('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1700px] mx-auto">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#29251F] tracking-tight flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[#3D7258]" />
              WhatsApp Cloud CRM
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-[#3D7258]/10 text-[#3D7258] border border-[#3D7258]/20 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3D7258] animate-pulse" />
              Live Inbox Connected
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#625B51] mt-1">
            Official Meta Cloud API • Direct click-to-chat with{' '}
            <strong className="text-[#3D7258] font-mono">+91 63833 95915</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/app/whatsapp/automation">
            <Button variant="outline" size="sm" leftIcon={<Zap className="w-3.5 h-3.5 text-[#805B25]" />}>
              Visual Automation Builder
            </Button>
          </Link>
          <a
            href={buildWhatsAppUrl('916383395915', 'Hello, I would like to know more about your Real Estate CRM.')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#3D7258] hover:bg-[#255740] text-white font-bold text-xs shadow-sm transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            +91 63833 95915
          </a>
        </div>
      </div>

      {/* 4 WhatsApp KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#D4C9B9] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)] space-y-1">
          <p className="text-xs uppercase tracking-wider text-[#625B51] font-semibold font-serif">
            Messages Sent
          </p>
          <p className="text-2xl font-bold text-[#29251F] font-mono">{totalSent}</p>
          <p className="text-[11px] text-[#3D7258] font-medium">100% Delivery Reliability</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#D4C9B9] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)] space-y-1">
          <p className="text-xs uppercase tracking-wider text-[#625B51] font-semibold font-serif">
            Replies Received
          </p>
          <p className="text-2xl font-bold text-[#29251F] font-mono">{totalReceived}</p>
          <p className="text-[11px] text-[#3D7258] font-medium">Real-Time Ingestion</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#D4C9B9] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)] space-y-1">
          <p className="text-xs uppercase tracking-wider text-[#625B51] font-semibold font-serif">
            Pending Replies
          </p>
          <p className="text-2xl font-bold text-[#805B25] font-mono">{totalUnread}</p>
          <p className="text-[11px] text-[#625B51] font-medium">Unread Inquiries</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#D4C9B9] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)] space-y-1">
          <p className="text-xs uppercase tracking-wider text-[#625B51] font-semibold font-serif">
            Active Chats
          </p>
          <p className="text-2xl font-bold text-[#3D7258] font-mono">{conversations.length}</p>
          <p className="text-[11px] text-[#625B51] font-medium">In CRM Pipeline</p>
        </div>
      </div>

      {/* ========================================== */}
      {/* 3-COLUMN WHATSAPP CRM INBOX */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-2xl border border-[#D4C9B9] bg-[#FFFDF8] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)] overflow-hidden h-[750px]">
        {/* ========================================== */}
        {/* COLUMN 1: CONVERSATIONS LIST (4 Cols) */}
        {/* ========================================== */}
        <div className="lg:col-span-4 border-r border-[#D4C9B9] flex flex-col bg-white">
          <div className="p-3.5 border-b border-[#D4C9B9] bg-[#E8E1D5]/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#625B51] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search WhatsApp messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D4C9B9] rounded-lg text-xs text-[#29251F] placeholder:text-[#625B51] outline-none focus:border-[#A374]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#D4C9B9]/50">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-[#625B51] space-y-2">
                <MessageSquare className="w-8 h-8 text-[#D4C9B9] mx-auto" />
                <p className="font-serif font-bold text-sm text-[#29251F]">No conversations yet</p>
                <p className="text-xs">
                  When leads message your business WhatsApp (+91 63833 95915) or you start outreach, conversations will appear here.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConv?.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#E8E1D5] border-l-4 border-[#3D7258]'
                        : 'hover:bg-[#E8E1D5]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="font-serif font-bold text-[#29251F] text-xs truncate">
                        {conv.customerName}
                      </span>
                      <span className="text-[10px] text-[#625B51] flex-shrink-0">
                        {formatRelativeTime(conv.lastMessageAt)}
                      </span>
                    </div>

                    <p className="text-xs text-[#625B51] line-clamp-1 leading-relaxed">
                      {conv.lastMessageText}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="text-[#3D7258] font-mono font-medium">{conv.customerPhone}</span>
                      {conv.unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#3D7258] text-white font-extrabold text-[9px]">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================== */}
        {/* COLUMN 2: ACTIVE CHAT THREAD (5 Cols) */}
        {/* ========================================== */}
        <div className="lg:col-span-5 flex flex-col bg-[#E8E1D5]/30">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 border-b border-[#D4C9B9] bg-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-serif font-bold text-[#29251F]">{activeConv.customerName}</h3>
                    {activeConv.leadStatus && (
                      <LeadStatusBadge status={activeConv.leadStatus} />
                    )}
                  </div>
                  <p className="text-[11px] text-[#625B51] font-mono mt-0.5">
                    {activeConv.customerPhone}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={() => setIsTemplateModalOpen(true)}
                    leftIcon={<FileText className="w-3.5 h-3.5 text-[#805B25]" />}
                  >
                    Templates
                  </Button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#D4C9B9_1px,transparent_1px)] [background-size:16px_16px]">
                {activeConv.messages.map((msg) => {
                  const isOut = msg.direction === 'OUTBOUND';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isOut ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-sm ${
                          isOut
                            ? 'bg-[#3D7258] text-white rounded-tr-none'
                            : 'bg-white text-[#29251F] border border-[#D4C9B9] rounded-tl-none'
                        }`}
                      >
                        {msg.mediaUrl && (
                          <div className="mb-2 rounded-lg overflow-hidden border border-[#D4C9B9]/50">
                            <img
                              src={msg.mediaUrl}
                              alt="Attached Brochure"
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        )}
                        <p>{msg.body}</p>
                        <div className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${isOut ? 'text-white/80' : 'text-[#625B51]'}`}>
                          <span>{msg.createdAt.split('T')[1]?.substring(0, 5) || '11:42'}</span>
                          {isOut && <CheckCheck className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-[#D4C9B9] bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Type a verified WhatsApp message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 bg-[#E8E1D5]/50 border border-[#D4C9B9] rounded-xl px-3.5 py-2 text-xs text-[#29251F] placeholder:text-[#625B51] outline-none focus:border-[#3D7258]"
                />
                <Button type="submit" variant="emerald" size="sm" className="px-3">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#625B51] space-y-2">
              <MessageSquare className="w-10 h-10 text-[#D4C9B9]" />
              <p className="font-serif font-bold text-sm text-[#29251F]">No conversations yet</p>
              <p className="text-xs max-w-xs">
                Select a contact from the inbox or start a conversation by connecting with your leads.
              </p>
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* COLUMN 3: CONTEXTUAL CRM SIDEBAR (3 Cols) */}
        {/* ========================================== */}
        <div className="lg:col-span-3 border-l border-[#D4C9B9] p-4 bg-white overflow-y-auto space-y-4 text-xs">
          <div className="pb-3 border-b border-[#D4C9B9]">
            <h4 className="font-serif font-bold text-[#805B25] uppercase tracking-wider text-[11px] mb-2">
              Buyer CRM Context
            </h4>
            <p className="font-serif font-bold text-[#29251F] text-sm">{activeConv?.customerName || 'No contact selected'}</p>
            <p className="text-[#625B51]">{activeConv?.customerPhone || '+91 63833 95915'}</p>
          </div>

          <div className="space-y-2 p-3 rounded-xl bg-[#E8E1D5] border border-[#D4C9B9]">
            <div className="flex justify-between">
              <span className="text-[#625B51]">Budget:</span>
              <span className="font-bold text-[#805B25] font-mono">{activeConv?.budget || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#625B51]">Property:</span>
              <span className="text-[#29251F] font-medium truncate max-w-[120px]">
                {activeConv?.interestedProperty || 'General Inquiry'}
              </span>
            </div>
          </div>

          {/* 1-Click Property Share Tool */}
          <div className="space-y-2 p-3 rounded-xl bg-[#E8E1D5] border border-[#D4C9B9]">
            <p className="font-serif font-bold text-[#29251F] text-[11px]">Instant Brochure Dispatch</p>
            <select
              value={selectedPropertyShare}
              onChange={(e) => setSelectedPropertyShare(e.target.value)}
              className="w-full bg-white border border-[#D4C9B9] text-[11px] text-[#29251F] rounded p-1.5 outline-none focus:border-[#A374]"
            >
              <option value="">Select Property Brochure...</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            {selectedPropertyShare && activeConv && (
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
              className="flex items-center justify-between p-2 rounded-lg bg-[#E8E1D5] hover:bg-[#D4C9B9]/40 text-[#29251F] font-medium text-[11px] transition-colors"
            >
              <span>View Full Lead Record</span>
              <ExternalLink className="w-3 h-3 text-[#625B51]" />
            </Link>
            <Link
              href="/app/site-visits"
              className="flex items-center justify-between p-2 rounded-lg bg-[#E8E1D5] hover:bg-[#D4C9B9]/40 text-[#29251F] font-medium text-[11px] transition-colors"
            >
              <span>Schedule Site Visit</span>
              <ExternalLink className="w-3 h-3 text-[#625B51]" />
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
              className="p-4 rounded-xl bg-white border border-[#D4C9B9] hover:border-[#3D7258] cursor-pointer transition-all space-y-2 group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-[#29251F] group-hover:text-[#3D7258] transition-colors">
                  {tpl.name}
                </span>
                <span className="text-[10px] font-bold text-[#3D7258] uppercase bg-[#3D7258]/10 px-2 py-0.5 rounded">
                  {tpl.category}
                </span>
              </div>
              <p className="text-xs text-[#625B51] italic">"{tpl.body}"</p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
