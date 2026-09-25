const API_BASE = 'http://127.0.0.1:8000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('farmfresh_token');
  const headers = { ...options.headers };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle json payload unless FormData is sent
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.detail || 'An unexpected error occurred';
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }

  return data;
}

export const api = {
  // Auth
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  getMe: () => request('/auth/me'),
  updateProfile: (profileData) => request('/auth/me', { method: 'PUT', body: profileData }),
  getFarmers: () => request('/auth/farmers'),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/products${queryString}`);
  },
  getCategories: () => request('/products/categories'),
  getFeaturedProducts: () => request('/products/featured'),
  getProductById: (id) => request(`/products/${id}`),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/products/upload-image', { method: 'POST', body: formData });
  },

  // Orders
  createOrder: (orderData) => request('/orders', { method: 'POST', body: orderData }),
  getMyOrders: () => request('/orders'),
  getOrderById: (orderId) => request(`/orders/${orderId}`),
  cancelOrder: (orderId) => request(`/orders/${orderId}/cancel`, { method: 'PATCH' }),

  // Farmer Dashboard
  getFarmerDashboard: () => request('/farmer/dashboard'),
  getFarmerProducts: () => request('/farmer/products'),
  createFarmerProduct: (productData) => request('/farmer/products', { method: 'POST', body: productData }),
  updateFarmerProduct: (id, productData) => request(`/farmer/products/${id}`, { method: 'PUT', body: productData }),
  deleteFarmerProduct: (id) => request(`/farmer/products/${id}`, { method: 'DELETE' }),
  getFarmerOrders: () => request('/farmer/orders'),
  updateFarmerItemStatus: (itemId, status) =>
    request(`/farmer/orders/${itemId}/status`, { method: 'PATCH', body: { status } }),

  // Admin
  getAdminDashboard: () => request('/admin/dashboard'),
  getAdminFarmers: () => request('/admin/farmers'),
  toggleFarmerVerify: (farmerId) => request(`/admin/farmers/${farmerId}/verify`, { method: 'PATCH' }),
  getAdminOrders: () => request('/admin/orders'),
  updateAdminOrderStatus: (orderId, status) =>
    request(`/admin/orders/${orderId}/status`, { method: 'PATCH', body: { status } }),

  // Payment Simulation
  initiatePayment: (orderId, gateway = 'razorpay', amount) =>
    request('/payment/initiate', { method: 'POST', body: { order_id: orderId, gateway, amount } }),
  verifyPayment: (orderId, gateway, transactionId, status = 'success') =>
    request('/payment/verify', {
      method: 'POST',
      body: { order_id: orderId, gateway, transaction_id: transactionId, status },
    }),
};
