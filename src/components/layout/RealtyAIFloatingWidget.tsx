'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCRMStore } from '@/lib/store';
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
    "Summarize our active lead pipeline",
    'Draft a personalized follow-up WhatsApp message',
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 sm:bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#A374] hover:bg-[#8F642B] text-[#151515] font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 group border border-[#A374]/60"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-[#151515]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#2E6B4F] rounded-full animate-ping" />
          </div>
          <span className="text-sm font-bold tracking-tight">Ask Realty AI</span>
        </button>
      )}

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-[#FFFCF6] border border-[#DDD4C4] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-[#24211D]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#DDD4C4] bg-[#F7F3EA]/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#A374] text-[#151515] shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#24211D] tracking-wide">
                    Realty AI
                  </h3>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-[#A374]/20 text-[#7A5320] border border-[#A374]/40 rounded">
                    CRM Agent
                  </span>
                </div>
                <p className="text-[11px] text-[#766F63]">
                  Intelligent Real Estate Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearAIChat}
                title="Reset Conversation"
                className="p-1.5 text-[#766F63] hover:text-[#24211D] rounded-lg hover:bg-[#EFE8DA] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#766F63] hover:text-[#24211D] rounded-lg hover:bg-[#EFE8DA] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Usage Meter Bar */}
          <div className="px-4 py-1.5 bg-[#F7F3EA]/60 border-b border-[#DDD4C4] flex items-center justify-between text-[11px] text-[#766F63]">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#8F642B]" />
              AI Quota: {subscription.usage.aiRequestsUsed} / {currentPlanLimits.monthlyAIQuota} used
            </span>
            <Link
              href="/app/billing"
              className="text-[#8F642B] hover:underline font-bold text-[10px]"
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
                  <div className="w-7 h-7 rounded-full bg-[#A374]/20 border border-[#A374]/40 text-[#8F642B] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#A374] text-[#151515] font-semibold rounded-tr-none shadow-xs'
                      : 'bg-[#F7F3EA] text-[#24211D] border border-[#DDD4C4] rounded-tl-none shadow-xs'
                  }`}
                >
                  <div>{msg.content}</div>

                  {/* Contextual Action Draft Preview */}
                  {msg.actionDraft && msg.role === 'assistant' && (
                    <div className="mt-3 p-3 rounded-xl bg-[#FFFCF6] border border-[#A374]/40 text-[#24211D]">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#8F642B] uppercase tracking-wider mb-1.5">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          Prepared Action Draft
                        </span>
                        {msg.actionDraft.isExecuted ? (
                          <span className="text-[#2E6B4F] flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Ready / Opened
                          </span>
                        ) : (
                          <span className="text-[#766F63]">Requires Confirmation</span>
                        )}
                      </div>

                      {msg.actionDraft.recipientName && (
                        <p className="text-[11px] text-[#24211D] mb-1">
                          To: <strong>{msg.actionDraft.recipientName}</strong> ({msg.actionDraft.recipientPhone})
                        </p>
                      )}

                      {msg.actionDraft.messageText && (
                        <p className="text-[11px] italic text-[#24211D] bg-[#F7F3EA] p-2.5 rounded-lg border border-[#DDD4C4] my-2">
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
                            className="text-[11px] text-[#766F63] hover:text-[#24211D] flex items-center gap-0.5 underline font-semibold"
                          >
                            Open Inbox <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-[#EFE8DA] border border-[#DDD4C4] text-[#24211D] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-[10px]">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-[#F7F3EA] border-t border-[#DDD4C4] overflow-x-auto flex gap-1.5 no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputValue(prompt);
                  sendAIMessage(prompt);
                }}
                className="px-2.5 py-1 text-[10px] font-semibold bg-[#FFFCF6] hover:bg-[#EFE8DA] text-[#24211D] hover:text-[#8F642B] border border-[#DDD4C4] rounded-full whitespace-nowrap transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-[#F7F3EA] border-t border-[#DDD4C4] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Realty AI about your leads, deals, properties..."
              className="flex-1 bg-[#FFFCF6] border border-[#DDD4C4] rounded-xl px-3.5 py-2 text-xs text-[#24211D] placeholder:text-[#766F63]/60 outline-none focus:border-[#A374]"
            />
            <Button
              type="submit"
              variant="gold"
              size="sm"
              disabled={!inputValue.trim()}
              className="px-3 font-bold"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
