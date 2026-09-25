import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Users,
  Package,
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  BarChart3,
  Search,
  ChevronDown,
  AlertCircle,
  RefreshCcw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packed: 'bg-purple-100 text-purple-800',
  dispatched: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const PAYMENT_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

export default function AdminDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === 'users' && farmers.length === 0) loadFarmers();
    if (activeTab === 'orders' && orders.length === 0) loadOrders();
  }, [activeTab]);

  const loadDashboard = async () => {
    try {
      const data = await api.getAdminDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFarmers = async () => {
    try {
      const data = await api.getAdminFarmers();
      setFarmers(data);
    } catch (err) {
      console.error('Failed to load farmers:', err);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await api.getAdminOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  const handleToggleVerify = async (farmerId) => {
    try {
      const updated = await api.toggleFarmerVerify(farmerId);
      setFarmers((prev) =>
        prev.map((f) => (f.id === farmerId ? { ...f, is_verified_farmer: updated.is_verified_farmer } : f))
      );
    } catch (err) {
      console.error('Failed to toggle verification:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateAdminOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const filteredFarmers = farmers.filter(
    (f) =>
      f.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.farm_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users & Farmers', icon: Users },
    { id: 'orders', label: 'All Orders', icon: ShoppingBag },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Panel</h1>
          <p className="text-sm text-slate-500">Platform management & analytics</p>
        </div>
      </div>

      {/* Metric Cards */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <MetricCard icon={IndianRupee} label="Total Revenue" value={formatCurrency(dashboard.total_revenue)} color="green" />
          <MetricCard icon={ShoppingBag} label="Total Orders" value={dashboard.orders_count} color="blue" />
          <MetricCard icon={Users} label="Total Users" value={dashboard.total_users} color="purple" />
          <MetricCard icon={Users} label="Farmers" value={dashboard.farmers_count} color="emerald" />
          <MetricCard icon={Users} label="Customers" value={dashboard.customers_count} color="amber" />
          <MetricCard icon={Package} label="Products" value={dashboard.products_count} color="orange" />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-earth-100/80 p-1 rounded-2xl mb-8 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab dashboard={dashboard} orders={orders} loadOrders={loadOrders} />
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search farmers by name, email, or farm..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-300 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          {/* Farmers Table */}
          <div className="bg-white rounded-2xl border border-earth-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-earth-200 bg-earth-50/50">
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Farm</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Location</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Verified</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Joined</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFarmers.map((farmer) => (
                    <tr key={farmer.id} className="border-b border-earth-100 hover:bg-earth-50/40 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono text-xs">#{farmer.id}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{farmer.full_name}</td>
                      <td className="py-3 px-4 text-slate-600">{farmer.email}</td>
                      <td className="py-3 px-4 text-slate-700">{farmer.farm_name || '—'}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs">{farmer.farm_location || '—'}</td>
                      <td className="py-3 px-4">
                        {farmer.is_verified_farmer ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {new Date(farmer.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleVerify(farmer.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            farmer.is_verified_farmer
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                              : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                          }`}
                        >
                          {farmer.is_verified_farmer ? 'Suspend' : 'Approve'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredFarmers.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="font-medium">No farmers found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">All Platform Orders</h2>
            <button
              onClick={loadOrders}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-earth-100 border border-earth-200 transition-all"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-earth-200/80 shadow-sm overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-earth-50/40 transition-colors"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs font-bold text-slate-500">#{order.order_number || order.id}</span>
                    <span className="font-semibold text-slate-800">{order.shipping_name}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600'}`}>
                      {order.status}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${PAYMENT_COLORS[order.payment_status] || 'bg-slate-100 text-slate-600'}`}>
                      {order.payment_status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800">{formatCurrency(order.final_amount || order.total_amount)}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="border-t border-earth-200 p-4 bg-earth-50/30">
                    {/* Order Items */}
                    <div className="space-y-2 mb-4">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded-xl border border-earth-100">
                          <div className="flex items-center gap-3">
                            {item.product_image && (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="w-10 h-10 rounded-lg object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            )}
                            <div>
                              <p className="font-semibold text-sm text-slate-800">{item.product_name}</p>
                              <p className="text-xs text-slate-500">
                                {item.quantity} × {formatCurrency(item.unit_price)} / {item.unit}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-slate-800">{formatCurrency(item.subtotal)}</p>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STATUS_COLORS[item.status] || ''}`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Info */}
                    <div className="text-xs text-slate-500 mb-3">
                      <p><strong>Ship to:</strong> {order.shipping_name}, {order.shipping_phone}</p>
                      <p>{order.shipping_address}, {order.shipping_city} - {order.shipping_postal_code}</p>
                    </div>

                    {/* Status Update */}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600">Update Status:</span>
                        {['confirmed', 'packed', 'dispatched', 'delivered'].map((s) => (
                          <button
                            key={s}
                            onClick={() => handleUpdateOrderStatus(order.id, s)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              order.status === s
                                ? 'bg-purple-600 text-white'
                                : 'bg-earth-100 text-slate-600 hover:bg-purple-100 hover:text-purple-700'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {orders.length === 0 && (
              <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-earth-200">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="font-medium">No orders yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Sub-Components ---- */

function MetricCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
  };

  return (
    <div className={`p-4 rounded-2xl border ${colorMap[color] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
      <Icon className="w-5 h-5 mb-2 opacity-70" />
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
    </div>
  );
}

function OverviewTab({ dashboard, orders, loadOrders }) {
  useEffect(() => {
    if (orders.length === 0) loadOrders();
  }, []);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Quick Stats Summary */}
      <div className="bg-white rounded-2xl border border-earth-200/80 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Platform Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
            <p className="text-sm font-semibold text-green-700 mb-1">Total GMV (Revenue)</p>
            <p className="text-3xl font-extrabold text-green-800">{formatCurrency(dashboard?.total_revenue)}</p>
            <p className="text-xs text-green-600 mt-1">From {dashboard?.orders_count || 0} orders</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
            <p className="text-sm font-semibold text-blue-700 mb-1">Active Marketplace</p>
            <p className="text-3xl font-extrabold text-blue-800">{dashboard?.products_count || 0}</p>
            <p className="text-xs text-blue-600 mt-1">Products from {dashboard?.farmers_count || 0} farmers</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200">
            <p className="text-sm font-semibold text-purple-700 mb-1">User Base</p>
            <p className="text-3xl font-extrabold text-purple-800">{dashboard?.total_users || 0}</p>
            <p className="text-xs text-purple-600 mt-1">{dashboard?.customers_count || 0} customers + {dashboard?.farmers_count || 0} farmers</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-earth-200/80 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Orders</h3>
        {recentOrders.length > 0 ? (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-earth-50/60 transition-colors border border-earth-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-500">#{order.order_number || order.id}</span>
                  <span className="text-sm font-semibold text-slate-800">{order.shipping_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${STATUS_COLORS[order.status] || ''}`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-sm text-slate-800">{formatCurrency(order.final_amount || order.total_amount)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-8">No orders to display</p>
        )}
      </div>
    </div>
  );
}
