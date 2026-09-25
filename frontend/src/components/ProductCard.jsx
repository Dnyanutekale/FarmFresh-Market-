import React from 'react';
import { Plus, Check, Star, MapPin, Calendar, Leaf } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onSelectProduct }) {
  const { addToCart, items } = useCart();
  const cartItem = items.find((i) => i.product.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (product.stock_quantity > 0) {
      addToCart(product, 1);
    }
  };

  const isHarvestedRecently = () => {
    if (!product.harvest_date) return false;
    const diffDays = Math.round(
      (new Date().getTime() - new Date(product.harvest_date).getTime()) / (1000 * 3600 * 24)
    );
    return diffDays <= 2;
  };

  return (
    <div
      onClick={() => onSelectProduct && onSelectProduct(product)}
      className="group bg-white rounded-3xl overflow-hidden border border-earth-200/90 hover:border-farm-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
    >
      <div>
        {/* Image Container */}
        <div className="relative h-52 w-full overflow-hidden bg-earth-100">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            {product.is_organic && (
              <span className="bg-farm-700/95 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-0.8 rounded-full flex items-center gap-1 shadow-sm">
                <Leaf className="w-3 h-3 text-farm-300" />
                Organic
              </span>
            )}
            {isHarvestedRecently() && (
              <span className="bg-amber-600/95 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-0.8 rounded-full shadow-sm">
                Fresh Harvest
              </span>
            )}
          </div>

          {/* Category Tag Top Right */}
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-bold px-2 py-0.8 rounded-md shadow-xs">
            {product.category}
          </span>
        </div>

        {/* Content Details */}
        <div className="p-4 sm:p-5">
          {/* Farmer & Location Info */}
          {product.farmer && (
            <div className="flex items-center gap-1.5 text-xs text-earth-700 font-medium mb-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-farm-600 shrink-0" />
              <span className="truncate">{product.farmer.farm_name || product.farmer.full_name}</span>
              {product.farmer.farm_location && (
                <span className="text-slate-400 truncate">({product.farmer.farm_location})</span>
              )}
            </div>
          )}

          {/* Product Name */}
          <h4 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-farm-700 transition-colors line-clamp-1">
            {product.name}
          </h4>

          {/* Description snippet */}
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed h-8">
            {product.description || 'Direct farm harvested natural produce packed with essential nutrients.'}
          </p>

          {/* Rating & Stock row */}
          <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-earth-100">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
              <span>{product.rating || '4.9'}</span>
              <span className="text-slate-400 font-normal">({product.review_count || 12})</span>
            </div>

            {product.stock_quantity > 0 ? (
              <span className="text-[11px] font-semibold text-farm-700 bg-farm-50 px-2 py-0.5 rounded-md">
                In Stock ({Math.round(product.stock_quantity)} {product.unit})
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Price & Action Footer */}
      <div className="p-4 sm:p-5 pt-0 flex items-center justify-between mt-1">
        <div>
          <span className="text-xs text-slate-400 font-medium">Direct Price</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-slate-900">₹{product.price_per_unit}</span>
            <span className="text-xs text-slate-500 font-semibold">/{product.unit}</span>
          </div>
        </div>

        <button
          onClick={handleQuickAdd}
          disabled={product.stock_quantity <= 0}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
            product.stock_quantity <= 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : inCartQty > 0
              ? 'bg-farm-100 text-farm-800 hover:bg-farm-200 border border-farm-300'
              : 'bg-farm-700 hover:bg-farm-800 text-white shadow-farm-700/20'
          }`}
        >
          {inCartQty > 0 ? (
            <>
              <Check className="w-3.5 h-3.5" />
              {inCartQty} in Cart
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              Add
            </>
          )}
        </button>
      </div>
    </div>
  );
}
