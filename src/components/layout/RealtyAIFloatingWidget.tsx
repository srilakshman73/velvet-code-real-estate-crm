'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCRMStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User as UserIcon,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function RealtyAIFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    aiMessages,
    sendAIMessage,
    executeAIAction,
    clearAIChat,
    subscription,
    currentPlanLimits,
    checkLimit,
  } = useCRMStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [aiMessages, isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const limitCheck = checkLimit('ai');
    if (!limitCheck.allowed) {
      alert(limitCheck.reason);
      return;
    }

    sendAIMessage(inputValue);
    setInputValue('');
  };

  const quickPrompts = [
    "Show me today's follow-ups",
    'Which leads are most likely to convert?',
    'Show properties below ₹1.5 Crore',
    "Summarize Rahul Sharma's history",
    'Draft a follow-up WhatsApp to Dr. Priya',
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 sm:bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black font-bold shadow-2xl shadow-amber-500/40 hover:shadow-amber-500/60 hover:scale-105 active:scale-95 transition-all duration-200 group border border-amber-300/50"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 animate-pulse text-zinc-950" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          </div>
          <span className="text-sm font-bold tracking-tight">Ask Realty AI</span>
        </button>
      )}

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-zinc-950 border border-amber-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-black shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Realty AI
                  </h3>
                  <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">
                    CRM Agent
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Intelligent Real Estate Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearAIChat}
                title="Reset Conversation"
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Usage Meter Bar */}
          <div className="px-4 py-1.5 bg-zinc-900/40 border-b border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              AI Quota: {subscription.usage.aiRequestsUsed} / {currentPlanLimits.monthlyAIQuota} used
            </span>
            <Link
              href="/app/billing"
              className="text-amber-400 hover:underline font-medium text-[10px]"
            >
              Upgrade
            </Link>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {aiMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-amber-500 text-black font-medium rounded-tr-none shadow-md'
                      : 'bg-zinc-900 text-zinc-200 border border-zinc-800/90 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div>{msg.content}</div>

                  {/* Contextual Action Draft Preview */}
                  {msg.actionDraft && msg.role === 'assistant' && (
                    <div className="mt-3 p-3 rounded-xl bg-zinc-950/80 border border-amber-500/30 text-zinc-100">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1.5">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          Prepared Action Draft
                        </span>
                        {msg.actionDraft.isExecuted ? (
                          <span className="text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Ready / Opened
                          </span>
                        ) : (
                          <span className="text-zinc-400">Requires Confirmation</span>
                        )}
                      </div>

                      {msg.actionDraft.recipientName && (
                        <p className="text-[11px] text-zinc-300 mb-1">
                          To: <strong>{msg.actionDraft.recipientName}</strong> ({msg.actionDraft.recipientPhone})
                        </p>
                      )}

                      {msg.actionDraft.messageText && (
                        <p className="text-[11px] italic text-zinc-300 bg-zinc-900 p-2 rounded border border-zinc-800 my-2">
                          "{msg.actionDraft.messageText}"
                        </p>
                      )}

                      {msg.actionDraft.type === 'WHATSAPP_MESSAGE' && (
                        <div className="mt-2.5 flex items-center gap-2">
                          <Button
                            variant="emerald"
                            size="xs"
                            onClick={() => executeAIAction(msg.id)}
                            leftIcon={<MessageSquare className="w-3 h-3" />}
                          >
                            Send on WhatsApp
                          </Button>
                          <Link
                            href="/app/whatsapp"
                            className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-0.5 underline"
                          >
                            Open Inbox <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-zinc-950 border-t border-zinc-900 overflow-x-auto flex gap-1.5 no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputValue(prompt);
                  sendAIMessage(prompt);
                }}
                className="px-2.5 py-1 text-[10px] font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-800 rounded-full whitespace-nowrap transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-zinc-900/90 border-t border-zinc-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Realty AI about your leads, deals, properties..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-amber-400/70"
            />
            <Button
              type="submit"
              variant="gold"
              size="sm"
              disabled={!inputValue.trim()}
              className="px-3"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
