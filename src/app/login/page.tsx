'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { VelvetCodeLogo } from '@/components/brand/VelvetCodeLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCRMStore } from '@/lib/store';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useCRMStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Invalid credentials');
        setIsLoading(false);
        return;
      }

      // Update client-side store
      if (data.user) {
        setCurrentUser(data.user);
      }

      setIsLoading(false);
      const urlParams = new URLSearchParams(window.location.search);
      const planParam = urlParams.get('plan');

      if (data.user?.role !== 'OWNER' && planParam) {
        router.push(`/app/billing?checkout=${encodeURIComponent(planParam)}`);
      } else {
        // Route based on role returned securely by the server
        router.push(data.redirectTo || (data.user?.role === 'OWNER' ? '/admin/dashboard' : '/app/dashboard'));
      }
    } catch {
      setErrorMessage('Network error connecting to authentication server');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCECEF] text-[#3A2930] flex">
      {/* Left Brand Panel (Desktop) - Luxury Champagne Stone */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-[#EBCBD4] border-r border-[#EBCBD4] relative overflow-hidden text-[#3A2930]">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#B86B84]/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <VelvetCodeLogo size="lg" theme="light" />
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8C455C] bg-[#B86B84]/15 px-3.5 py-1 rounded-full border border-[#B86B84]/30 font-serif">
            Real Estate CRM SaaS
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#3A2930] tracking-tight leading-tight font-serif">
            Run Your Real Estate Business From One Intelligent Workspace
          </h2>
          <p className="text-sm text-[#765D66] leading-relaxed">
            Manage leads, luxury properties, deals pipeline, site visits, and WhatsApp CRM conversations with Realty AI.
          </p>

          <div className="pt-4 space-y-3 text-xs text-[#3A2930]">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#4A7C59]" />
              <span>Strict multi-tenant organization isolation (organization_id)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#4A7C59]" />
              <span>Official WhatsApp Cloud API click-to-chat integration</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#4A7C59]" />
              <span>Real-time conversion scoring with Realty AI</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-[#EBCBD4] text-xs text-[#9B828C] flex items-center justify-between">
          <span>Â© 2026 Velvet Code. Technology & Digital Solutions.</span>
          <span className="flex items-center gap-1 text-[#4A7C59] font-semibold">
            <ShieldCheck className="w-4 h-4" /> 256-Bit SSL Encrypted
          </span>
        </div>
      </div>

      {/* Right Login Form - Light Gold Luxury Background */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-16 max-w-xl mx-auto w-full">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8">
          <VelvetCodeLogo size="md" theme="light" />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#3A2930] tracking-tight font-serif">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-[#9B828C] mt-1">
              Sign in to your Velvet Code real estate CRM workspace or SaaS Master Console.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-[#A84355]/10 border border-[#A84355]/30 text-[#A84355] text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#A84355]" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              autoComplete="username"
              placeholder="name@agency.in"
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-[#9B828C] hover:text-[#3A2930] font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#EBCBD4] bg-[#FFF9FA] text-[#B86B84] focus:ring-[#B86B84]"
                />
                <span>Remember me</span>
              </label>

              <Link
                href="/forgot-password"
                className="text-[#8C455C] hover:text-[#9E546C] font-bold"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full font-bold shadow-xl"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-xs text-[#9B828C] pt-2">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#8C455C] hover:text-[#9E546C] font-bold">
              Register new agency workspace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

