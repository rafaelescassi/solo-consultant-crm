import { Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  name: string;
  company: string;
  initials: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'AI Dev Squad built our entire CRM in under a week. The quality was indistinguishable from a months-long traditional build.',
    name: 'Sarah Mitchell',
    company: 'TechFlow Solutions',
    initials: 'SM',
  },
  {
    quote: 'The 7-phase process kept us informed every step of the way. We could see exactly what was happening with our project.',
    name: 'James Rodriguez',
    company: 'Pinnacle Consulting',
    initials: 'JR',
  },
  {
    quote: 'We needed a complex e-commerce platform fast. They delivered a production-ready app that handles thousands of orders daily.',
    name: 'Emily Chen',
    company: 'Urban Market Co.',
    initials: 'EC',
  },
];

function StarRating() {
  return (
    <div className="flex gap-0.5 mt-3" aria-label="5 out of 5 stars">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden="true" />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-6 bg-secondary/50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center">What Our Clients Say</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {TESTIMONIALS.map(testimonial => (
            <div key={testimonial.name} className="bg-card border border-border rounded-xl p-6">
              <p className="text-4xl text-primary/20 leading-none" aria-hidden="true">&ldquo;</p>
              <p className="text-sm text-foreground leading-relaxed mt-2">{testimonial.quote}</p>

              <div className="flex items-center gap-3 mt-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                </div>
              </div>

              <StarRating />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
