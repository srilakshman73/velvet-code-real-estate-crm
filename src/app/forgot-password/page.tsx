'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VelvetCodeLogo } from '@/components/brand/VelvetCodeLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to dispatch reset link');
        setIsLoading(false);
        return;
      }

      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
      setSubmitted(true);
      setIsLoading(false);
    } catch {
      setErrorMsg('Failed to connect to recovery service. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E9DFC8] text-[#2C241A] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#FFF9F0] border border-[#D8C7A5] rounded-2xl p-8 aurum-card-shadow space-y-6">
        <div className="text-center space-y-3">
          <VelvetCodeLogo size="md" className="justify-center" theme="light" />
          <h1 className="text-2xl font-bold text-[#2C241A] tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-xs text-[#6A5A44]">
            Enter your registered agency email address and we will generate your password recovery link.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[#8B4A4A]/10 border border-[#8B4A4A]/30 text-[#8B4A4A] text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#547A61]/15 text-[#547A61] flex items-center justify-center mx-auto border border-[#547A61]/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#2C241A]">Reset Instructions Ready</h3>
            <p className="text-xs text-[#6A5A44] leading-relaxed">
              We have generated recovery instructions for <strong className="text-[#7A5520]">{email}</strong>.
            </p>
            {resetUrl && (
              <div className="pt-2">
                <Link href={resetUrl}>
                  <Button variant="gold" size="sm" className="w-full font-bold">
                    Click Here to Set New Password
                  </Button>
                </Link>
              </div>
            )}
            <Link href="/login" className="block pt-2">
              <Button variant="secondary" size="sm" className="w-full font-bold">
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              required
              placeholder="name@agency.in"
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button type="submit" variant="gold" size="md" className="w-full font-bold" isLoading={isLoading}>
              Generate Password Reset Link
            </Button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="text-xs text-[#6A5A44] hover:text-[#2C241A] inline-flex items-center gap-1.5 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
