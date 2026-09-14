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
    { label: "Rahul Sharma's History", query: "Summarize Rahul Sharma's history" },
    { label: 'Revenue Performance Analysis', query: 'Analyze our monthly revenue and sales performance' },
    { label: 'Draft Follow-up to Dr. Priya', query: 'Draft a personalized follow-up WhatsApp message to Dr. Priya' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              Realty AI Assistant Console
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
              Enterprise Intelligence
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Contextual real estate AI engine with direct read-only access to your active leads, deals, properties, and site visits.
          </p>
        </div>

        {/* Quota & Reset */}
        <div className="flex items-center gap-4">
          <div className="p-2.5 px-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs flex items-center gap-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-zinc-400 text-[10px]">Monthly Quota</p>
              <p className="font-bold text-white font-mono">
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
        <div className="lg:col-span-8 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl flex flex-col h-[680px] overflow-hidden">
          {/* Security Policy Badge */}
          <div className="p-3 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Lock className="w-3.5 h-3.5" />
              Multi-tenant Isolated • Proprietary CRM Engine
            </span>
            <span className="text-[11px] text-zinc-500">Human confirmation required for WhatsApp sends</span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
            {aiMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-4 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-amber-500 text-black font-semibold rounded-tr-none shadow-lg'
                      : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none shadow-md'
                  }`}
                >
                  <p>{msg.content}</p>

                  {/* Action Draft Preview */}
                  {msg.actionDraft && msg.role === 'assistant' && (
                    <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-amber-500/40 text-zinc-100 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4" />
                          Prepared Action Draft
                        </span>
                        {msg.actionDraft.isExecuted ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                          </span>
                        ) : (
                          <span className="text-zinc-400">Review Before Sending</span>
                        )}
                      </div>

                      {msg.actionDraft.recipientName && (
                        <p className="text-xs text-zinc-300">
                          Recipient: <strong>{msg.actionDraft.recipientName}</strong> ({msg.actionDraft.recipientPhone})
                        </p>
                      )}

                      {msg.actionDraft.messageText && (
                        <p className="text-xs italic text-zinc-300 bg-zinc-900 p-3 rounded-lg border border-zinc-800">
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
                          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 underline ml-2"
                        >
                          Open Inbox <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2 bg-zinc-900/60 border-t border-zinc-800 overflow-x-auto flex gap-2 no-scrollbar">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputVal(p.query);
                  sendAIMessage(p.query);
                }}
                className="px-3 py-1.5 text-xs bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-800 rounded-full whitespace-nowrap transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3.5 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2.5"
          >
            <input
              type="text"
              placeholder="Ask Realty AI to analyze leads, summarize deals, or draft messages..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-500 outline-none focus:border-amber-400"
            />
            <Button type="submit" variant="gold" size="md" className="font-bold px-5">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Right Sidebar: Quick AI CRM Insights (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
              Live AI CRM Intelligence
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> High Intent Pipeline
                </span>
                <p className="text-zinc-400">
                  Rahul Sharma & Dr. Priya have an <strong>88%+ conversion probability</strong>. Potential revenue: ₹5.30 Cr.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-400" /> Hot Property Demand
                </span>
                <p className="text-zinc-400">
                  <strong>The Grand Emerald Heights</strong> has 14 matched inquiries looking for 3BHK configurations.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" /> Agent Velocity
                </span>
                <p className="text-zinc-400">
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
