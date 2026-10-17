'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { VelvetCodeLogo } from '@/components/brand/VelvetCodeLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!token) {
      setErrorMsg('Missing password reset token. Please request a new link.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to reset password');
        setIsLoading(false);
        return;
      }

      setSuccessMsg(data.message || 'Your password has been successfully updated.');
      setIsLoading(false);

      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch {
      setErrorMsg('Network error connecting to reset service.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#FFF9F0] border border-[#D8C7A5] rounded-2xl p-8 aurum-card-shadow space-y-6">
      <div className="text-center space-y-3">
        <VelvetCodeLogo size="md" className="justify-center" theme="light" />
        <h1 className="text-2xl font-bold text-[#2C241A] tracking-tight font-serif">
          Create New Password
        </h1>
        <p className="text-xs text-[#6A5A44]">
          Choose a secure password for your Velvet Code agency account.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-[#8B4A4A]/10 border border-[#8B4A4A]/30 text-[#8B4A4A] text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#547A61]/15 text-[#547A61] flex items-center justify-center mx-auto border border-[#547A61]/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#2C241A]">Password Successfully Updated</h3>
          <p className="text-xs text-[#6A5A44] leading-relaxed">
            {successMsg} Redirecting to sign in...
          </p>
          <Link href="/login" className="block pt-2">
            <Button variant="gold" size="sm" className="w-full font-bold">
              Sign In Now
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            required
            placeholder="At least 6 characters"
            leftIcon={<Lock className="w-4 h-4" />}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Input
            label="Confirm New Password"
            type="password"
            required
            placeholder="Re-enter password"
            leftIcon={<Lock className="w-4 h-4" />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button type="submit" variant="gold" size="md" className="w-full font-bold" isLoading={isLoading}>
            Update Password
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
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#E9DFC8] text-[#2C241A] flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-sm font-bold text-[#7A5520]">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
