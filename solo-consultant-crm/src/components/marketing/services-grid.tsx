import { Globe, MousePointerClick, AppWindow, Smartphone, Users, Building2, ShoppingCart, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ServiceItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const SERVICES: ServiceItem[] = [
  { icon: Globe, title: 'Website', description: 'Custom marketing websites with modern design and SEO optimization' },
  { icon: MousePointerClick, title: 'Landing Page', description: 'High-converting single-page sites built for lead generation' },
  { icon: AppWindow, title: 'Web App', description: 'Full-featured web applications with auth, dashboards, and workflows' },
  { icon: Smartphone, title: 'Mobile App', description: 'Cross-platform mobile apps for iOS and Android' },
  { icon: Users, title: 'CRM', description: 'Customer relationship management systems tailored to your business' },
  { icon: Building2, title: 'ERP', description: 'Enterprise resource planning platforms for operations at scale' },
  { icon: ShoppingCart, title: 'E-Commerce', description: 'Online stores with payment processing, inventory, and fulfillment' },
  { icon: Wrench, title: 'Internal Tool', description: 'Custom admin panels, dashboards, and automation tools' },
];

export function ServicesGrid() {
  return (
    <section id="services" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center">What We Build</h2>
        <p className="text-lg text-muted-foreground text-center mt-4 max-w-2xl mx-auto">
          From simple landing pages to complex enterprise platforms
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {SERVICES.map(service => (
            <div
              key={service.title}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <service.icon className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold mt-4">{service.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
