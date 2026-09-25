import React, { useEffect, useState } from 'react';
import { ShieldCheck, MapPin, Package, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function FarmerSpotlight({ onSelectFarmer }) {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFarmers() {
      try {
        const data = await api.getFarmers();
        setFarmers(data);
      } catch (err) {
        console.error("Failed to load farmers:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFarmers();
  }, []);

  if (loading || farmers.length === 0) return null;

  return (
    <section id="farmers" className="py-16 bg-gradient-to-b from-earth-100/60 to-earth-50 border-y border-earth-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest text-farm-800 uppercase bg-farm-200/70 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-farm-700" />
            True Farm-to-Table
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Meet Our Farmers
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Every harvest has a story. Meet the generational agriculturalists growing your chemical-free food with passion and sustainable soil care.
          </p>
        </div>

        {/* Farmer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {farmers.map((farmer) => (
            <div
              key={farmer.id}
              className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-earth-200 flex flex-col justify-between group"
            >
              <div>
                {/* Farmer Photo & Verification */}
                <div className="relative mb-5">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto border-2 border-farm-500 shadow-md">
                    <img
                      src={farmer.avatar_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop'}
                      alt={farmer.full_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {farmer.is_verified_farmer && (
                    <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 bg-farm-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3 h-3 text-farm-300" />
                      Verified Farmer
                    </div>
                  )}
                </div>

                {/* Farmer Details */}
                <div className="text-center mt-4">
                  <h3 className="font-extrabold text-slate-900 text-lg">{farmer.full_name}</h3>
                  <p className="text-xs font-semibold text-farm-700 mt-0.5">{farmer.farm_name || 'Independent Organic Farm'}</p>
                  
                  <div className="inline-flex items-center gap-1 text-xs text-earth-700 mt-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-farm-600" />
                    <span>{farmer.farm_location || 'Maharashtra, India'}</span>
                  </div>

                  <p className="text-xs text-slate-500 mt-3 line-clamp-3 leading-relaxed">
                    {farmer.bio || 'Practicing natural soil regeneration, solar drying, and chemical-free crop rotation for healthy family consumption.'}
                  </p>
                </div>
              </div>

              {/* Action Button & Active Listings */}
              <div className="mt-6 pt-4 border-t border-earth-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Package className="w-3.5 h-3.5 text-farm-600" />
                  <span>{farmer.product_count} Fresh Items</span>
                </div>

                <button
                  onClick={() => onSelectFarmer(farmer.id)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-farm-700 hover:text-farm-800 group-hover:translate-x-1 transition-all"
                >
                  View Harvest
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
