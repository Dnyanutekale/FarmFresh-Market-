import React from 'react';
import { Sprout, Heart, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm mt-20 border-t border-slate-900">
      {/* Value Badges Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6 text-slate-300">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-farm-900/60 rounded-xl text-farm-400 border border-farm-800">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Direct Farm-to-Table</p>
              <p className="text-xs text-slate-400">Zero middlemen, 100% fair farmer pay</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-farm-900/60 rounded-xl text-farm-400 border border-farm-800">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Harvested Morning Fresh</p>
              <p className="text-xs text-slate-400">Delivered within 24 hours of harvest</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-farm-900/60 rounded-xl text-farm-400 border border-farm-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Quality Guaranteed</p>
              <p className="text-xs text-slate-400">Organic & chemical-free certified produce</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-farm-900/60 rounded-xl text-farm-400 border border-farm-800">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Zero Waste Philosophy</p>
              <p className="text-xs text-slate-400">Eco-friendly biodegradable packaging</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-farm-600 flex items-center justify-center text-white">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">FarmFresh Market</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Connecting conscientious consumers directly with authentic local farmers. Celebrating regional biodiversity, sustainable soil health, and seasonal harvests.
          </p>
          <div className="text-xs text-farm-400 font-medium">
            📍 Mumbai • Pune • Nashik • Bangalore • Delhi NCR
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Produce Categories</h4>
          <ul className="space-y-2 text-xs">
            <li><button onClick={() => onNavigate('storefront', { category: 'Vegetables' })} className="hover:text-farm-400">Fresh Vegetables</button></li>
            <li><button onClick={() => onNavigate('storefront', { category: 'Fruits' })} className="hover:text-farm-400">Seasonal Orchard Fruits</button></li>
            <li><button onClick={() => onNavigate('storefront', { category: 'Dry Fruits' })} className="hover:text-farm-400">Kashmiri & Himalayan Dry Fruits</button></li>
            <li><button onClick={() => onNavigate('storefront', { category: 'Dry Products' })} className="hover:text-farm-400">Cold Pressed Ghee & Forest Honey</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">For Farmers</h4>
          <ul className="space-y-2 text-xs">
            <li><button onClick={() => onNavigate('register', { role: 'farmer' })} className="hover:text-farm-400 font-semibold text-farm-300">Apply as Farmer Partner</button></li>
            <li><button onClick={() => onNavigate('login')} className="hover:text-farm-400">Farmer Login</button></li>
            <li><span className="text-slate-500">Fair Price Calculator (Coming soon)</span></li>
            <li><span className="text-slate-500">Cold Chain Logistics Support</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Platform Tech Stack</h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            FastAPI (Python 3.14) • SQLAlchemy 2.0 Async • SQLite/PostgreSQL • React (Vite) • Tailwind CSS • JWT Role Auth
          </p>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            <span className="text-emerald-400 font-bold block mb-1">Portfolio Project Demo</span>
            <span className="text-slate-400">Built with production-grade architecture and real agricultural datasets.</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>© 2026 FarmFresh Market. Cultivated with <Heart className="w-3.5 h-3.5 inline text-rose-500 mx-0.5 fill-rose-500" /> for Indian Farmers & Healthy Living.</p>
      </div>
    </footer>
  );
}
