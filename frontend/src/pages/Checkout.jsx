import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  ArrowLeft, 
  Lock, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Checkout({ onNavigate }) {
  const { items, subtotal, shippingFee, total, clearCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    shipping_name: user?.full_name || '',
    shipping_phone: user?.phone || '',
    shipping_address: '',
    shipping_city: 'Pune',
    shipping_postal_code: '411001',
    order_notes: '',
    payment_method: 'razorpay_mock', // 'cod', 'razorpay_mock', 'stripe_mock'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [simulatingPayment, setSimulatingPayment] = useState(false);

  if (items.length === 0 && !createdOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-slate-900">Your Basket is Empty</h2>
        <p className="text-slate-500 text-sm">Add some farm fresh vegetables or fruits before checking out.</p>
        <button
          onClick={() => onNavigate('storefront')}
          className="px-6 py-3 rounded-xl bg-farm-700 text-white font-bold text-sm"
        >
          Explore Fresh Harvest
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      onNavigate('login');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const orderPayload = {
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        shipping_name: formData.shipping_name,
        shipping_phone: formData.shipping_phone,
        shipping_address: formData.shipping_address,
        shipping_city: formData.shipping_city,
        shipping_postal_code: formData.shipping_postal_code,
        order_notes: formData.order_notes || null,
        payment_method: formData.payment_method,
      };

      const order = await api.createOrder(orderPayload);
      setCreatedOrder(order);

      if (formData.payment_method === 'cod') {
        clearCart();
        setLoading(false);
      } else {
        // Trigger Sandbox Mock Payment Gateway popup
        setPaymentModalOpen(true);
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!createdOrder) return;
    setSimulatingPayment(true);
    try {
      const gateway = formData.payment_method.replace('_mock', '');
      const txId = `tx_${gateway}_sandbox_${Date.now()}`;
      await api.verifyPayment(createdOrder.id, gateway, txId, 'success');
      clearCart();
      setPaymentModalOpen(false);
      setSimulatingPayment(false);
    } catch (err) {
      setError('Payment simulation error: ' + err.message);
      setSimulatingPayment(false);
    }
  };

  // If order complete
  if (createdOrder && !paymentModalOpen) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-20 h-20 bg-farm-100 rounded-3xl flex items-center justify-center mx-auto text-farm-700 shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-farm-700 bg-farm-100 px-3 py-1 rounded-full">
            Harvest Ordered Successfully!
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Thank You For Sponsoring Our Farmers</h2>
          <p className="text-slate-600 text-sm">
            Order Reference: <span className="font-mono font-bold text-farm-800">{createdOrder.order_number}</span>
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your produce has been scheduled for early-morning packing with the respective farmers. A tracking timeline has been initiated.
          </p>
        </div>

        <div className="p-4 bg-earth-50 rounded-2xl border border-earth-200 text-left text-xs space-y-2">
          <div className="flex justify-between font-bold text-slate-900">
            <span>Total Paid/Payable:</span>
            <span>₹{createdOrder.final_amount}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Delivery Destination:</span>
            <span>{createdOrder.shipping_address}, {createdOrder.shipping_city}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Payment Mode:</span>
            <span className="uppercase font-semibold text-farm-700">{createdOrder.payment_method.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center pt-2">
          <button
            onClick={() => onNavigate('orders')}
            className="px-6 py-3 rounded-xl bg-farm-700 hover:bg-farm-800 text-white font-bold text-sm shadow-md transition-all"
          >
            Track Order Status
          </button>
          <button
            onClick={() => onNavigate('storefront')}
            className="px-6 py-3 rounded-xl bg-white hover:bg-earth-100 text-slate-700 font-bold text-sm border border-earth-300 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <button
        onClick={() => onNavigate('storefront')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-farm-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Fresh Catalog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Form: Delivery Details */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Delivery & Checkout
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Provide the exact drop location for direct delivery from the farms.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmitOrder} className="space-y-6">
            
            {/* Contact details */}
            <div className="bg-white p-6 rounded-3xl border border-earth-200/90 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-farm-600" />
                Delivery Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Receiver's Full Name *</label>
                  <input
                    type="text"
                    name="shipping_name"
                    required
                    value={formData.shipping_name}
                    onChange={handleChange}
                    placeholder="e.g. Siddharth Mehra"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-earth-300 text-xs focus:ring-2 focus:ring-farm-600/20 focus:border-farm-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone Number *</label>
                  <input
                    type="tel"
                    name="shipping_phone"
                    required
                    value={formData.shipping_phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-earth-300 text-xs focus:ring-2 focus:ring-farm-600/20 focus:border-farm-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Complete Street / Flat Address *</label>
                <textarea
                  name="shipping_address"
                  required
                  rows={2}
                  value={formData.shipping_address}
                  onChange={handleChange}
                  placeholder="Flat 402, Green Valley Apartments, Baner Road"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-earth-300 text-xs focus:ring-2 focus:ring-farm-600/20 focus:border-farm-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City / Region *</label>
                  <input
                    type="text"
                    name="shipping_city"
                    required
                    value={formData.shipping_city}
                    onChange={handleChange}
                    placeholder="Pune"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-earth-300 text-xs focus:ring-2 focus:ring-farm-600/20 focus:border-farm-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Postal Code (PIN) *</label>
                  <input
                    type="text"
                    name="shipping_postal_code"
                    required
                    value={formData.shipping_postal_code}
                    onChange={handleChange}
                    placeholder="411045"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-earth-300 text-xs focus:ring-2 focus:ring-farm-600/20 focus:border-farm-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Special Harvest / Delivery Notes (Optional)</label>
                <input
                  type="text"
                  name="order_notes"
                  value={formData.order_notes}
                  onChange={handleChange}
                  placeholder="Leave at front porch or ring doorbell twice"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-earth-300 text-xs focus:ring-2 focus:ring-farm-600/20 focus:border-farm-600"
                />
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div className="bg-white p-6 rounded-3xl border border-earth-200/90 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-farm-600" />
                Select Payment Mode
              </h3>

              <div className="space-y-3">
                
                {/* Razorpay Sandbox */}
                <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.payment_method === 'razorpay_mock'
                    ? 'border-farm-600 bg-farm-50/50 ring-2 ring-farm-600/20'
                    : 'border-earth-200 hover:bg-earth-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="razorpay_mock"
                      checked={formData.payment_method === 'razorpay_mock'}
                      onChange={handleChange}
                      className="text-farm-600 focus:ring-farm-600"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">Razorpay Test Gateway (Sandbox)</span>
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-sm">Instant</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Simulate UPI, Netbanking, or QR Code payments</p>
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-farm-600" />
                </label>

                {/* Stripe Sandbox */}
                <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.payment_method === 'stripe_mock'
                    ? 'border-farm-600 bg-farm-50/50 ring-2 ring-farm-600/20'
                    : 'border-earth-200 hover:bg-earth-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="stripe_mock"
                      checked={formData.payment_method === 'stripe_mock'}
                      onChange={handleChange}
                      className="text-farm-600 focus:ring-farm-600"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">Stripe Card Payment (Sandbox)</span>
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 rounded-sm">Demo</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Simulate Visa, Mastercard & RuPay cards</p>
                    </div>
                  </div>
                  <Lock className="w-4 h-4 text-purple-600" />
                </label>

                {/* Cash on Delivery */}
                <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.payment_method === 'cod'
                    ? 'border-farm-600 bg-farm-50/50 ring-2 ring-farm-600/20'
                    : 'border-earth-200 hover:bg-earth-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={formData.payment_method === 'cod'}
                      onChange={handleChange}
                      className="text-farm-600 focus:ring-farm-600"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900">Cash on Delivery (Pay at Door)</span>
                      <p className="text-[11px] text-slate-500">Pay cash or scan courier UPI QR upon arrival</p>
                    </div>
                  </div>
                  <Banknote className="w-4 h-4 text-emerald-600" />
                </label>

              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-farm-700 to-farm-600 hover:from-farm-600 hover:to-farm-500 text-white font-extrabold text-sm shadow-xl shadow-farm-700/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Processing Order...' : `Confirm & Place Order (₹${total.toFixed(2)})`}
            </button>

          </form>
        </div>

        {/* Right Column: Order Basket Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-3xl border border-earth-200/90 shadow-xs sticky top-28 space-y-5">
            <h3 className="font-extrabold text-slate-900 text-base border-b border-earth-100 pb-3">
              Order Basket ({items.length} items)
            </h3>

            {/* Item list */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-12 h-12 rounded-xl object-cover border border-earth-200 shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-bold text-slate-900 truncate">{product.name}</p>
                      <p className="text-slate-400 text-[11px]">{quantity} × ₹{product.price_per_unit}/{product.unit}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    ₹{(product.price_per_unit * quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-earth-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Produce Total:</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Direct Cold Delivery:</span>
                {shippingFee === 0 ? (
                  <span className="font-bold text-farm-700">FREE</span>
                ) : (
                  <span className="font-semibold text-slate-900">₹{shippingFee.toFixed(2)}</span>
                )}
              </div>
              <div className="border-t border-earth-200 pt-3 flex justify-between text-base font-extrabold text-slate-900">
                <span>Final Amount:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Guarantee note */}
            <div className="p-3.5 bg-farm-50 rounded-2xl border border-farm-200/80 flex items-start gap-2 text-xs text-farm-900">
              <ShieldCheck className="w-4 h-4 text-farm-700 shrink-0 mt-0.5" />
              <span>
                100% money-back freshness guarantee if any produce item doesn't meet your crisp standard.
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* Mock Payment Simulation Modal */}
      {paymentModalOpen && createdOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl border border-earth-200 animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <CreditCard className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                Sandbox Test Mode
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                Simulate Payment for Order
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Order ID: <span className="font-mono font-bold text-slate-700">{createdOrder.order_number}</span>
              </p>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">₹{createdOrder.final_amount}</p>
            </div>

            <div className="p-3.5 bg-earth-50 rounded-2xl border border-earth-200 text-left text-xs space-y-1.5 text-slate-600">
              <p><strong className="text-slate-800">Gateway:</strong> {formData.payment_method.replace('_mock', '').toUpperCase()}</p>
              <p><strong className="text-slate-800">Environment:</strong> Safe Sandbox (No actual card charged)</p>
              <p><strong className="text-slate-800">Beneficiary:</strong> Respective Farm Producers</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleSimulatePaymentSuccess}
                disabled={simulatingPayment}
                className="w-full py-3.5 rounded-xl bg-farm-700 hover:bg-farm-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {simulatingPayment ? 'Verifying Sandbox Payment...' : 'Simulate Successful Payment (Test Flow)'}
              </button>
              
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel / Return
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
