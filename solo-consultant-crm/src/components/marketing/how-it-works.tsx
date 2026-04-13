import { Search, Map, Palette, Monitor, Server, TestTube, Rocket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Phase {
  number: number;
  name: string;
  icon: LucideIcon;
  description: string;
}

const PHASES: Phase[] = [
  { number: 1, name: 'Research', icon: Search, description: 'Market analysis, requirements gathering, competitor research' },
  { number: 2, name: 'Planning', icon: Map, description: 'Architecture design, tech stack, database schema, API contracts' },
  { number: 3, name: 'Design', icon: Palette, description: 'UI/UX wireframes, design system, component specifications' },
  { number: 4, name: 'Frontend', icon: Monitor, description: 'Responsive interfaces, state management, client-side logic' },
  { number: 5, name: 'Backend', icon: Server, description: 'APIs, databases, authentication, business logic' },
  { number: 6, name: 'Testing', icon: TestTube, description: 'Unit tests, integration tests, QA, security audits' },
  { number: 7, name: 'Deployment', icon: Rocket, description: 'CI/CD, hosting, monitoring, go-live' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-secondary/50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center">Our 7-Phase AI Process</h2>
        <p className="text-lg text-muted-foreground text-center mt-4">
          A proven methodology that delivers production-ready products
        </p>

        {/* Desktop: horizontal stepper */}
        <div className="hidden md:flex items-start justify-between mt-16">
          {PHASES.map((phase, index) => (
            <div key={phase.number} className="flex items-start flex-1">
              <div className="flex flex-col items-center text-center w-full">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                  {phase.number}
                </div>
                <phase.icon className="w-5 h-5 text-primary mt-3" aria-hidden="true" />
                <p className="text-sm font-semibold mt-2">{phase.name}</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[120px]">{phase.description}</p>
              </div>
              {index < PHASES.length - 1 && (
                <div className="h-0.5 bg-primary/20 flex-1 mt-6 mx-1" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>

        {/* Mobile: vertical stepper */}
        <div className="md:hidden mt-12 space-y-0">
          {PHASES.map((phase, index) => (
            <div key={phase.number}>
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {phase.number}
                  </div>
                  {index < PHASES.length - 1 && (
                    <div className="w-0.5 h-8 bg-primary/20 mt-1" aria-hidden="true" />
                  )}
                </div>
                <div className="pt-1.5 pb-4">
                  <div className="flex items-center gap-2">
                    <phase.icon className="w-4 h-4 text-primary" aria-hidden="true" />
                    <p className="text-sm font-semibold">{phase.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{phase.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
