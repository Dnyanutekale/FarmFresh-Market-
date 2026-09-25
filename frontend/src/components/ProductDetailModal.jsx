import React, { useState } from 'react';
import { X, Star, MapPin, Calendar, Leaf, ShieldCheck, Truck, ShoppingBag, Plus, Minus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductDetailModal({ product, onClose, onNavigate }) {
  const { addToCart, setIsCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onClose();
    if (onNavigate) {
      onNavigate('checkout');
    } else {
      setIsCartOpen(true);
    }
  };

  const totalPrice = Math.round(product.price_per_unit * quantity * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-earth-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:text-slate-900 hover:bg-earth-100 flex items-center justify-center shadow-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Column */}
          <div className="relative h-72 md:h-full min-h-[350px] bg-earth-100">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent md:hidden" />
            
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.is_organic && (
                <span className="bg-farm-700 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Leaf className="w-3.5 h-3.5 text-farm-300" />
                  100% Certified Organic
                </span>
              )}
              <span className="bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                {product.category}
              </span>
            </div>
          </div>

          {/* Details Column */}
          <div className="p-6 md:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Product Title */}
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {product.name}
              </h3>

              {/* Rating & Harvest Row */}
              <div className="flex flex-wrap items-center gap-4 text-xs mt-2 text-slate-600">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                  <span>{product.rating || '4.9'}</span>
                  <span className="text-slate-400 font-normal">({product.review_count || 12} reviews)</span>
                </div>

                {product.harvest_date && (
                  <div className="flex items-center gap-1 text-earth-700 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-earth-500" />
                    <span>Harvested: {new Date(product.harvest_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Price Row */}
              <div className="mt-4 p-3.5 bg-earth-50 rounded-2xl border border-earth-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Farmer Direct Rate</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">₹{product.price_per_unit}</span>
                    <span className="text-sm font-semibold text-slate-600">/ {product.unit}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500">Stock Availability</span>
                  <p className="text-xs font-bold text-farm-700">
                    {product.stock_quantity > 0 ? `${product.stock_quantity} ${product.unit} available` : 'Out of stock'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4 text-sm text-slate-600 leading-relaxed">
                <p>{product.description || 'Grown using natural farm practices, harvested fresh and delivered directly without prolonged cold storage.'}</p>
              </div>

              {/* Farmer Profile Card */}
              {product.farmer && (
                <div className="mt-5 p-3.5 bg-farm-50/70 rounded-2xl border border-farm-200/80 flex items-center gap-3">
                  <img
                    src={product.farmer.avatar_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop'}
                    alt={product.farmer.full_name}
                    className="w-12 h-12 rounded-xl object-cover border border-farm-300 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {product.farmer.farm_name || product.farmer.full_name}
                      </p>
                      {product.farmer.is_verified_farmer && (
                        <ShieldCheck className="w-3.5 h-3.5 text-farm-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-earth-700 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-farm-600" />
                      {product.farmer.farm_location || 'Local Farm'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="mt-6 pt-4 border-t border-earth-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Select Quantity ({product.unit}):</span>
                <div className="flex items-center border border-earth-300 rounded-xl overflow-hidden bg-white shadow-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-slate-600 hover:bg-earth-100 disabled:opacity-40 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    disabled={quantity >= product.stock_quantity}
                    className="p-2 text-slate-600 hover:bg-earth-100 disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Subtotal:</span>
                <span className="text-base font-extrabold text-slate-900">₹{totalPrice}</span>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity <= 0}
                  className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all ${
                    added
                      ? 'bg-farm-100 text-farm-800 border-farm-300'
                      : 'border-farm-600 text-farm-800 hover:bg-farm-50'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 text-farm-600" />
                      Added!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock_quantity <= 0}
                  className="py-3 rounded-xl text-sm font-bold bg-farm-700 hover:bg-farm-800 text-white shadow-md shadow-farm-700/20 transition-all"
                >
                  Buy Now
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
