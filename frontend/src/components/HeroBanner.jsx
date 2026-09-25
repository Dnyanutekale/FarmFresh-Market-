import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Sprout } from 'lucide-react';

export default function HeroBanner({ onNavigate }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-farm-900 via-farm-950 to-slate-950 text-white py-16 lg:py-24">
      {/* Subtle background ambient circles */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-farm-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-farm-800/80 border border-farm-700/60 text-farm-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Direct From Nashik, Mahabaleshwar & Kashmir Orchards
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
              Real Fresh Harvest. <br />
              <span className="bg-gradient-to-r from-farm-300 via-emerald-400 to-amber-200 bg-clip-text text-transparent">
                Direct From the Farmer.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
              Skip the middleman, wholesale cold-storage delays, and chemical ripening. Order fresh vegetables, orchard fruits, raw honey, and Himalayan dry fruits harvested just hours before delivery.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => onNavigate('storefront')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-farm-600 to-farm-500 hover:from-farm-500 hover:to-farm-400 text-white font-bold shadow-lg shadow-farm-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Shop Fresh Harvest
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('register', { role: 'farmer' })}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold backdrop-blur-xs border border-white/20 transition-all"
              >
                <Sprout className="w-4 h-4 text-farm-400" />
                Register as Farmer
              </button>
            </div>

            {/* Quick Credibility Stats */}
            <div className="pt-6 border-t border-farm-800/80 grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <p className="text-2xl font-extrabold text-white">100%</p>
                <p className="text-xs text-slate-400 font-medium">Traceable to Farm</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-amber-400">₹0</p>
                <p className="text-xs text-slate-400 font-medium">Middleman Margin</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-farm-400">&lt; 24h</p>
                <p className="text-xs text-slate-400 font-medium">Harvest to Door</p>
              </div>
            </div>
          </div>

          {/* Right Visual Image Card Stack */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Visual Image Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                <img
                  src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=900&auto=format&fit=crop&q=80"
                  alt="Assorted Fresh Farm Produce"
                  className="w-full h-96 sm:h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                {/* Floating Farm Origin Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop"
                      alt="Farmer Ramesh"
                      className="w-10 h-10 rounded-full object-cover border-2 border-farm-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">Ramesh Patil</p>
                      <p className="text-[11px] text-slate-400">Patil Organic Agro, Nashik</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-farm-800 text-farm-300 rounded-full border border-farm-700">
                    Harvested Today
                  </span>
                </div>
              </div>

              {/* Decorative Pill Top Right */}
              <div className="absolute -top-4 -right-4 bg-amber-500 text-slate-950 font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 rotate-3">
                <ShieldCheck className="w-4 h-4" />
                Zero Chemical Ripening
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
