'use client';

import React, { useState } from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { buildWhatsAppUrl } from '@/lib/utils';
import { MessageSquare, Phone, Mail, MapPin, CheckCircle2, ArrowUpRight } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessType: 'Agency',
    teamSize: '5-15 Agents',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const officialWhatsAppUrl = buildWhatsAppUrl(
    '919443647190',
    'Hello Velvet Code, I would like to know more about your Real Estate CRM.'
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0D11] text-zinc-100">
      <PublicHeader />
      <main className="flex-1 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Get in Touch
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-4 tracking-tight">
              Contact Velvet Code Specialists
            </h1>
            <p className="text-base text-zinc-400 mt-3 leading-relaxed">
              Have questions about multi-tenant workspace setups, WhatsApp API integrations, or enterprise plans? We are here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Info Column */}
            <div className="lg:col-span-5 space-y-6">
              {/* WhatsApp Highlight Box */}
              <div className="p-7 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-zinc-950 border border-emerald-500/40 shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Instant WhatsApp Support</h3>
                    <p className="text-xs text-zinc-400">Available Monday–Saturday, 9 AM–7 PM IST</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Chat directly with our real estate technology architects on our official WhatsApp business number.
                </p>

                <a
                  href={officialWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-5 h-5 fill-current" />
                    <span>Chat on WhatsApp: +91 94436 47190</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>

              {/* Direct Details */}
              <div className="p-7 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-5 text-sm">
                <h3 className="text-base font-bold text-white">Office Contact Information</h3>

                <div className="space-y-4 text-zinc-300 text-xs sm:text-sm">
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Phone / WhatsApp</p>
                      <a href="tel:+919443647190" className="hover:text-amber-400 text-zinc-400">
                        +91 94436 47190
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Email Inquiries</p>
                      <a href="mailto:solutions@velvetcode.tech" className="hover:text-amber-400 text-zinc-400">
                        solutions@velvetcode.tech
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Presence & Hubs</p>
                      <p className="text-zinc-400">
                        Chennai • Bangalore • Mumbai, India
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-7">
              <div className="p-8 sm:p-10 rounded-2xl bg-zinc-950 border border-zinc-800/90 shadow-2xl">
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Thank You for Contacting Us!</h3>
                    <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                      Our real estate technology consultant will reach out via phone/WhatsApp at{' '}
                      <strong className="text-amber-400">{formData.phone || '+91 94436 47190'}</strong> within 2 hours.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSubmitted(false)}
                      className="mt-4"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-xl font-bold text-white mb-4">
                      Request an Enterprise Consultation
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Your Full Name *"
                        required
                        placeholder="e.g. Velvet Code"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                      <Input
                        label="Email Address *"
                        type="email"
                        required
                        placeholder="contact@agency.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Phone / WhatsApp Number *"
                        type="tel"
                        required
                        placeholder="+91 98400 00000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                      <Select
                        label="Business Type"
                        value={formData.businessType}
                        onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                        options={[
                          { value: 'Agent', label: 'Independent Agent' },
                          { value: 'Broker', label: 'Real Estate Broker' },
                          { value: 'Agency', label: 'Real Estate Agency' },
                          { value: 'Builder', label: 'Builder / Developer' },
                          { value: 'Consultant', label: 'Property Consultant' },
                        ]}
                      />
                    </div>

                    <Textarea
                      label="Tell us about your requirements / property portfolio"
                      rows={4}
                      placeholder="e.g., We are a 10-agent team in Chennai handling luxury apartments. We need automated WhatsApp follow-ups and lead distribution."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />

                    <Button type="submit" variant="gold" size="lg" className="w-full font-bold mt-4">
                      Submit Consultation Request
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
