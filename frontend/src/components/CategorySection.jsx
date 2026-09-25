import React from 'react';
import { Carrot, Apple, Nut, Sparkles, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'Vegetables',
    name: 'Fresh Vegetables',
    subtitle: 'Harvested at dawn, 100% pesticide tested',
    count: '8+ Varieties',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    tag: 'Daily Harvest'
  },
  {
    id: 'Fruits',
    name: 'Orchard Fruits',
    subtitle: 'Tree-ripened, naturally sweet & fragrant',
    count: '6+ Varieties',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80',
    tag: 'Seasonal'
  },
  {
    id: 'Dry Fruits',
    name: 'Kashmiri Dry Fruits',
    subtitle: 'Sun-dried Himalayan walnuts, badam & cashews',
    count: '5+ Varieties',
    image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=600&auto=format&fit=crop&q=80',
    tag: 'Premium'
  },
  {
    id: 'Dry Products',
    name: 'Artisanal Dry Products',
    subtitle: 'A2 Vedic Bilona Ghee, Raw Forest Honey & Haldi',
    count: '4+ Varieties',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
    tag: 'Traditional'
  },
];

export default function CategorySection({ onSelectCategory }) {
  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
        <div>
          <span className="text-xs font-bold tracking-widest text-farm-700 uppercase bg-farm-100 px-3 py-1 rounded-full">
            Browse By Harvest
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Shop by Category
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Choose from freshly plucked greens, orchard fruits, or traditional pantry staples.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-earth-200/90 bg-white flex flex-col h-80 transform hover:-translate-y-1.5"
          >
            {/* Image background with zoom effect */}
            <div className="relative h-48 overflow-hidden bg-earth-100">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
              
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                {cat.tag}
              </span>

              <span className="absolute bottom-3 right-3 bg-farm-900/90 backdrop-blur-md text-farm-200 text-xs font-semibold px-2.5 py-1 rounded-lg">
                {cat.count}
              </span>
            </div>

            {/* Content text */}
            <div className="p-5 flex flex-col justify-between flex-1">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-farm-700 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {cat.subtitle}
                </p>
              </div>

              <div className="flex items-center text-xs font-bold text-farm-700 gap-1 pt-2 group-hover:translate-x-1 transition-transform">
                Explore Category
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
