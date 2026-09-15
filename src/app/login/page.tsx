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
    } catch (err) {
      setErrorMessage('Network error connecting to authentication server');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D11] text-zinc-100 flex">
      {/* Left Brand Panel (Desktop) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/20 border-r border-zinc-800/80 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <VelvetCodeLogo size="lg" />
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Real Estate CRM SaaS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Run Your Real Estate Business From One Intelligent Workspace
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Manage leads, luxury properties, deals pipeline, site visits, and WhatsApp CRM conversations with Realty AI.
          </p>

          <div className="pt-4 space-y-3 text-xs text-zinc-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Strict multi-tenant organization isolation (organization_id)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Official WhatsApp Cloud API click-to-chat integration</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Real-time conversion scoring with Realty AI</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-zinc-800/60 text-xs text-zinc-400 flex items-center justify-between">
          <span>© 2026 Velvet Code. Technology & Digital Solutions.</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" /> 256-Bit SSL Encrypted
          </span>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-16 max-w-xl mx-auto w-full">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8">
          <VelvetCodeLogo size="md" />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Sign in to your Velvet Code real estate CRM workspace or SaaS Master Console.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
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
              <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-white">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-zinc-800 bg-zinc-900 text-amber-500 focus:ring-amber-400"
                />
                <span>Remember me</span>
              </label>

              <Link
                href="/forgot-password"
                className="text-amber-400 hover:text-amber-300 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full font-bold shadow-xl shadow-amber-500/20"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-xs text-zinc-400 pt-2">
            Don't have an account?{' '}
            <Link href="/register" className="text-amber-400 hover:text-amber-300 font-bold">
              Register new agency workspace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
