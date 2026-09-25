import React, { useEffect, useState } from 'react';
import { 
  Sprout, 
  Package, 
  IndianRupee, 
  ShoppingBag, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  AlertCircle,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PRESET_IMAGES = [
  { name: 'Fresh Tomatoes', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80' },
  { name: 'Red Onions', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80' },
  { name: 'Green Spinach', url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80' },
  { name: 'Strawberries', url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&auto=format&fit=crop&q=80' },
  { name: 'Alphonso Mangoes', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80' },
  { name: 'Kashmir Walnuts', url: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&auto=format&fit=crop&q=80' },
  { name: 'Desi Cow Ghee', url: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=800&auto=format&fit=crop&q=80' },
  { name: 'Wild Forest Honey', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80' },
];

export default function FarmerDashboard({ onNavigate }) {
  const { user, isFarmer } = useAuth();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders'

  // Modal State for Add / Edit Product
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Vegetables',
    price_per_unit: '',
    unit: 'kg',
    stock_quantity: '',
    image_url: PRESET_IMAGES[0].url,
    harvest_date: new Date().toISOString().split('T')[0],
    is_organic: true,
    is_featured: false,
    description: '',
  });

  const loadData = async () => {
    if (!user || !isFarmer) {
      onNavigate('login');
      return;
    }
    setLoading(true);
    try {
      const [statsData, productsData, ordersData] = await Promise.all([
        api.getFarmerDashboard(),
        api.getFarmerProducts(),
        api.getFarmerOrders(),
      ]);
      setStats(statsData);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (err) {
      console.error("Failed to load farmer dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Vegetables',
      price_per_unit: '',
      unit: 'kg',
      stock_quantity: '',
      image_url: PRESET_IMAGES[0].url,
      harvest_date: new Date().toISOString().split('T')[0],
      is_organic: true,
      is_featured: false,
      description: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      category: p.category,
      price_per_unit: p.price_per_unit,
      unit: p.unit,
      stock_quantity: p.stock_quantity,
      image_url: p.image_url || PRESET_IMAGES[0].url,
      harvest_date: p.harvest_date || new Date().toISOString().split('T')[0],
      is_organic: p.is_organic,
      is_featured: p.is_featured,
      description: p.description || '',
    });
    setModalOpen(true);
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await api.uploadImage(file);
      setProductForm((prev) => ({ ...prev, image_url: `http://127.0.0.1:8000${res.image_url}` }));
    } catch (err) {
      alert("Image upload failed: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        name: productForm.name,
        category: productForm.category,
        price_per_unit: parseFloat(productForm.price_per_unit),
        unit: productForm.unit,
        stock_quantity: parseFloat(productForm.stock_quantity),
        image_url: productForm.image_url,
        harvest_date: productForm.harvest_date || null,
        is_organic: Boolean(productForm.is_organic),
        is_featured: Boolean(productForm.is_featured),
        is_available: parseFloat(productForm.stock_quantity) > 0,
        description: productForm.description,
      };

      if (editingProduct) {
        await api.updateFarmerProduct(editingProduct.id, payload);
      } else {
        await api.createFarmerProduct(payload);
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      alert("Failed to save product: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product listing?")) return;
    try {
      await api.deleteFarmerProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      if (stats) setStats({ ...stats, total_products: stats.total_products - 1 });
    } catch (err) {
      alert("Failed to delete product: " + err.message);
    }
  };

  const handleUpdateOrderStatus = async (itemId, newStatus) => {
    try {
      await api.updateFarmerItemStatus(itemId, newStatus);
      setOrders(orders.map((o) => (o.item_id === itemId ? { ...o, fulfillment_status: newStatus } : o)));
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Farmer Profile & Welcome Banner */}
      <div className="bg-gradient-to-r from-farm-900 to-farm-950 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl border border-farm-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-farm-700/80 border-2 border-farm-500 overflow-hidden flex items-center justify-center shrink-0">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
              ) : (
                <Sprout className="w-8 h-8 text-farm-300" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight">{user?.farm_name || user?.full_name}</h1>
                <span className="bg-farm-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-farm-400">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Grower
                </span>
              </div>
              <p className="text-xs text-farm-200 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-farm-400" />
                {user?.farm_location || 'Local Agro Region'} • {user?.phone || 'Contact on file'}
              </p>
              <p className="text-xs text-slate-300 mt-2 max-w-xl line-clamp-1">
                {user?.bio || 'Dedicated to organic soil enrichment, seasonal crop harvesting, and direct customer delivery.'}
              </p>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-farm-900 font-extrabold text-xs shadow-md hover:bg-farm-50 transition-all shrink-0 self-start sm:self-center"
          >
            <Plus className="w-4 h-4 text-farm-700" />
            Add Fresh Harvest Item
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        
        <div className="bg-white p-5 rounded-3xl border border-earth-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Total Revenue</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">₹{stats?.total_revenue || 0}</p>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1 block">90%+ direct payout</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-earth-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Active Listings</span>
            <div className="p-2 bg-farm-50 rounded-xl text-farm-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{products.length}</p>
          <span className="text-[11px] font-semibold text-slate-400 mt-1 block">Live in store</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-earth-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Total Produce Orders</span>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{orders.length}</p>
          <span className="text-[11px] font-semibold text-blue-600 mt-1 block">Customer line items</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-earth-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Pending Delivery</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.pending_fulfillments || 0}</p>
          <span className="text-[11px] font-semibold text-amber-600 mt-1 block">Awaiting packing/dispatch</span>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-earth-200 mb-6">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-4 text-sm font-extrabold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'border-farm-700 text-farm-900'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Package className="w-4 h-4" />
          Produce Inventory ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-sm font-extrabold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-farm-700 text-farm-900'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Orders to Fulfill ({orders.length})
        </button>
      </div>

      {/* Tab 1: Inventory Table / Grid */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-earth-200 shadow-2xs overflow-hidden">
          {products.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <p className="text-slate-500 text-sm">You haven't listed any produce yet.</p>
              <button
                onClick={openAddModal}
                className="px-4 py-2 rounded-xl bg-farm-700 text-white font-bold text-xs"
              >
                Add Your First Harvest
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-earth-50 border-b border-earth-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Produce</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Harvest Date</th>
                    <th className="py-3.5 px-4">Organic</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100 font-medium text-slate-700">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-earth-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&auto=format&fit=crop'}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover border border-earth-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block truncate max-w-xs">{p.name}</span>
                            <span className="text-[10px] text-slate-400">ID: #{p.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">{p.category}</td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{p.price_per_unit} <span className="text-slate-400 font-normal">/{p.unit}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md font-bold ${
                          p.stock_quantity > 0 ? 'bg-farm-100 text-farm-900' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {p.stock_quantity} {p.unit}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {p.harvest_date || 'N/A'}
                      </td>

                      <td className="py-3.5 px-4">
                        {p.is_organic ? (
                          <span className="text-farm-700 font-bold bg-farm-50 px-2 py-0.5 rounded-md border border-farm-200">
                            Yes
                          </span>
                        ) : (
                          <span className="text-slate-400">Standard</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-farm-700 hover:bg-earth-100"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Orders to Fulfill */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-earth-200 shadow-2xs overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No orders received for your harvest yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-earth-50 border-b border-earth-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Order Ref</th>
                    <th className="py-3.5 px-4">Product Plucked</th>
                    <th className="py-3.5 px-4">Customer Info</th>
                    <th className="py-3.5 px-4">Payout</th>
                    <th className="py-3.5 px-4">Fulfillment Status</th>
                    <th className="py-3.5 px-4 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100 font-medium text-slate-700">
                  {orders.map((o) => (
                    <tr key={o.item_id} className="hover:bg-earth-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {o.order_number}
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {new Date(o.created_at).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={o.product_image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&auto=format&fit=crop'}
                            alt={o.product_name}
                            className="w-9 h-9 rounded-lg object-cover border border-earth-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block truncate max-w-[140px]">{o.product_name}</span>
                            <span className="text-[11px] text-slate-500">{o.quantity} {o.unit}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{o.customer_name}</p>
                        <p className="text-slate-400 text-[11px]">{o.customer_phone}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-xs">{o.shipping_address}</p>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{o.subtotal}
                        <span className="block text-[10px] text-emerald-600 font-normal">
                          {o.payment_status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full capitalize ${
                          o.fulfillment_status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.fulfillment_status === 'dispatched'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.fulfillment_status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={o.fulfillment_status}
                          onChange={(e) => handleUpdateOrderStatus(o.item_id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-xl border border-earth-300 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:border-farm-600 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="packed">Packed</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 overflow-hidden shadow-2xl border border-earth-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-earth-200 mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {editingProduct ? 'Edit Harvest Item' : 'Add New Harvest Item'}
                </h3>
                <p className="text-xs text-slate-500">Provide harvest details for consumer transparency</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-earth-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Produce Name *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Heirloom Country Tomatoes"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-earth-300 text-xs focus:ring-2 focus:ring-farm-600/20 focus:border-farm-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-earth-300 text-xs font-semibold focus:ring-2 focus:ring-farm-600/20 focus:border-farm-600"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Dry Fruits">Dry Fruits</option>
                    <option value="Dry Products">Dry Products</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Type *</label>
                  <select
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-earth-300 text-xs font-semibold focus:ring-2 focus:ring-farm-600/20 focus:border-farm-600"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="500g">500g Pack</option>
                    <option value="250g">250g Pack</option>
                    <option value="bunch">bunch</option>
                    <option value="box">box</option>
                    <option value="piece">piece</option>
                    <option value="dozen">dozen</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹ per unit) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={productForm.price_per_unit}
                    onChange={(e) => setProductForm({ ...productForm, price_per_unit: e.target.value })}
                    placeholder="e.g. 45"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-earth-300 text-xs focus:ring-2 focus:ring-farm-600/20 focus:border-farm-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                    placeholder="e.g. 100"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-earth-300 text-xs focus:ring-2 focus:ring-farm-600/20 focus:border-farm-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harvest / Pluck Date</label>
                  <input
                    type="date"
                    value={productForm.harvest_date}
                    onChange={(e) => setProductForm({ ...productForm, harvest_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-earth-300 text-xs focus:ring-2 focus:ring-farm-600/20 focus:border-farm-600"
                  />
                </div>

                <div className="flex items-center gap-4 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.is_organic}
                      onChange={(e) => setProductForm({ ...productForm, is_organic: e.target.checked })}
                      className="rounded-sm text-farm-600 focus:ring-farm-600"
                    />
                    <span className="font-bold text-slate-800">Organic Certified</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.is_featured}
                      onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                      className="rounded-sm text-farm-600 focus:ring-farm-600"
                    />
                    <span className="font-bold text-amber-700">Fresh Deal</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Image</label>
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-farm-100 file:text-farm-800 hover:file:bg-farm-200"
                  />
                  {uploadingImage && <span className="text-[11px] text-farm-700">Uploading...</span>}
                </div>

                {/* Preset produce selector */}
                <span className="text-[11px] text-slate-400 block mb-1.5">Or pick from curated produce photo library:</span>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {PRESET_IMAGES.map((img) => (
                    <button
                      key={img.name}
                      type="button"
                      onClick={() => setProductForm({ ...productForm, image_url: img.url })}
                      className={`relative rounded-lg overflow-hidden border-2 shrink-0 w-12 h-12 transition-all ${
                        productForm.image_url === img.url ? 'border-farm-600 ring-2 ring-farm-600/30' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      title={img.name}
                    >
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Farming Technique</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Grown without synthetic pesticides using drip irrigation..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-earth-300 text-xs focus:ring-2 focus:ring-farm-600/20 focus:border-farm-600"
                />
              </div>

              <div className="pt-4 border-t border-earth-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-earth-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-xl bg-farm-700 hover:bg-farm-800 text-white font-bold text-xs shadow-md transition-all"
                >
                  {formLoading ? 'Saving...' : editingProduct ? 'Save Changes' : 'Publish Produce Item'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
