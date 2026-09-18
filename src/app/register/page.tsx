'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { VelvetCodeLogo } from '@/components/brand/VelvetCodeLogo';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { useCRMStore } from '@/lib/store';
import { BusinessType } from '@/types';
import {
  Building,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { setCurrentOrg, setCurrentUser } = useCRMStore();
  const [formData, setFormData] = useState({
    fullName: '',
    agencyName: '',
    email: '',
    phone: '',
    businessType: 'AGENCY' as BusinessType,
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Registration failed');
        setIsLoading(false);
        return;
      }

      if (data.organization) setCurrentOrg(data.organization);
      if (data.user) setCurrentUser(data.user);

      setIsLoading(false);
      router.push('/onboarding');
    } catch {
      // Fallback
      const newOrg = {
        id: `org-reg-${Date.now()}`,
        name: formData.agencyName || 'My Real Estate Agency',
        slug: (formData.agencyName || 'agency').toLowerCase().replace(/\s+/g, '-'),
        phone: formData.phone || '+91 63833 95915',
        email: formData.email,
        country: 'India',
        businessType: formData.businessType,
        createdAt: new Date().toISOString(),
      };

      const newUser = {
        id: `usr-reg-${Date.now()}`,
        name: formData.fullName || 'Agency Principal',
        email: formData.email,
        phone: formData.phone,
        role: 'ADMIN' as const,
        organizationId: newOrg.id,
      };

      setCurrentOrg(newOrg);
      setCurrentUser(newUser);
      setIsLoading(false);
      router.push('/onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#24211D] flex">
      {/* Left Brand Panel - Luxury Dark Charcoal */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-[#151515] border-r border-[#24221E] relative overflow-hidden text-[#F7F3EA]">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#A374]/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <VelvetCodeLogo size="lg" theme="dark" />
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A374] bg-[#A374]/15 px-3.5 py-1 rounded-full border border-[#A374]/30">
            Create Your Workspace
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F7F3EA] tracking-tight leading-tight font-serif">
            Deploy Your Agency's Complete CRM in 60 Seconds
          </h2>
          <p className="text-sm text-[#DDD4C4]/80 leading-relaxed">
            Get instant access to real estate leads management, luxury property inventory, deals pipeline, and Realty AI with pre-configured Indian real estate templates.
          </p>

          <div className="pt-4 space-y-3 text-xs text-[#DDD4C4]">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#3B825E]" />
              <span>Full 14-day free trial on all features</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#3B825E]" />
              <span>No credit card or setup fees required</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#3B825E]" />
              <span>Instant WhatsApp CRM channel integration</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-[#24221E] text-xs text-[#DDD4C4]/60 flex items-center justify-between">
          <span>Enterprise Real Estate Infrastructure</span>
          <span className="flex items-center gap-1 text-[#3B825E] font-semibold">
            <ShieldCheck className="w-4 h-4" /> 100% Isolated Tenant DB
          </span>
        </div>
      </div>

      {/* Right Registration Form - Soft Cream */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-16 max-w-xl mx-auto w-full">
        <div className="lg:hidden mb-8">
          <VelvetCodeLogo size="md" theme="light" />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#24211D] tracking-tight font-serif">
              Create your workspace
            </h1>
            <p className="text-xs sm:text-sm text-[#766F63] mt-1">
              Start managing your real estate leads, properties, and deals.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#8B2635]/10 border border-[#8B2635]/30 text-[#8B2635] text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                required
                placeholder="e.g. Vikramaditya Rao"
                leftIcon={<User className="w-4 h-4" />}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
              <Input
                label="Company / Agency Name *"
                required
                placeholder="e.g. Velvet Apex Realty"
                leftIcon={<Building className="w-4 h-4" />}
                value={formData.agencyName}
                onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Work Email *"
                type="email"
                required
                placeholder="vikram@agency.in"
                leftIcon={<Mail className="w-4 h-4" />}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Phone / WhatsApp *"
                type="tel"
                required
                placeholder="+91 63833 95915"
                leftIcon={<Phone className="w-4 h-4" />}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Business Type *"
                value={formData.businessType}
                onChange={(e) =>
                  setFormData({ ...formData, businessType: e.target.value as BusinessType })
                }
                options={[
                  { value: 'AGENCY', label: 'Real Estate Agency' },
                  { value: 'BROKER', label: 'Real Estate Broker' },
                  { value: 'BUILDER', label: 'Builder / Developer' },
                  { value: 'AGENT', label: 'Independent Agent' },
                  { value: 'PROPERTY_CONSULTANT', label: 'Property Consultant' },
                  { value: 'OTHER', label: 'Other Real Estate Professional' },
                ]}
              />

              <Input
                label="Password *"
                type="password"
                required
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <p className="text-[11px] text-[#766F63] leading-relaxed">
              By creating a workspace, you agree to Velvet Code's{' '}
              <Link href="/terms" className="text-[#8F642B] hover:underline font-bold">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#8F642B] hover:underline font-bold">
                Privacy Policy
              </Link>
              .
            </p>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full font-bold shadow-xl mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Workspace & Continue
            </Button>
          </form>

          <p className="text-center text-xs text-[#766F63]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#8F642B] hover:text-[#7A5320] font-bold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
