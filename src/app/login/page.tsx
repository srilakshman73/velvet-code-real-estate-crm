'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { VelvetCodeLogo } from '@/components/brand/VelvetCodeLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCRMStore } from '@/lib/store';
import { INITIAL_USERS } from '@/lib/mock-data';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useCRMStore();
  const [email, setEmail] = useState('srilakshman73@gmail.com');
  const [password, setPassword] = useState('Velvetcode@123');
  const [rememberMe, setRememberMe] = useState(true);
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
      // Route based on role
      router.push(data.redirectTo || (data.user.role === 'OWNER' ? '/admin/dashboard' : '/app/dashboard'));
    } catch (err) {
      setErrorMessage('Network error connecting to authentication server');
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (userKey: 'owner' | 'admin' | 'manager' | 'agent') => {
    setErrorMessage(null);
    if (userKey === 'owner') {
      setEmail('srilakshman73@gmail.com');
      setPassword('Velvetcode@123');
      const ownerUser = INITIAL_USERS[0];
      setCurrentUser({
        ...ownerUser,
        name: 'Velvet Code',
        email: 'srilakshman73@gmail.com',
        role: 'OWNER',
        isSuperAdmin: true,
      });
      router.push('/admin/dashboard');
    } else if (userKey === 'admin') {
      setEmail('ananya@apexrealty.in');
      setPassword('password123');
      const adminUser = INITIAL_USERS[2];
      setCurrentUser(adminUser);
      router.push('/app/dashboard');
    } else if (userKey === 'manager') {
      setEmail('karthik@apexrealty.in');
      setPassword('password123');
      const managerUser = INITIAL_USERS[3];
      setCurrentUser(managerUser);
      router.push('/app/dashboard');
    } else if (userKey === 'agent') {
      setEmail('divya@apexrealty.in');
      setPassword('password123');
      const agentUser = INITIAL_USERS[4] || INITIAL_USERS[3];
      setCurrentUser(agentUser);
      router.push('/app/dashboard');
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

          {/* Quick Demo Role Switcher */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-amber-500/30 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-400">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Quick Demo Role Login
              </span>
              <span className="text-[10px] text-zinc-500 font-normal">1-Click Sign In</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('owner')}
                className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-left hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-amber-300">Velvet Code</p>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-500/20 text-amber-400 rounded">
                    OWNER
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate mt-0.5">srilakshman73@gmail.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">Ananya Iyer</p>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-blue-500/20 text-blue-400 rounded">
                    ADMIN
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate mt-0.5">Tenant Agency Admin</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('manager')}
                className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">Karthik S</p>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-purple-500/20 text-purple-400 rounded">
                    MANAGER
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate mt-0.5">Sales Manager</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('agent')}
                className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">Divya K</p>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 rounded">
                    AGENT
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate mt-0.5">Sales Consultant</p>
              </button>
            </div>
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
              placeholder="srilakshman73@gmail.com"
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
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
