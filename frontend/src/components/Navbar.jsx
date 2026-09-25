import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  User as UserIcon, 
  LogOut, 
  Sprout, 
  Menu, 
  X, 
  LayoutDashboard, 
  ShieldCheck, 
  Clock,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ onNavigate, currentPage, onSearch }) {
  const { user, logout, isFarmer, isAdmin } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
    if (currentPage !== 'storefront') {
      onNavigate('storefront', { search: searchTerm });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-earth-200/80 shadow-xs transition-all">
      {/* Top Banner */}
      <div className="bg-farm-900 text-farm-100 text-xs py-1.5 px-4 text-center font-medium">
        <span>🌱 Harvested Daily • 0 Middlemen • 100% Direct from Farm to Your Table • Free delivery over ₹500</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-farm-700 to-farm-500 flex items-center justify-center text-white shadow-md shadow-farm-700/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">FarmFresh</span>
                <span className="text-2xl font-extrabold text-farm-600 tracking-tight">Market</span>
              </div>
              <p className="text-[11px] font-semibold text-earth-500 uppercase tracking-wider -mt-1">Direct Farmer Produce</p>
            </div>
          </div>

          {/* Desktop Search */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <input
              type="text"
              placeholder="Search farm tomatoes, organic honey, Kashmiri walnuts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-earth-300 bg-earth-50/50 text-sm focus:outline-hidden focus:border-farm-600 focus:bg-white focus:ring-2 focus:ring-farm-600/20 transition-all text-slate-800 placeholder-slate-400"
            />
            <Search className="w-4 h-4 text-earth-500 absolute left-3.5 top-3.5" />
          </form>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-700">
            <button 
              onClick={() => onNavigate('home')}
              className={`hover:text-farm-700 transition-colors ${currentPage === 'home' ? 'text-farm-700 font-bold' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate('storefront')}
              className={`hover:text-farm-700 transition-colors ${currentPage === 'storefront' ? 'text-farm-700 font-bold' : ''}`}
            >
              Shop Produce
            </button>
            <button 
              onClick={() => onNavigate('home', { scrollTo: 'farmers' })}
              className="hover:text-farm-700 transition-colors"
            >
              Meet Farmers
            </button>
            <button 
              onClick={() => onNavigate('storefront', { filter: 'featured' })}
              className="hover:text-farm-700 transition-colors flex items-center gap-1 text-amber-700"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Fresh Deals
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl text-slate-700 hover:text-farm-800 hover:bg-farm-50 transition-colors border border-earth-200"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-farm-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Dropdown / Auth CTA */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-earth-200 hover:border-earth-300 bg-white hover:bg-earth-50 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-farm-100 text-farm-800 font-bold flex items-center justify-center text-xs border border-farm-200">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      user.full_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{user.full_name}</p>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-farm-700 bg-farm-100/80 px-1.5 py-0.2 rounded-sm inline-block">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-earth-200/90 py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-earth-100">
                      <p className="font-semibold text-slate-900 truncate">{user.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    {isFarmer && (
                      <button
                        onClick={() => { setUserDropdownOpen(false); onNavigate('farmer-dashboard'); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-slate-700 hover:bg-farm-50 hover:text-farm-800 font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 text-farm-600" />
                        Farmer Dashboard
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => { setUserDropdownOpen(false); onNavigate('admin-dashboard'); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-slate-700 hover:bg-farm-50 hover:text-farm-800 font-medium"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        Admin Panel
                      </button>
                    )}

                    <button
                      onClick={() => { setUserDropdownOpen(false); onNavigate('orders'); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-slate-700 hover:bg-farm-50 hover:text-farm-800 font-medium"
                    >
                      <Clock className="w-4 h-4 text-slate-500" />
                      My Orders & Tracking
                    </button>

                    <div className="border-t border-earth-100 my-1"></div>

                    <button
                      onClick={() => { setUserDropdownOpen(false); logout(); onNavigate('home'); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-rose-600 hover:bg-rose-50 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-farm-800 hover:bg-earth-100 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('register', { role: 'farmer' })}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-farm-700 hover:bg-farm-800 transition-all shadow-sm hover:shadow-md shadow-farm-700/20"
                >
                  <Sprout className="w-4 h-4" />
                  Sell as Farmer
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-earth-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-earth-200 px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search fresh harvest..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-earth-300 text-sm"
            />
            <Search className="w-4 h-4 text-earth-500 absolute left-3 top-2.5" />
          </form>

          <div className="flex flex-col gap-2 pt-2 text-sm font-semibold">
            <button 
              onClick={() => { setMobileMenuOpen(false); onNavigate('home'); }} 
              className="text-left py-2 px-3 rounded-lg hover:bg-earth-100"
            >
              Home
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onNavigate('storefront'); }} 
              className="text-left py-2 px-3 rounded-lg hover:bg-earth-100"
            >
              Shop All Produce
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onNavigate('home', { scrollTo: 'farmers' }); }} 
              className="text-left py-2 px-3 rounded-lg hover:bg-earth-100"
            >
              Meet Our Farmers
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onNavigate('storefront', { filter: 'featured' }); }} 
              className="text-left py-2 px-3 rounded-lg hover:bg-earth-100 text-amber-700"
            >
              Today's Best Harvest
            </button>

            {!user && (
              <button 
                onClick={() => { setMobileMenuOpen(false); onNavigate('register', { role: 'farmer' }); }} 
                className="w-full text-center py-2.5 mt-2 rounded-xl bg-farm-700 text-white font-semibold"
              >
                Join & Sell as Farmer
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
