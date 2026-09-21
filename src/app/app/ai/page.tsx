'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCRMStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { buildWhatsAppUrl } from '@/lib/utils';
import {
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Zap,
  TrendingUp,
  Building,
  Users,
  Lock,
} from 'lucide-react';

export default function RealtyAIPage() {
  const {
    aiMessages,
    sendAIMessage,
    executeAIAction,
    clearAIChat,
    subscription,
    currentPlanLimits,
    checkLimit,
    leads,
    properties,
    deals,
  } = useCRMStore();

  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    const limitCheck = checkLimit('ai');
    if (!limitCheck.allowed) {
      alert(limitCheck.reason);
      return;
    }

    sendAIMessage(inputVal);
    setInputVal('');
  };

  const samplePrompts = [
    { label: "Today's Follow-ups", query: "Show me today's follow-ups" },
    { label: 'Highest Conversion Leads', query: 'Which leads are most likely to convert?' },
    { label: 'Properties Under ₹1.5 Cr', query: 'Show properties below ₹1.5 Crore' },
    { label: "Lead Pipeline Summary", query: "Summarize our active lead pipeline" },
    { label: 'Revenue Performance Analysis', query: 'Analyze our monthly revenue and sales performance' },
    { label: 'Draft Welcome Message', query: 'Draft a personalized follow-up WhatsApp message for new inquiries' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#E9DFC8] text-[#2C241A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C241A] tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#A37432]" />
              Realty AI Assistant Console
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-[#A37432]/15 text-[#7A5520] border border-[#A37432]/30 rounded-full">
              Enterprise Intelligence
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6A5A44] mt-1">
            Contextual real estate AI engine with direct read-only access to your active leads, deals, properties, and site visits.
          </p>
        </div>

        {/* Quota & Reset */}
        <div className="flex items-center gap-4">
          <div className="p-2.5 px-4 rounded-xl bg-[#FFF9F0] border border-[#D8C7A5] text-xs flex items-center gap-3 shadow-[0_4px_16px_rgba(120,90,40,0.06)]">
            <Zap className="w-4 h-4 text-[#A37432]" />
            <div>
              <p className="text-[#6A5A44] text-[10px]">Monthly Quota</p>
              <p className="font-bold text-[#2C241A] font-mono">
                {subscription.usage.aiRequestsUsed} / {currentPlanLimits.monthlyAIQuota} Requests
              </p>
            </div>
          </div>

          <Button
            variant="subtle"
            size="sm"
            onClick={clearAIChat}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Clear Conversation
          </Button>
        </div>
      </div>

      {/* Main AI Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Console: Chat Stream (8 Cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-[#D8C7A5] bg-[#FFF9F0] shadow-[0_8px_24px_rgba(120,90,40,0.08)] flex flex-col h-[680px] overflow-hidden">
          {/* Security Policy Badge */}
          <div className="p-3 border-b border-[#D8C7A5] bg-[#F4EAD7] flex items-center justify-between text-xs text-[#6A5A44]">
            <span className="flex items-center gap-1.5 text-[#547A61] font-medium">
              <Lock className="w-3.5 h-3.5" />
              Multi-tenant Isolated • Proprietary CRM Engine
            </span>
            <span className="text-[11px] text-[#8A7A63]">Human confirmation required for WhatsApp sends</span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm bg-[#FFF9F0]">
            {aiMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-[#A37432]/15 border border-[#A37432]/30 text-[#7A5520] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-4 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#A37432] text-white font-medium rounded-tr-none shadow-sm'
                      : 'bg-[#F4EAD7] text-[#2C241A] border border-[#D8C7A5] rounded-tl-none shadow-xs'
                  }`}
                >
                  <p>{msg.content}</p>

                  {/* Action Draft Preview */}
                  {msg.actionDraft && msg.role === 'assistant' && (
                    <div className="mt-4 p-4 rounded-xl bg-[#FFF9F0] border border-[#A37432] text-[#2C241A] space-y-2 shadow-sm">
                      <div className="flex items-center justify-between text-xs font-bold text-[#7A5520] uppercase tracking-wider font-serif">
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-[#547A61]" />
                          Prepared Action Draft
                        </span>
                        {msg.actionDraft.isExecuted ? (
                          <span className="text-[#547A61] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                          </span>
                        ) : (
                          <span className="text-[#6A5A44]">Review Before Sending</span>
                        )}
                      </div>

                      {msg.actionDraft.recipientName && (
                        <p className="text-xs text-[#6A5A44]">
                          Recipient: <strong className="text-[#2C241A]">{msg.actionDraft.recipientName}</strong> ({msg.actionDraft.recipientPhone})
                        </p>
                      )}

                      {msg.actionDraft.messageText && (
                        <p className="text-xs italic text-[#2C241A] bg-[#F4EAD7] p-3 rounded-lg border border-[#D8C7A5]">
                          "{msg.actionDraft.messageText}"
                        </p>
                      )}

                      <div className="pt-2 flex items-center gap-2">
                        <Button
                          variant="emerald"
                          size="xs"
                          onClick={() => executeAIAction(msg.id)}
                          leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                        >
                          Send on WhatsApp
                        </Button>
                        <Link
                          href="/app/whatsapp"
                          className="text-xs text-[#6A5A44] hover:text-[#2C241A] flex items-center gap-1 underline ml-2 transition-colors"
                        >
                          Open Inbox <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-[#2C241A] border border-[#D8C7A5] text-[#FFF9F0] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2 bg-[#F4EAD7] border-t border-[#D8C7A5] overflow-x-auto flex gap-2 no-scrollbar">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputVal(p.query);
                  sendAIMessage(p.query);
                }}
                className="px-3 py-1.5 text-xs bg-[#FFF9F0] hover:bg-[#A37432]/15 text-[#2C241A] hover:text-[#7A5520] border border-[#D8C7A5] rounded-full whitespace-nowrap transition-colors shadow-2xs cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3.5 bg-[#F4EAD7] border-t border-[#D8C7A5] flex items-center gap-2.5"
          >
            <input
              type="text"
              placeholder="Ask Realty AI to analyze leads, summarize deals, or draft messages..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 bg-[#FFF9F0] border border-[#D8C7A5] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#2C241A] placeholder:text-[#8A7A63] outline-none focus:border-[#A37432]"
            />
            <Button type="submit" variant="gold" size="md" className="font-bold px-5">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Right Sidebar: Quick AI CRM Insights (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl bg-[#FFF9F0] border border-[#D8C7A5] shadow-[0_8px_24px_rgba(120,90,40,0.08)] space-y-4">
            <h3 className="text-sm font-serif font-bold text-[#7A5520] uppercase tracking-wider">
              Live AI CRM Intelligence
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F4EAD7] border border-[#D8C7A5] space-y-1 shadow-2xs">
                <span className="font-bold text-[#2C241A] flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#547A61]" /> High Intent Pipeline
                </span>
                <p className="text-[#6A5A44]">
                  High-intent inquiries in your CRM are evaluated in real time for <strong>conversion probability and budget match</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F4EAD7] border border-[#D8C7A5] space-y-1 shadow-2xs">
                <span className="font-bold text-[#2C241A] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#A37432]" /> Hot Property Demand
                </span>
                <p className="text-[#6A5A44]">
                  <strong>The Grand Emerald Heights</strong> has 14 matched inquiries looking for 3BHK configurations.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F4EAD7] border border-[#D8C7A5] space-y-1 shadow-2xs">
                <span className="font-bold text-[#2C241A] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#C39A5B]" /> Agent Velocity
                </span>
                <p className="text-[#6A5A44]">
                  Average site visit to booking time: <strong>11 days</strong> (34% faster than industry benchmark).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
