import { Zap } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-center" style={{ background: 'linear-gradient(135deg, hsl(221 83% 53%) 0%, hsl(262 83% 58%) 100%)' }}>
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 hero-pattern" aria-hidden="true" />

      <div className="relative z-10 max-w-4xl mx-auto pt-32 pb-20 px-6">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
          Websites, Apps, CRMs &amp; ERPs
          <br />
          <span className="opacity-90">— Built by AI in Days</span>
        </h1>

        <p className="text-lg md:text-xl text-white/80 mt-6 max-w-2xl mx-auto">
          Your AI development team, on demand. White-glove consulting with a 7-phase delivery process.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <a
            href="#quote"
            className="inline-flex items-center justify-center bg-white text-blue-600 hover:bg-white/90 font-semibold px-8 py-3 rounded-xl text-lg shadow-lg transition-colors"
          >
            Get a Free Quote
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center border-2 border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-xl text-lg transition-colors"
          >
            See How It Works &darr;
          </a>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-center gap-8 md:gap-16 mt-16">
          <div className="text-white text-center">
            <span className="text-2xl md:text-3xl font-bold">50+</span>
            <p className="text-sm text-white/70 mt-1">Projects Built</p>
          </div>
          <div className="h-8 w-px bg-white/20" aria-hidden="true" />
          <div className="text-white text-center">
            <span className="text-2xl md:text-3xl font-bold">7-Phase</span>
            <p className="text-sm text-white/70 mt-1">Process</p>
          </div>
          <div className="h-8 w-px bg-white/20" aria-hidden="true" />
          <div className="text-white text-center">
            <span className="text-2xl md:text-3xl font-bold">Days,</span>
            <p className="text-sm text-white/70 mt-1">Not Months</p>
          </div>
        </div>
      </div>
    </section>
  );
}
