# 🌿 FarmFresh Market — Full-Stack E-Commerce Platform

> **Direct Farm-to-Table Marketplace Connecting Local Farmers with Consumers**

FarmFresh Market empowers rural farmers to list their fresh harvests (Vegetables, Fruits, Dry Fruits, Dry Products) at fair prices without middlemen. Consumers discover nutrient-rich seasonal produce, meet verified growers, and enjoy instant checkout and end-to-end order tracking.

---

## 🚀 Key Features

### 🛒 Consumer Experience
- **Interactive Storefront**: Real-time search, multi-faceted filtering (Category tabs, Farm Location dropdown, 100% Organic toggle, Featured specials), and price/name sorting.
- **Product Details**: High-resolution imagery, stock meters, harvest dates, farmer credentials, and quantity steppers.
- **Cart & Slide Drawer**: Dynamic cart state, auto-calculated tiered shipping (Free delivery on orders ₹500+), and local storage persistence.
- **Simulated Payment Sandbox**: Razorpay / Stripe test checkout flow with instant verification and order confirmations.
- **Order Tracking**: Step-by-step 5-stage progress timeline (`Pending` ➔ `Confirmed` ➔ `Packed` ➔ `Dispatched` ➔ `Delivered`) with self-serve order cancellation.

### 🌾 Farmer Dashboard
- **Real-Time Metrics**: Total revenue earned (₹), active harvest catalog count, incoming orders count, and pending fulfillments.
- **Inventory Management**: Add, update, and manage stock/pricing with presets or custom image uploads (`/uploads/`).
- **Fulfillment Center**: Live order status updating with cascading order updates.
- **Farm Profile**: Showcase farm story, geographical location, and verified badges.

### 🛡️ Admin Panel
- **Platform Analytics**: Gross Merchandise Value (GMV), total users, farmer vs. customer distribution, and total volume.
- **Farmer Verification**: One-click vetting and verification toggle for agricultural sellers.
- **Global Order Management**: Real-time order monitoring and status overrides across all vendors.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy 2.0 (Async), SQLite / aiosqlite (or PostgreSQL via asyncpg), Pydantic v2, Python-Jose (JWT), Bcrypt |
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Lucide React Icons |
| **Storage & Media** | Local disk uploads (`/uploads/`), StaticFiles mounting |
| **DevOps** | Docker, Docker Compose, Windows Batch & PowerShell automated scripts |

---

## ⚡ Quick Start

### Option 1: One-Click Startup (Windows)

Double-click `start.bat` or run in PowerShell:
```powershell
.\start.ps1
```

---

### Option 2: Manual Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
Backend will be live at `http://localhost:8000` with Swagger documentation at `http://localhost:8000/docs`.

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

### Option 3: Docker Compose
```bash
docker-compose up --build
```

---

## 🔑 Demo Accounts

All pre-seeded demo accounts share the password: **`Pass123!`**

| Role | Email | Highlights |
|---|---|---|
| 🛡️ **Admin** | `admin@farmfresh.com` | Full oversight, platform revenue & farmer vetting |
| 🌾 **Farmer** | `farmer.ramesh@farmfresh.com` | Patil Organic Farm (Nashik) — Vegetables, Mangoes, Ghee |
| 🌾 **Farmer** | `farmer.anita@farmfresh.com` | Himalayan Harvest (Shimla) — Apples, Strawberries, Saffron |
| 🛒 **Customer** | `customer@example.com` | Preloaded with sample orders and delivery tracking |

---

## 📁 Project Architecture

```
FarmFreshMarket/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI routers (auth, products, orders, farmer, admin, payment)
│   │   ├── models/       # SQLAlchemy 2.0 async database models
│   │   ├── schemas/      # Pydantic v2 validation schemas
│   │   ├── utils/        # JWT security & comprehensive database seeding
│   │   ├── config.py     # App settings & CORS configuration
│   │   ├── database.py   # Async engine & session factories
│   │   └── main.py       # FastAPI initialization & lifecycle handlers
│   ├── tests/            # API integration & smoke tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, Footer, HeroBanner, ProductCard, CartDrawer, etc.
│   │   ├── context/      # AuthContext & CartContext
│   │   ├── pages/        # Home, Storefront, Checkout, OrderHistory, Dashboards, Auth
│   │   ├── services/     # Unified API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── docker-compose.yml
├── start.bat
├── start.ps1
└── README.md
```

---

## 📄 License
This project is open-source under the MIT License.
