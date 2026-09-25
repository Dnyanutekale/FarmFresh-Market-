import React, { useEffect, useState } from 'react';
import HeroBanner from '../components/HeroBanner';
import CategorySection from '../components/CategorySection';
import BestDealsSection from '../components/BestDealsSection';
import FarmerSpotlight from '../components/FarmerSpotlight';
import { api } from '../services/api';
import { Sprout, CheckCircle2, ShieldCheck, HeartHandshake, Leaf, Truck } from 'lucide-react';

export default function Home({ onNavigate, onSelectProduct }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await api.getFeaturedProducts();
        setFeaturedProducts(data);
      } catch (err) {
        console.error("Failed to load featured products:", err);
      }
    }
    loadFeatured();
  }, []);

  const handleSelectCategory = (category) => {
    onNavigate('storefront', { category });
  };

  const handleSelectFarmer = (farmerId) => {
    onNavigate('storefront', { farmerId });
  };

  return (
    <div className="space-y-4">
      {/* Hero Section */}
      <HeroBanner onNavigate={onNavigate} />

      {/* Category Section */}
      <CategorySection onSelectCategory={handleSelectCategory} />

      {/* Seasonal Highlights / Best Deals */}
      <BestDealsSection 
        products={featuredProducts} 
        onSelectProduct={onSelectProduct} 
        onNavigate={onNavigate} 
      />

      {/* Why Choose FarmFresh Section */}
      <section className="py-20 bg-white border-y border-earth-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest text-farm-700 uppercase bg-farm-100 px-3 py-1 rounded-full">
              The FarmFresh Difference
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Why Farm-to-Table Matters
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Industrial supply chains take up to 7-10 days between harvest and retail shelves. We eliminated the supply chain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-earth-50/70 border border-earth-200/80 hover:border-farm-300 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 rounded-2xl bg-farm-600 text-white flex items-center justify-center mb-6 shadow-md shadow-farm-600/20 group-hover:scale-110 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-2">Fair Value to Farmers</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Traditional retail pays farmers less than 30% of the final shelf price. On FarmFresh, farmers keep over 90% of every sale, empowering rural prosperity.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-earth-50/70 border border-earth-200/80 hover:border-farm-300 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 rounded-2xl bg-farm-600 text-white flex items-center justify-center mb-6 shadow-md shadow-farm-600/20 group-hover:scale-110 transition-transform">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-2">Maximum Micronutrients</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Vegetables lose up to 50% of vital Vitamin C within 48 hours of plucking. Our 24-hour harvest-to-home cycle guarantees pure freshness and taste.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-earth-50/70 border border-earth-200/80 hover:border-farm-300 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 rounded-2xl bg-farm-600 text-white flex items-center justify-center mb-6 shadow-md shadow-farm-600/20 group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-2">Zero Artificial Ripening</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                No calcium carbide, ethylene baths, or synthetic waxes. All fruits and dry produce are naturally tree-ripened and sun-cured.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Farmers Spotlight */}
      <FarmerSpotlight onSelectFarmer={handleSelectFarmer} />
    </div>
  );
}
