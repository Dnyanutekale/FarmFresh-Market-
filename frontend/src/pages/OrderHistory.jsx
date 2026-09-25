import React, { useEffect, useState } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  ArrowLeft, 
  AlertCircle, 
  XCircle,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_STEPS = ['pending', 'confirmed', 'packed', 'dispatched', 'delivered'];

export default function OrderHistory({ onNavigate }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        onNavigate('login');
        return;
      }
      try {
        const data = await api.getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancellingId(orderId);
    try {
      const updated = await api.cancelOrder(orderId);
      setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      alert("Failed to cancel order: " + err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const getStepIndex = (status) => {
    if (status === 'cancelled') return -1;
    return STATUS_STEPS.indexOf(status);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => onNavigate('storefront')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-farm-700 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Produce
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Orders & Tracking
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Real-time status updates from farm harvest to your doorstep.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-earth-200/50 rounded-3xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-earth-200 p-8 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-earth-100 rounded-full flex items-center justify-center mx-auto text-earth-500">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">No Orders Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              You haven't ordered any fresh harvest produce yet. Support local growers today!
            </p>
          </div>
          <button
            onClick={() => onNavigate('storefront')}
            className="px-5 py-2.5 rounded-xl bg-farm-700 text-white font-bold text-xs hover:bg-farm-800 transition-all shadow-md"
          >
            Shop Fresh Produce
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const stepIdx = getStepIndex(order.status);
            const isCancelled = order.status === 'cancelled';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-earth-200/90 shadow-2xs overflow-hidden transition-all hover:shadow-md"
              >
                {/* Order Header bar */}
                <div className="p-5 bg-earth-50/70 border-b border-earth-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{order.order_number}</span>
                      <span className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                        isCancelled
                          ? 'bg-rose-100 text-rose-800'
                          : order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-farm-100 text-farm-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Placed on {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400">Total Amount</span>
                      <p className="text-base font-extrabold text-slate-900">₹{order.final_amount}</p>
                    </div>

                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingId === order.id}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                      >
                        {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Tracking Timeline (if not cancelled) */}
                {!isCancelled ? (
                  <div className="p-6 border-b border-earth-100">
                    <p className="text-xs font-bold text-slate-700 mb-4">Harvest & Delivery Timeline</p>
                    <div className="grid grid-cols-5 gap-2 relative">
                      {STATUS_STEPS.map((step, idx) => {
                        const isDone = idx <= stepIdx;
                        const isCurrent = idx === stepIdx;

                        return (
                          <div key={step} className="text-center relative">
                            {/* Circle Indicator */}
                            <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                              isDone
                                ? 'bg-farm-700 text-white'
                                : 'bg-earth-100 text-slate-400 border border-earth-200'
                            } ${isCurrent ? 'ring-4 ring-farm-600/20' : ''}`}>
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>

                            <p className={`text-[11px] capitalize mt-2 font-bold ${
                              isDone ? 'text-farm-900' : 'text-slate-400'
                            }`}>
                              {step}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-rose-50/70 border-b border-rose-100 flex items-center gap-2 text-xs font-semibold text-rose-700">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>This order has been cancelled and any reserved produce returned to farm stock.</span>
                  </div>
                )}

                {/* Items in order */}
                <div className="p-5 space-y-3">
                  <p className="text-xs font-bold text-slate-700">Produce Included ({order.items.length}):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-earth-100 bg-earth-50/40"
                      >
                        <img
                          src={item.product_image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&auto=format&fit=crop'}
                          alt={item.product_name}
                          className="w-12 h-12 rounded-lg object-cover border border-earth-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">{item.product_name}</p>
                          <p className="text-[11px] text-slate-500">
                            {item.quantity} {item.unit} × ₹{item.unit_price} = <strong className="text-slate-800">₹{item.subtotal}</strong>
                          </p>
                          <span className="text-[10px] text-farm-700 font-semibold uppercase">Status: {item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Destination info */}
                  <div className="pt-3 border-t border-earth-100 text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-earth-400 shrink-0" />
                    <span>Drop: {order.shipping_address}, {order.shipping_city} (Phone: {order.shipping_phone})</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
