'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VelvetCodeLogo } from '@/components/brand/VelvetCodeLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F4F0E7] text-[#29251F] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#FFFDF8] border border-[#DDD4C5] rounded-2xl p-8 aurum-card-shadow space-y-6">
        <div className="text-center space-y-3">
          <VelvetCodeLogo size="md" className="justify-center" theme="light" />
          <h1 className="text-2xl font-bold text-[#29251F] tracking-tight font-serif">
            Reset Your Password
          </h1>
          <p className="text-xs text-[#625B51]">
            Enter your registered agency email address and we will send you a password reset link.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#3D7258]/15 text-[#3D7258] flex items-center justify-center mx-auto border border-[#3D7258]/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#29251F]">Reset Link Dispatched</h3>
            <p className="text-xs text-[#625B51] leading-relaxed">
              We have sent recovery instructions to <strong className="text-[#7A5720]">{email}</strong>.
            </p>
            <Link href="/login">
              <Button variant="gold" size="sm" className="w-full mt-2 font-bold">
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

            <Button type="submit" variant="gold" size="md" className="w-full font-bold">
              Send Password Reset Link
            </Button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="text-xs text-[#625B51] hover:text-[#29251F] inline-flex items-center gap-1.5 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
