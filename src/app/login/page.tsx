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
      // Route based on role returned securely by the server
      router.push(data.redirectTo || (data.user?.role === 'OWNER' ? '/admin/dashboard' : '/app/dashboard'));
    } catch {
      setErrorMessage('Network error connecting to authentication server');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#24211D] flex">
      {/* Left Brand Panel (Desktop) - Luxury Dark Charcoal */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-[#151515] border-r border-[#24221E] relative overflow-hidden text-[#F7F3EA]">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#A374]/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <VelvetCodeLogo size="lg" theme="dark" />
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A374] bg-[#A374]/15 px-3.5 py-1 rounded-full border border-[#A374]/30">
            Real Estate CRM SaaS
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F7F3EA] tracking-tight leading-tight font-serif">
            Run Your Real Estate Business From One Intelligent Workspace
          </h2>
          <p className="text-sm text-[#DDD4C4]/80 leading-relaxed">
            Manage leads, luxury properties, deals pipeline, site visits, and WhatsApp CRM conversations with Realty AI.
          </p>

          <div className="pt-4 space-y-3 text-xs text-[#DDD4C4]">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#3B825E]" />
              <span>Strict multi-tenant organization isolation (organization_id)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#3B825E]" />
              <span>Official WhatsApp Cloud API click-to-chat integration</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#3B825E]" />
              <span>Real-time conversion scoring with Realty AI</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-[#24221E] text-xs text-[#DDD4C4]/60 flex items-center justify-between">
          <span>© 2026 Velvet Code. Technology & Digital Solutions.</span>
          <span className="flex items-center gap-1 text-[#3B825E] font-semibold">
            <ShieldCheck className="w-4 h-4" /> 256-Bit SSL Encrypted
          </span>
        </div>
      </div>

      {/* Right Login Form - Soft Luxury Cream */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-16 max-w-xl mx-auto w-full">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8">
          <VelvetCodeLogo size="md" theme="light" />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#24211D] tracking-tight font-serif">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-[#766F63] mt-1">
              Sign in to your Velvet Code real estate CRM workspace or SaaS Master Console.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-[#8B2635]/10 border border-[#8B2635]/30 text-[#8B2635] text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#8B2635]" />
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
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-[#766F63] hover:text-[#24211D] font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#DDD4C4] bg-[#FFFCF6] text-[#A374] focus:ring-[#A374]"
                />
                <span>Remember me</span>
              </label>

              <Link
                href="/forgot-password"
                className="text-[#8F642B] hover:text-[#7A5320] font-bold"
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

          <p className="text-center text-xs text-[#766F63] pt-2">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#8F642B] hover:text-[#7A5320] font-bold">
              Register new agency workspace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
