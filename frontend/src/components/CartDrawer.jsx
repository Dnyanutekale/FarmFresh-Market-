import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ onNavigate }) {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, subtotal, shippingFee, total } = useCart();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 500;
  const progressToFreeDelivery = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    onNavigate('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 border-l border-earth-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-earth-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-farm-100 rounded-xl text-farm-800">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Your Farm Basket</h3>
              <p className="text-xs text-slate-500">{items.length} unique produce items</p>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-earth-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Banner Progress */}
        <div className="px-5 py-3 bg-farm-50 border-b border-farm-200/60">
          <div className="flex items-center justify-between text-xs font-bold text-farm-900 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-farm-700" />
              {remainingForFreeDelivery === 0
                ? '🎉 Congratulations! You have unlocked FREE Delivery!'
                : `Add ₹${remainingForFreeDelivery.toFixed(0)} more for FREE Delivery`}
            </span>
            <span>{Math.round(progressToFreeDelivery)}%</span>
          </div>
          <div className="w-full h-1.5 bg-farm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-farm-600 rounded-full transition-all duration-300"
              style={{ width: `${progressToFreeDelivery}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-20 h-20 bg-earth-100 rounded-full flex items-center justify-center mx-auto text-earth-400">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-base">Your basket is empty</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Browse fresh vegetables, orchard fruits, honey, and Himalayan dry fruits directly from farms.
                </p>
              </div>
              <button
                onClick={() => { setIsCartOpen(false); onNavigate('storefront'); }}
                className="px-5 py-2.5 rounded-xl bg-farm-700 hover:bg-farm-800 text-white font-bold text-xs shadow-md transition-all"
              >
                Browse Fresh Harvest
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center gap-3.5 p-3 rounded-2xl border border-earth-200 hover:border-earth-300 transition-colors bg-white shadow-2xs"
              >
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=80'}
                  alt={product.name}
                  className="w-16 h-16 rounded-xl object-cover border border-earth-200 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs truncate">{product.name}</h4>
                  <p className="text-[11px] text-slate-500">₹{product.price_per_unit} / {product.unit}</p>
                  
                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-earth-300 rounded-lg overflow-hidden bg-earth-50/50">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1 text-slate-600 hover:bg-earth-200 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-800">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock_quantity}
                        className="p-1 text-slate-600 hover:bg-earth-200 disabled:opacity-40 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 block">
                    ₹{(product.price_per_unit * quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {items.length > 0 && (
          <div className="p-5 border-t border-earth-200 bg-earth-50/50 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Produce Subtotal:</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Direct Delivery:</span>
                {shippingFee === 0 ? (
                  <span className="font-bold text-farm-700">FREE</span>
                ) : (
                  <span className="font-semibold text-slate-900">₹{shippingFee.toFixed(2)}</span>
                )}
              </div>
              <div className="border-t border-earth-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
                <span>Total Amount:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-farm-700 to-farm-600 hover:from-farm-600 hover:to-farm-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-farm-700/20 transition-all"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
