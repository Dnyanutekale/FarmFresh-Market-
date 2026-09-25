import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';

export default function BestDealsSection({ products, onSelectProduct, onNavigate }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-amber-700 uppercase bg-amber-100 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Seasonal Highlights
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Today's Best Harvest & Direct Prices
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Produce harvested in the last 24-48 hours offered at direct-from-field rates.
          </p>
        </div>

        <button
          onClick={() => onNavigate('storefront', { filter: 'featured' })}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-farm-700 hover:text-farm-800 shrink-0"
        >
          View All Fresh Deals
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelectProduct={onSelectProduct}
          />
        ))}
      </div>
    </section>
  );
}
