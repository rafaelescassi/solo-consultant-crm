import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tier {
  name: string;
  price: string;
  priceDetail: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

const TIERS: Tier[] = [
  {
    name: 'Starter',
    price: '$2,500',
    priceDetail: '– $5,000',
    description: 'Perfect for landing pages and simple websites',
    features: [
      'Landing pages',
      'Marketing websites',
      'Basic SEO',
      'Mobile responsive',
      '1 revision round',
      '5-day delivery',
      'Email support',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Professional',
    price: '$10,000',
    priceDetail: '– $25,000',
    description: 'Full web apps, CRMs, and complex builds',
    features: [
      'Everything in Starter',
      'Custom web applications',
      'Database design',
      'User authentication',
      'API integrations',
      '3 revision rounds',
      '10-day delivery',
      'Priority support',
    ],
    cta: 'Get Started',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '$25,000',
    priceDetail: '+',
    description: 'Enterprise platforms and multi-system integrations',
    features: [
      'Everything in Professional',
      'Enterprise platforms (ERP/CRM)',
      'Mobile apps',
      'Advanced integrations',
      'CI/CD pipeline',
      'Monitoring & alerting',
      'Unlimited revisions',
      'Dedicated support',
      'Post-launch retainer',
    ],
    cta: 'Contact Us',
  },
];

export function PricingTiers() {
  return (
    <section id="pricing" className="py-24 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center">Simple, Transparent Pricing</h2>
        <p className="text-lg text-muted-foreground text-center mt-4">
          Choose the package that fits your project. No hidden fees.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {TIERS.map(tier => (
            <div
              key={tier.name}
              className={cn(
                'bg-card border rounded-2xl p-8 flex flex-col relative',
                tier.highlighted ? 'border-primary border-2' : 'border-border'
              )}
            >
              {tier.highlighted && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              )}

              <h3 className="text-xl font-semibold">{tier.name}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-lg text-muted-foreground">{tier.priceDetail}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>

              <div className="border-t border-border my-6" />

              <ul className="space-y-3 flex-1">
                {tier.features.map(feature => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#quote"
                className={cn(
                  'mt-8 inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium transition-colors w-full',
                  tier.highlighted
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border border-border bg-background hover:bg-accent'
                )}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
