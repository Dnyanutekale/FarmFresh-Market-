import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, RefreshCcw, Leaf, Sparkles, MapPin } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Dry Fruits', 'Dry Products'];
const LOCATIONS = ['All Locations', 'Nashik', 'Mahabaleshwar', 'Kashmir', 'Ratnagiri', 'Pune'];

export default function Storefront({ onSelectProduct, initialFilters = {} }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState(initialFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 'All');
  const [selectedLocation, setSelectedLocation] = useState(initialFilters.location || 'All Locations');
  const [isOrganic, setIsOrganic] = useState(false);
  const [isFeatured, setIsFeatured] = useState(initialFilters.filter === 'featured');
  const [sortBy, setSortBy] = useState('newest');
  const [farmerId, setFarmerId] = useState(initialFilters.farmerId || null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        sort_by: sortBy,
      };

      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedLocation !== 'All Locations') params.location = selectedLocation;
      if (isOrganic) params.is_organic = true;
      if (isFeatured) params.is_featured = true;
      if (farmerId) params.farmer_id = farmerId;

      const data = await api.getProducts(params);
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedLocation, isOrganic, isFeatured, sortBy, farmerId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedLocation('All Locations');
    setIsOrganic(false);
    setIsFeatured(false);
    setSortBy('newest');
    setFarmerId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-farm-700 uppercase bg-farm-100 px-3 py-1 rounded-full">
            Direct Farm Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Fresh Produce Market
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Plucked straight from soil & trees by verified regional growers.
          </p>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search produce or farm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-earth-300 bg-white text-sm focus:outline-hidden focus:border-farm-600 focus:ring-2 focus:ring-farm-600/20 shadow-2xs"
          />
          <Search className="w-4 h-4 text-earth-500 absolute left-3.5 top-3.5" />
        </form>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-earth-200 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-farm-800 text-white shadow-md shadow-farm-800/20'
                : 'bg-white text-slate-700 hover:bg-earth-100 border border-earth-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Secondary Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-earth-200/90 shadow-2xs mb-8 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Location Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-earth-200 bg-earth-50/50 text-xs font-semibold text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-farm-600" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent focus:outline-hidden text-xs font-semibold cursor-pointer"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Organic Toggle */}
          <button
            onClick={() => setIsOrganic(!isOrganic)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              isOrganic
                ? 'bg-farm-100 text-farm-900 border-farm-400'
                : 'bg-white text-slate-700 border-earth-200 hover:bg-earth-50'
            }`}
          >
            <Leaf className={`w-3.5 h-3.5 ${isOrganic ? 'text-farm-700 fill-farm-700' : 'text-slate-400'}`} />
            Organic Certified
          </button>

          {/* Featured Toggle */}
          <button
            onClick={() => setIsFeatured(!isFeatured)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              isFeatured
                ? 'bg-amber-100 text-amber-900 border-amber-400'
                : 'bg-white text-slate-700 border-earth-200 hover:bg-earth-50'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isFeatured ? 'text-amber-600 fill-amber-600' : 'text-slate-400'}`} />
            Today's Fresh Deals
          </button>

          {/* Reset Filters button if any active */}
          {(selectedCategory !== 'All' || selectedLocation !== 'All Locations' || isOrganic || isFeatured || search || farmerId) && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-earth-100 transition-colors"
            >
              <RefreshCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-earth-200 bg-earth-50/50 text-slate-800 text-xs font-bold focus:outline-hidden focus:border-farm-600 cursor-pointer"
          >
            <option value="newest">Freshly Harvested (Newest)</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated Produce</option>
          </select>
        </div>

      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-earth-200/50 rounded-3xl h-80"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-earth-200 p-8 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-earth-100 rounded-full flex items-center justify-center mx-auto text-earth-500">
            <Filter className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">No Produce Matches Your Filter</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search keywords, category selection, or clearing location filters.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-farm-700 text-white font-bold text-xs hover:bg-farm-800 transition-all shadow-md"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-4 px-1">
            <span>Showing {products.length} farm items</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
