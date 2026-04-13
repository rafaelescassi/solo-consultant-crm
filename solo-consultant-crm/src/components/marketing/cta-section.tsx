'use client';

import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { submitQuoteRequest } from '@/app/(marketing)/actions';

const PROJECT_TYPES = [
  { value: 'website', label: 'Website' },
  { value: 'landing_page', label: 'Landing Page' },
  { value: 'web_app', label: 'Web App' },
  { value: 'mobile_app', label: 'Mobile App' },
  { value: 'crm', label: 'CRM' },
  { value: 'erp', label: 'ERP' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'internal_tool', label: 'Internal Tool' },
  { value: 'other', label: 'Other' },
];

const BUDGET_OPTIONS = [
  '$2,500 – $5,000',
  '$5,000 – $10,000',
  '$10,000 – $25,000',
  '$25,000 – $50,000',
  '$50,000+',
  'Not sure yet',
];

export function CtaSection() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string,
      project_type: formData.get('project_type') as string,
      description: formData.get('description') as string,
      budget: formData.get('budget') as string,
    };

    try {
      const result = await submitQuoteRequest(data);
      if (result.success) {
        setSuccess(true);
      } else {
        toast.error(result.error || 'Something went wrong');
      }
    } catch {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="quote" className="relative py-24 px-6" style={{ background: 'linear-gradient(135deg, hsl(221 83% 53%) 0%, hsl(262 83% 58%) 100%)' }}>
      <div className="absolute inset-0 hero-pattern" aria-hidden="true" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Build Something Amazing?</h2>
        <p className="text-lg text-white/80 mt-4">
          Tell us about your project and get a free quote within 24 hours.
        </p>

        {success ? (
          <div className="mt-10 flex flex-col items-center gap-4">
            <CheckCircle className="w-16 h-16 text-white" />
            <p className="text-xl font-semibold text-white">Thanks! We&apos;ll be in touch within 24 hours.</p>
            <p className="text-white/80">Check your email for confirmation.</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mt-10 text-left"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="quote-name" className="text-white/80 text-sm font-medium">Name *</label>
                <input
                  id="quote-name"
                  name="name"
                  type="text"
                  required
                  placeholder="Your name"
                  className="w-full rounded-lg px-3 py-2 text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="quote-email" className="text-white/80 text-sm font-medium">Email *</label>
                <input
                  id="quote-email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="w-full rounded-lg px-3 py-2 text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="quote-company" className="text-white/80 text-sm font-medium">Company</label>
                <input
                  id="quote-company"
                  name="company"
                  type="text"
                  placeholder="Your company"
                  className="w-full rounded-lg px-3 py-2 text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="quote-type" className="text-white/80 text-sm font-medium">Project Type *</label>
                <select
                  id="quote-type"
                  name="project_type"
                  required
                  className="w-full rounded-lg px-3 py-2 text-sm bg-white/10 border border-white/20 text-white focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  <option value="" className="text-black">Select a type</option>
                  {PROJECT_TYPES.map(t => (
                    <option key={t.value} value={t.value} className="text-black">{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <label htmlFor="quote-description" className="text-white/80 text-sm font-medium">Tell us about your project *</label>
              <textarea
                id="quote-description"
                name="description"
                required
                rows={4}
                placeholder="Describe your project scope, goals, and any specific requirements..."
                className="w-full rounded-lg px-3 py-2 text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
              />
            </div>

            <div className="space-y-2 mt-4">
              <label htmlFor="quote-budget" className="text-white/80 text-sm font-medium">Budget Range</label>
              <select
                id="quote-budget"
                name="budget"
                className="w-full rounded-lg px-3 py-2 text-sm bg-white/10 border border-white/20 text-white focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <option value="" className="text-black">Select a range (optional)</option>
                {BUDGET_OPTIONS.map(b => (
                  <option key={b} value={b} className="text-black">{b}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-blue-600 font-semibold py-3 rounded-xl hover:bg-white/90 text-lg mt-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Get a Free Quote'
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
