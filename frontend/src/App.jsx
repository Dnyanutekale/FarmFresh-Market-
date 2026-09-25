import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ProductDetailModal from './components/ProductDetailModal';

import Home from './pages/Home';
import Storefront from './pages/Storefront';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import FarmerDashboard from './pages/FarmerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleNavigate = (page, params = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Handle scroll-to anchors
    if (params.scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(params.scrollTo);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (currentPage !== 'storefront') {
      handleNavigate('storefront', { search: term });
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseProductModal = () => {
    setSelectedProduct(null);
  };

  // Build initialFilters for Storefront from pageParams
  const buildFilters = () => {
    const filters = {};
    if (pageParams.category) filters.category = pageParams.category;
    if (pageParams.search || searchTerm) filters.search = pageParams.search || searchTerm;
    if (pageParams.farmerId) filters.farmerId = pageParams.farmerId;
    if (pageParams.filter === 'featured') filters.featured = true;
    return filters;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-earth-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-farm-700 to-farm-500 flex items-center justify-center text-white mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <p className="text-farm-700 font-semibold">Loading FarmFresh Market...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} onSelectProduct={handleSelectProduct} />;
      case 'storefront':
        return (
          <Storefront
            onSelectProduct={handleSelectProduct}
            initialFilters={buildFilters()}
          />
        );
      case 'checkout':
        if (!user) {
          return <Login onNavigate={handleNavigate} redirectTo="checkout" />;
        }
        return <Checkout onNavigate={handleNavigate} />;
      case 'orders':
        if (!user) {
          return <Login onNavigate={handleNavigate} redirectTo="orders" />;
        }
        return <OrderHistory onNavigate={handleNavigate} />;
      case 'farmer-dashboard':
        if (!user || (user.role !== 'farmer' && user.role !== 'admin')) {
          return <Login onNavigate={handleNavigate} redirectTo="farmer-dashboard" />;
        }
        return <FarmerDashboard onNavigate={handleNavigate} />;
      case 'admin-dashboard':
        if (!user || user.role !== 'admin') {
          return <Login onNavigate={handleNavigate} redirectTo="admin-dashboard" />;
        }
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'login':
        return <Login onNavigate={handleNavigate} redirectTo={pageParams.redirectTo} />;
      case 'register':
        return <Register onNavigate={handleNavigate} defaultRole={pageParams.role} />;
      default:
        return <Home onNavigate={handleNavigate} onSelectProduct={handleSelectProduct} />;
    }
  };

  return (
    <div className="min-h-screen bg-earth-50/40 flex flex-col">
      <Navbar
        onNavigate={handleNavigate}
        currentPage={currentPage}
        onSearch={handleSearch}
      />

      <main className="flex-1">
        {renderPage()}
      </main>

      <Footer onNavigate={handleNavigate} />

      {/* Cart Drawer Overlay */}
      <CartDrawer onNavigate={handleNavigate} />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={handleCloseProductModal}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
