# AlgoHub POS — Full Project Documentation

> **Version:** 4.0.0  
> **Last Updated:** February 23, 2026  
> **Stack:** MongoDB · Express · React · Node.js (MERN)  
> **License:** Proprietary — AlgoHub SMC

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Getting Started](#4-getting-started)
5. [Backend Architecture](#5-backend-architecture)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Database Models](#7-database-models)
8. [API Reference](#8-api-reference)
9. [Authentication & Security](#9-authentication--security)
10. [State Management](#10-state-management)
11. [Pages & Features](#11-pages--features)
12. [Custom Hooks](#12-custom-hooks)
13. [Services Layer](#13-services-layer)
14. [AI & Advanced Features](#14-ai--advanced-features)
15. [Real-Time Features](#15-real-time-features)
16. [Progressive Web App (PWA)](#16-progressive-web-app-pwa)
17. [Testing](#17-testing)
18. [Deployment](#18-deployment)
19. [Environment Variables](#19-environment-variables)
20. [Troubleshooting](#20-troubleshooting)
21. [Roadmap](#21-roadmap)

---

## 1. Project Overview

**AlgoHub POS** is a full-featured, multi-tenant Point of Sale and Inventory Management system built with the MERN stack. It provides:

- 🛒 **POS Terminal** — Fast, real-time point-of-sale with dual themes (light + dark)
- 📦 **Inventory Management** — Real-time stock tracking with low-stock alerts
- 👥 **Customer Management** — Loyalty programs, tier systems, and CRM
- 👔 **Employee Management** — Scheduling, performance tracking, and payroll
- 📊 **Analytics & Reports** — AI-powered insights, revenue tracking, and trend analysis
- 💳 **Financial Processing** — Multi-gateway payment processing with audit trails
- 🔐 **Advanced Security** — JWT auth, 2FA, role-based access control (RBAC)
- 🤖 **AI Features** — Product recommendations, voice commands, camera-based scanning
- 🌐 **Multi-Tenant** — Isolated data per tenant with configurable branding

---

## 2. Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | ≥ 20.0.0 | Runtime |
| **Express** | 4.22.x | HTTP framework |
| **MongoDB** | 7.x | Primary database |
| **Mongoose** | 8.x | ODM for MongoDB |
| **TypeScript** | 5.3.x | Type safety |
| **JWT** | 9.x | Authentication tokens |
| **bcryptjs** | 2.4.x | Password hashing |
| **Socket.IO** | 4.6.x | Real-time communication |
| **Joi** | 17.x | Request validation (Joi routes) |
| **express-validator** | 7.3.x | Request validation (express-validator routes) |
| **Winston** | 3.11.x | Structured logging |
| **Helmet** | 7.x | Security headers |
| **Swagger** | 6.x / 5.x | API documentation |
| **Bull** | 4.16.x | Job queue (Redis-backed) |
| **Nodemailer** | 6.9.x | Email delivery |
| **Multer** | 1.4.x | File uploads |
| **Morgan** | 1.10.x | HTTP request logging |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.x | UI library |
| **Vite** | 5.x | Build tool & dev server |
| **TypeScript** | 5.3.x | Type safety |
| **TailwindCSS** | 3.4.x | Utility-first CSS |
| **Redux Toolkit** | 2.0.x | Global state management |
| **Redux Persist** | 6.x | State persistence across sessions |
| **React Router** | 6.21.x | Client-side routing |
| **React Query** | 5.17.x | Server state management |
| **Axios** | 1.6.x | HTTP client |
| **Lucide React** | 0.303.x | Icon library |
| **Framer Motion** | 10.x | Animations |
| **React Hook Form** | 7.48.x | Form handling |
| **Zod** | 3.22.x | Schema validation |
| **Recharts** | 2.15.x | Charting library |
| **Socket.IO Client** | 4.6.x | Real-time client |
| **date-fns** | 3.2.x | Date manipulation |
| **Vitest** | 1.x | Unit / integration testing |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-service orchestration |
| **Redis** | Caching, session store, job queue |
| **AWS S3** | Cloud storage for uploads |

---

## 3. Project Structure

```
POS_MERNSTACK/
├── backend/                       # Express API server
│   ├── src/
│   │   ├── app.ts                 # Express app class (middleware, routes, swagger)
│   │   ├── index.ts               # Server entry point
│   │   ├── config/
│   │   │   └── database.ts        # MongoDB connection manager
│   │   ├── controllers/           # Route controller logic
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT authentication middleware
│   │   │   ├── errorHandler.ts    # Global error handler
│   │   │   └── notFoundHandler.ts # 404 handler
│   │   ├── models/                # Mongoose schemas (19 models)
│   │   │   ├── User.ts            # User model with pre-save hashing
│   │   │   ├── Product.ts         # Product with isLowStock() & updateStock()
│   │   │   ├── Order.ts           # Order tracking
│   │   │   ├── Sale.ts            # Sales transactions
│   │   │   ├── Customer.ts        # Customer CRM data
│   │   │   ├── Employee.ts        # Employee profiles & schedules
│   │   │   ├── Inventory.ts       # Warehouse inventory items
│   │   │   ├── Role.ts            # RBAC roles
│   │   │   ├── Permission.ts      # Granular permissions
│   │   │   ├── Tenant.ts          # Multi-tenant configuration
│   │   │   ├── Account.ts         # Financial accounts
│   │   │   ├── Currency.ts        # Multi-currency support
│   │   │   ├── Expense.ts         # Expense tracking
│   │   │   ├── ExpenseCategory.ts # Expense categorization
│   │   │   ├── ExpensePolicy.ts   # Spending policies
│   │   │   ├── JournalEntry.ts    # Double-entry journal
│   │   │   ├── Purchase.ts        # Purchase orders
│   │   │   ├── CustomerAnalytics.ts # Customer behavior analytics
│   │   │   └── index.ts           # Model barrel export
│   │   ├── routes/
│   │   │   ├── auth.ts            # Authentication routes (full)
│   │   │   ├── productRoutes.ts   # Product CRUD
│   │   │   ├── customerRoutes.ts  # Customer endpoints
│   │   │   └── employeeRoutes.ts  # Employee endpoints
│   │   ├── services/              # Business logic (97 service files)
│   │   ├── types/                 # TypeScript type definitions
│   │   └── utils/
│   │       └── logger.ts          # Winston logger
│   ├── server.js                  # Simple JS server entry
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                      # React SPA
│   ├── src/
│   │   ├── App.tsx                # Root component & route definitions
│   │   ├── main.tsx               # React DOM entry & providers
│   │   ├── index.css              # Global CSS + design system + animations
│   │   ├── components/
│   │   │   ├── Layout.tsx         # App shell (sidebar + topnav + content)
│   │   │   ├── Sidebar.tsx        # Navigation sidebar (13 menu items)
│   │   │   ├── TopNav.tsx         # Header bar with search, notifications
│   │   │   ├── ProtectedRoute.tsx # Auth guard (Redux + localStorage)
│   │   │   ├── POS/               # POS terminal sub-components (8 files)
│   │   │   ├── ai/                # AI feature components (5 files)
│   │   │   ├── Voice/             # Voice command components (2 files)
│   │   │   ├── Accessibility/     # Skip links, keyboard nav
│   │   │   ├── Notifications/     # Notification center
│   │   │   ├── Theme/             # Theme provider
│   │   │   ├── PWA/               # PWA install prompt
│   │   │   ├── animations/        # Reusable animation components
│   │   │   └── ui/                # Shared UI primitives
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx  # Main dashboard with welcome banner
│   │   │   ├── auth/              # LoginPage, AdvancedAuthPage
│   │   │   ├── pos/               # POSTerminalPage, DarkModePOSDemo
│   │   │   ├── products/          # ProductsPage
│   │   │   ├── sales/             # SalesPage (transactions & KPIs)
│   │   │   ├── customers/         # CustomerManagementPage
│   │   │   ├── employees/         # EmployeeManagementPage
│   │   │   ├── inventory/         # InventoryPage
│   │   │   ├── payments/          # PaymentProcessingPage
│   │   │   ├── analytics/         # AnalyticsPage
│   │   │   ├── reports/           # ReportsPage
│   │   │   └── settings/          # SettingsPage (5 config tabs)
│   │   ├── store/
│   │   │   ├── index.ts           # Redux store setup (with persist)
│   │   │   └── slices/
│   │   │       ├── authSlice.ts   # Auth state & thunks
│   │   │       ├── tenantSlice.ts # Tenant state
│   │   │       └── uiSlice.ts     # UI state (sidebar, theme)
│   │   ├── services/
│   │   │   ├── api.ts             # Axios instance & interceptors
│   │   │   ├── authService.ts     # Auth API calls
│   │   │   ├── productService.ts  # Product API calls
│   │   │   ├── tenantService.ts   # Tenant API calls
│   │   │   ├── offlineStorage.ts  # IndexedDB offline support
│   │   │   ├── voiceRecognition.ts        # Web Speech API
│   │   │   ├── voiceCommandProcessor.ts   # NLP command parsing
│   │   │   └── vision/            # Computer vision services (6 files)
│   │   ├── hooks/                 # Custom React hooks (11 hooks)
│   │   ├── styles/
│   │   │   └── pos-dark-mode.css  # Dark POS theme overrides
│   │   ├── test/                  # Test utilities & setup
│   │   └── types/                 # Frontend type definitions
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── shared/
│   └── types/                     # Shared TypeScript types
│
├── docker-compose.yml             # Full Docker Compose setup
├── DOCUMENTATION.md               # ← This file
├── PAGES_AND_FEATURES.md          # Detailed feature breakdown
├── README.md                      # Quick start guide
└── package.json                   # Root workspace config
```

---

## 4. Getting Started

### Prerequisites

- **Node.js** ≥ 20.0.0
- **npm** ≥ 10.0.0
- **MongoDB** 7.x (local or Atlas)
- **Redis** (optional, for caching & job queues)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd POS_MERNSTACK

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running in Development

**Frontend (Vite dev server on port 3000):**

```bash
cd frontend
npm run dev
```

**Backend (Express server on port 3001):**

```bash
cd backend
npm run dev        # JavaScript entry (server.js)
npm run dev-ts     # TypeScript entry with nodemon (src/app.ts)
```

### Building for Production

```bash
# Frontend
cd frontend
npm run build      # Output: frontend/dist/

# Backend
cd backend
npm run build      # Compiles TypeScript to dist/
npm start          # Runs compiled JS
```

### Docker

```bash
# Start all services (MongoDB, Redis, Backend, Frontend)
docker-compose up -d
```

---

## 5. Backend Architecture

### Application Class (`app.ts`)

The backend uses a class-based Express application pattern:

```typescript
class App {
  public app: express.Application;
  public server: http.Server;
  public io: SocketIOServer;

  constructor() {
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSwagger();
    this.initializeErrorHandling();
    this.initializeSocketIO();
  }
}
```

### Middleware Pipeline

| Order | Middleware | Purpose |
|-------|-----------|---------|
| 1 | `helmet()` | Security headers (CSP, HSTS, etc.) |
| 2 | `cors()` | Cross-origin request handling |
| 3 | `compression()` | Response gzip compression |
| 4 | `express.json()` | JSON body parsing (10MB limit) |
| 5 | `express.urlencoded()` | URL-encoded body parsing |
| 6 | `morgan()` | HTTP request logging (via Winston) |
| 7 | `rateLimit()` | Rate limiting (100 req / 15 min per IP) |
| 8 | Auth middleware | JWT token verification (per route) |
| 9 | Error handler | Global error catching & formatting |

### Request Validation

The project uses **two validation approaches**:

1. **Joi** — Used for `register` and `login` routes:
   ```typescript
   const registerSchema = Joi.object({
     email: Joi.string().email().required(),
     password: Joi.string().min(6).required(),
     firstName: Joi.string().min(2).required(),
     lastName: Joi.string().min(2).required(),
     role: Joi.string().valid('admin', 'manager', 'cashier').optional()
   })
   ```

2. **express-validator** — Used for `refresh`, `logout`, `profile`, `change-password`, `forgot-password`, and `reset-password` routes:
   ```typescript
   const validateExpress = (req, res, next) => {
     const errors = validationResult(req)
     if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() })
     }
     next()
   }
   ```

### Logging

Winston logger with transports for:
- **Console** — Colorized output for development
- **File** — `logs/error.log` (errors only) and `logs/combined.log`
- **Morgan** integration for HTTP request logging

---

## 6. Frontend Architecture

### Entry Point (`main.tsx`)

```
React DOM → Redux Provider → Redux Persist → React Query → BrowserRouter → App
```

### Routing (`App.tsx`)

All routes are wrapped inside a `<Layout>` component (sidebar + topnav) and protected by `<ProtectedRoute>`.

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | `LoginPage` | Demo login (email/password) |
| `/register` | `RegisterPage` | Registration (placeholder) |
| `/dashboard` | `DashboardPage` | Welcome banner, KPIs, transactions, AI insights |
| `/pos` | `POSTerminalPage` | Light theme POS terminal |
| `/pos-dark` | `DarkModePOSDemo` | Dark theme POS terminal |
| `/products` | `ProductsPage` | Product catalog & management |
| `/sales` | `SalesPage` | Transaction history, payment breakdown |
| `/customers` | `CustomerManagementPage` | CRM with loyalty tiers |
| `/inventory` | `InventoryPage` | Stock levels & reorder management |
| `/employees` | `EmployeeManagementPage` | Staff, schedules, performance |
| `/reports` | `ReportsPage` | Sales trends, AI insights, top products |
| `/financial` | `PaymentProcessingPage` | Payment gateways & transaction analytics |
| `/analytics` | `AnalyticsPage` | Performance dashboards |
| `/security` | `AdvancedAuthPage` | User management, RBAC, 2FA |
| `/settings` | `SettingsPage` | Business profile, theme, notifications, integrations |

### Authentication Flow

```
LoginPage → localStorage.setItem('isAuthenticated', 'true')
          → localStorage.setItem('user', JSON.stringify({...}))
          → navigate('/dashboard')

ProtectedRoute checks:
  1. Redux state: state.auth.isAuthenticated
  2. Fallback: localStorage.getItem('isAuthenticated') === 'true'
  → If neither: redirect to /login
```

### Design System (`index.css`)

The CSS design system is built with TailwindCSS `@layer` directives:

**Components Layer:**
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-success`, `.btn-warning`, `.btn-error`, `.btn-ghost`
- `.card`, `.card-header`, `.card-body`, `.card-footer`
- `.badge`, `.badge-primary`, `.badge-success`, `.badge-warning`, `.badge-error`, `.badge-gray`
- `.table`, `.tablead`
- `.input`, `.input-error`
- `.modal-overlay`, `.modal-content`
- `.sidebar`, `.topnav`
- `.pos-terminal`, `.pos-button`
- `.receipt`, `.receipt-header`, `.receipt-item`, `.receipt-total`

**Utilities Layer:**
- `.animate-fade-in`, `.animate-slide-up`, `.animate-slide-down`, `.animate-scale-in`, `.animate-bounce-in`, `.animate-float`
- `.glass` — Glassmorphism effect
- `.gradient-text` — Gradient text via `bg-clip-text`
- `.hover-lift` — Elevation on hover
- `.card-hover` — Scale on hover
- `.scrollbar-hide` — Hidden scrollbar with scroll functionality

**Typography:**
- Primary: `Inter` (weights 300–800)
- Monospace: `JetBrains Mono` (for POS terminal, code)

---

## 7. Database Models

### Core Models

| Model | File | Key Fields | Purpose |
|-------|------|-----------|---------|
| **User** | `User.ts` | `email`, `password`, `firstName`, `lastName`, `role`, `isActive`, `tenantId` | User accounts with pre-save bcrypt hashing |
| **Product** | `Product.ts` | `name`, `sku`, `price`, `category`, `reorderLevel` | Product catalog with `isLowStock()` and `updateStock()` methods |
| **Order** | `Order.ts` | `customer`, `items[]`, `total`, `status`, `paymentMethod` | Order tracking with line items |
| **Sale** | `Sale.ts` | `orderId`, `total`, `tax`, `discount`, `paymentDetails` | Completed sale transactions |
| **Customer** | `Customer.ts` | `name`, `email`, `phone`, `loyaltyPoints`, `tier`, `purchaseHistory` | CRM and loyalty management |
| **Employee** | `Employee.ts` | `user`, `position`, `department`, `schedule`, `performanceScore` | Staff management and scheduling |
| **Inventory** | `Inventory.ts` | `product`, `warehouse`, `quantity`, `availableQuantity`, `status` | Warehouse-level stock tracking |
| **Tenant** | `Tenant.ts` | `name`, `domain`, `settings`, `isActive` | Multi-tenant isolation |

### Access Control Models

| Model | File | Key Fields | Purpose |
|-------|------|-----------|---------|
| **Role** | `Role.ts` | `name`, `description`, `permissions[]`, `tenantId` | RBAC role definitions |
| **Permission** | `Permission.ts` | `name`, `module`, `action`, compound index on `[module, action]` | Granular permission units |

### Financial Models

| Model | File | Key Fields | Purpose |
|-------|------|-----------|---------|
| **Account** | `Account.ts` | `name`, `type`, `balance`, `currency` | Chart of accounts |
| **Currency** | `Currency.ts` | `code`, `name`, `symbol`, `exchangeRate` | Multi-currency support |
| **Expense** | `Expense.ts` | `amount`, `category`, `vendor`, `approver` | Expense tracking |
| **ExpenseCategory** | `ExpenseCategory.ts` | `name`, `budget`, `parent` | Category hierarchy |
| **ExpensePolicy** | `ExpensePolicy.ts` | `rules`, `limits`, `approvalChain` | Spending policies |
| **JournalEntry** | `JournalEntry.ts` | `debit`, `credit`, `account`, `amount` | Double-entry bookkeeping |
| **Purchase** | `Purchase.ts` | `supplier`, `items[]`, `total`, `status` | Purchase orders |
| **CustomerAnalytics** | `CustomerAnalytics.ts` | `customerId`, `visitFrequency`, `avgOrderValue` | Behavioral analytics |

### Product Model — Key Methods

```typescript
// Check if product stock is below reorder level
productSchema.methods.isLowStock = async function(): Promise<boolean> {
  const InventoryItem = mongoose.model('Inventory')
  const inventoryItems = await InventoryItem.find({ product: this._id, status: 'active' })
  const totalStock = inventoryItems.reduce((sum, item) => sum + (item.availableQuantity || 0), 0)
  return totalStock <= this.reorderLevel
}

// Update product stock across inventory
productSchema.methods.updateStock = async function(quantityChange: number): Promise<void> {
  const InventoryItem = mongoose.model('Inventory')
  const item = await InventoryItem.findOne({ product: this._id, status: 'active' })
  if (item) {
    item.quantity += quantityChange
    item.availableQuantity += quantityChange
    await item.save()
  }
}
```

---

## 8. API Reference

### Base URL

```
Development: http://localhost:3001/api
Production:  https://api.algohub.com/api
Swagger UI:  http://localhost:3001/api-docs
```

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health, uptime, DB status |
| `GET` | `/api` | API version info |

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Validation | Description |
|--------|----------|------|------------|-------------|
| `POST` | `/register` | ❌ | Joi | Create a new user account |
| `POST` | `/login` | ❌ | Joi | Authenticate and receive JWT tokens |
| `POST` | `/refresh` | ❌ | express-validator | Refresh access token using refresh token |
| `POST` | `/logout` | ❌ | express-validator | Invalidate refresh token |
| `GET` | `/me` | ✅ | — | Get current user profile |
| `PUT` | `/profile` | ✅ | express-validator | Update user profile |
| `PUT` | `/change-password` | ✅ | express-validator | Change current password |
| `POST` | `/forgot-password` | ❌ | express-validator | Request password reset email |
| `POST` | `/reset-password` | ❌ | express-validator | Reset password with token |

### Products (`/api/products`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ✅ | List all products |
| `POST` | `/` | ✅ | Create a product |

### Customers (`/api/customers`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ✅ | List customers |
| `POST` | `/` | ✅ | Create customer |

### Employees (`/api/employees`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ✅ | List employees |
| `POST` | `/` | ✅ | Create employee |

### Response Format

```json
{
  "message": "Operation successful",
  "data": { ... },
  "tokens": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

### Error Response

```json
{
  "message": "Error description",
  "errors": [
    {
      "type": "field",
      "msg": "Validation message",
      "path": "fieldName",
      "location": "body"
    }
  ]
}
```

---

## 9. Authentication & Security

### JWT Token System

| Token | Secret | Expiry | Purpose |
|-------|--------|--------|---------|
| **Access Token** | `JWT_SECRET` | 15 minutes | API request authentication |
| **Refresh Token** | `JWT_REFRESH_SECRET` | 7 days | Access token renewal |

### Password Security

- **Hashing:** bcryptjs with 10 salt rounds
- **Pre-save hook:** `User.ts` model automatically hashes passwords before save
- **No double-hashing:** The register route passes the raw password; the model hook handles hashing once

```typescript
// User.ts pre-save hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})
```

### Auth Middleware (`middleware/auth.ts`)

```typescript
// Verifies JWT access token from Authorization header
// Attaches decoded user info to req.user
// Returns 401 for missing/invalid tokens
```

### Role-Based Access Control (RBAC)

| Role | Default Permissions |
|------|-------------------|
| **Super Admin** | `all` — Full system access |
| **Manager** | `manage_inventory`, `manage_employees`, `view_reports`, `process_sales` |
| **Cashier** | `process_sales`, `view_products` |
| **Viewer** | `view_reports`, `view_analytics` |

### Security Headers (Helmet)

- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy

### Rate Limiting

- **Window:** 15 minutes (configurable via `RATE_LIMIT_WINDOW_MS`)
- **Max requests:** 100 per IP (configurable via `RATE_LIMIT_MAX_REQUESTS`)
- **Scope:** All `/api/` routes

---

## 10. State Management

### Redux Store Structure

```typescript
interface RootState {
  auth: {
    user: User | null
    tokens: { accessToken: string; refreshToken: string } | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
  }
  tenant: {
    currentTenant: Tenant | null
    tenants: Tenant[]
    isLoading: boolean
  }
  ui: {
    sidebarOpen: boolean
    theme: 'light' | 'dark' | 'system'
    notifications: Notification[]
  }
}
```

### Redux Slices

| Slice | File | Key Actions |
|-------|------|-------------|
| **authSlice** | `authSlice.ts` | `login`, `register`, `logout`, `refreshToken`, `fetchCurrentUser` |
| **tenantSlice** | `tenantSlice.ts` | `setCurrentTenant`, `fetchTenants`, `createTenant` |
| **uiSlice** | `uiSlice.ts` | `toggleSidebar`, `setTheme`, `addNotification`, `clearNotifications` |

### Redux Persist

- Persisted to `localStorage`
- Whitelisted slices: `auth`, `ui`, `tenant`
- Auto-rehydrated on app load

---

## 11. Pages & Features

### Dashboard (`/dashboard`)

- **Welcome banner** with dynamic greeting (Morning/Afternoon/Evening)
- **4 KPI cards:** Total Revenue, Orders, Customers, Avg Order Value
- **Recent Transactions table** with status badges
- **Low Stock Alerts** with reorder buttons
- **AI Insights panel** with peak hours and best sellers

### POS Terminal (`/pos`, `/pos-dark`)

- **Product grid** with category filters and stock indicators
- **Quick Add sidebar** for frequently ordered items
- **Shopping cart** with quantity controls and real-time total
- **Payment modal** with cash/card/digital options
- **AI upsell suggestions** (dark mode version)
- **Voice command** integration
- **Camera-based** product scanning

### Sales (`/sales`)

- **4 KPI cards:** Revenue, Orders, Avg Order Value, Refunds
- **Transaction table** with search, status filter, payment filter
- **Payment method breakdown** (Card, Cash, Digital)
- **Time period selector** (Today, Week, Month)
- **Export functionality**

### Products (`/products`)

- **Product catalog table** with SKU, category, price, stock
- **Low Stock highlighting** (yellow indicators)
- **Import/Export** buttons
- **Add Product** action
- **Summary cards:** Total Products, Low Stock Items, Total Value

### Customers (`/customers`)

- **Customer cards** with loyalty tier badges (Bronze, Silver, Gold, Platinum)
- **Loyalty Program overview** with tier benefits
- **CRM filters:** Search, tier, status
- **Customer stats:** Total spent, orders, loyalty points, member since
- **Bulk actions:** Email, export

### Employees (`/employees`)

- **3 tab views:** Employees, Schedule, Performance
- **Employee cards** with performance scores and attendance rates
- **Shift scheduling table**
- **Performance metrics** with progress bars and trend indicators
- **Department and status filters**

### Inventory (`/inventory`)

- **Inventory summary cards** (Low Stock count, Total Value)
- **Inventory table** with SKU, category, stock levels, min/max, value
- **Status indicators:** In Stock, Low Stock, Out of Stock
- **Category and status filters**
- **Add Item / Export** actions

### Reports (`/reports`)

- **Period selector** with 7 days, 30 days, 90 days, 1 year
- **4 KPI cards** matching dashboard metrics
- **Sales Trends chart** with Revenue/Orders toggle
- **AI Insights** with actionable suggestions
- **Top Products table** with trend indicators
- **Quick Stats:** Avg Daily Sales, Peak Day, Growth Rate

### Financial (`/financial`)

- **Metric cards:** Transactions, Success Rate, Net Revenue
- **Payment provider list** with active/inactive status
- **Sub-tabs:** Transactions, Analytics, Settings
- **Gateway management**

### Analytics (`/analytics`)

- **Performance cards:** Total Sales, Orders, Customers, Avg Order Value
- **Growth indicators** with percentage changes
- **Time period tabs:** Today, Week, Month, Year
- **Hourly Sales chart**

### Security (`/security`)

- **4 tabs:** Users, Roles, 2FA, Security
- **User management table** with role, status, 2FA toggle
- **Role cards** with permission lists (system vs custom)
- **2FA setup:** QR code + backup codes
- **Security settings:** Password policy, session management, login lockout

### Settings (`/settings`)

- **5 tab sidebar:** Business Profile, Appearance, Notifications, Integrations, System
- **Business Profile:** Store name, contact info, logo upload, timezone, currency, tax rate
- **Appearance:** Light/Dark/System theme, accent colors, display options
- **Notifications:** Email, push, SMS toggles with granular controls
- **Integrations:** Stripe, Twilio, SendGrid, AWS S3, Google Maps
- **System:** Version info, backup management, storage usage visualization

---

## 12. Custom Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useAIRecommendations` | `useAIRecommendations.ts` | AI-powered product recommendations based on cart/history |
| `useCamera` | `useCamera.ts` | Camera access for barcode/product scanning |
| `useDarkMode` | `useDarkMode.ts` | Dark mode toggle with system preference detection |
| `useKeyboardNavigation` | `useKeyboardNavigation.ts` | Keyboard shortcuts for POS operations |
| `useNotifications` | `useNotifications.ts` | Push notification management |
| `usePWA` | `usePWA.ts` | PWA install prompt and service worker |
| `useProductDetection` | `useProductDetection.ts` | Camera-based product identification |
| `useScanOptimizer` | `useScanOptimizer.ts` | Barcode scan processing and optimization |
| `useSocket` | `useSocket.ts` | Socket.IO connection management |
| `useVisualRecognition` | `useVisualRecognition.ts` | Computer vision product recognition |
| `useVoiceSearch` | `useVoiceSearch.ts` | Voice-based product search |

---

## 13. Services Layer

### Frontend Services

| Service | File | Purpose |
|---------|------|---------|
| **API Client** | `api.ts` | Axios instance with interceptors, base URL config, auth header injection |
| **Auth Service** | `authService.ts` | Login, register, refresh, logout API calls |
| **Product Service** | `productService.ts` | Product CRUD with fallback data for demo mode |
| **Tenant Service** | `tenantService.ts` | Tenant CRUD and switching |
| **Offline Storage** | `offlineStorage.ts` | IndexedDB-based offline data persistence |
| **Voice Recognition** | `voiceRecognition.ts` | Web Speech API wrapper |
| **Voice Processor** | `voiceCommandProcessor.ts` | NLP-based command parsing |
| **Vision Services** | `vision/` | 6 files for computer vision product detection |

### API Client Configuration

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor: attaches Bearer token
// Response interceptor: auto-refreshes expired tokens
```

---

## 14. AI & Advanced Features

### AI Product Recommendations

- Context-aware suggestions based on current cart
- Purchase history analysis for upselling
- Time-of-day based popular items
- Complementary product pairing

### Voice Commands

- **Web Speech API** integration for real-time voice recognition
- **Natural Language Processing** for command parsing
- Supported commands:
  - "Add [product] to cart"
  - "Remove [product]"
  - "Search for [query]"
  - "Checkout" / "Pay"
  - "Clear cart"

### Computer Vision

- Camera-based product scanning
- Barcode recognition
- Visual product identification
- Real-time detection overlay

---

## 15. Real-Time Features

### Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connection` | Client → Server | Initial socket connection |
| `join-tenant` | Client → Server | Join tenant-specific room |
| `join-warehouse` | Client → Server | Join warehouse room for stock updates |
| `disconnect` | Client → Server | Socket disconnection |
| `stock-update` | Server → Client | Real-time inventory change broadcast |
| `order-update` | Server → Client | New order notification |

### Configuration

```typescript
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})
```

---

## 16. Progressive Web App (PWA)

- **Service Worker** via `vite-plugin-pwa`
- **Offline support** using IndexedDB for data caching
- **Install prompt** for mobile/desktop
- **Manifest** with icons and theme colors
- **Workbox** strategies for asset caching

---

## 17. Testing

### Frontend Testing

```bash
npm run test              # Run unit tests (Vitest)
npm run test:integration  # Run integration tests
npm run test:ui           # Open Vitest UI
npm run test:coverage     # Generate coverage report
```

- **Framework:** Vitest + Testing Library
- **Mocking:** MSW (Mock Service Worker) for API mocking
- **DOM:** jsdom

### Backend Testing

```bash
npm run test              # Run tests (Jest)
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

- **Framework:** Jest + Supertest
- **Mocking:** ts-jest for TypeScript support

---

## 18. Deployment

### Docker Compose Services

```yaml
services:
  mongodb:      # MongoDB 7.x
  redis:        # Redis for caching
  backend:      # Express API (port 3001)
  frontend:     # Vite/Nginx (port 3000)
```

### Production Build

1. **Frontend:** `npm run build` → outputs `dist/` (serve via Nginx or CDN)
2. **Backend:** `npm run build` → compiles TypeScript to `dist/` → `npm start`
3. **Database:** MongoDB Atlas or self-hosted
4. **Reverse Proxy:** Nginx recommended for SSL termination

### Environment Setup

1. Copy `.env.example` to `.env`
2. Set `JWT_SECRET` and `JWT_REFRESH_SECRET` (strong random strings)
3. Configure `MONGODB_URI`
4. Set `CORS_ORIGIN` to frontend URL
5. Configure `REDIS_URL` if using Redis

---

## 19. Environment Variables

### Backend (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `MONGODB_URI` | `mongodb://localhost:27017/algohub-pos` | MongoDB connection string |
| `JWT_SECRET` | — | **Required.** Access token secret |
| `JWT_REFRESH_SECRET` | — | **Required.** Refresh token secret |
| `JWT_ACCESS_EXPIRATION` | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRATION` | `7d` | Refresh token TTL |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed CORS origin |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |
| `REDIS_URL` | — | Redis connection URL |
| `SMTP_HOST` | — | Email server host |
| `SMTP_PORT` | — | Email server port |
| `SMTP_USER` | — | Email username |
| `SMTP_PASS` | — | Email password |
| `AWS_ACCESS_KEY_ID` | — | AWS S3 access key |
| `AWS_SECRET_ACCESS_KEY` | — | AWS S3 secret key |
| `AWS_S3_BUCKET` | — | S3 bucket name |

### Frontend (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3001/api` | Backend API base URL |
| `VITE_SOCKET_URL` | `http://localhost:3001` | WebSocket server URL |

---

## 20. Troubleshooting

### Common Issues

**1. Frontend not loading after login**
- Check that both `localStorage.isAuthenticated` and Redux `auth.isAuthenticated` are being set
- The `ProtectedRoute` checks both: Redux state first, then localStorage fallback

**2. "API returned invalid response, using fallback data"**
- This is expected behavior in demo mode — the frontend falls back to mock data when the backend is not connected
- Connect the backend server to suppress these warnings

**3. Pages show infinite loading spinner**
- The mock data loads after a 1-second `setTimeout` delay
- If using a browser testing tool, wait ≥ 2 seconds before capturing screenshots

**4. TypeScript errors on build**
- Run `npm run type-check` to see all type errors
- Known pre-existing warnings exist in `ai/` and `POS/` components (unused variables)
- These do not affect runtime

**5. Port already in use**
```bash
# Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**6. MongoDB connection failure**
- Ensure MongoDB is running: `mongosh` or `mongod --dbpath <path>`
- Verify `MONGODB_URI` in `.env`

---

## 21. Roadmap

### ✅ Completed

- [x] Core MERN stack architecture
- [x] JWT authentication with refresh tokens
- [x] Multi-tenant data isolation
- [x] POS Terminal (light + dark themes)
- [x] Product, Customer, Employee management
- [x] Inventory tracking with low-stock alerts
- [x] Sales, Financial, Analytics dashboards
- [x] Reports with AI insights
- [x] Settings page (business, theme, notifications, integrations, system)
- [x] Role-based access control (RBAC)
- [x] 2FA support (UI)
- [x] Voice command integration
- [x] Camera-based product scanning
- [x] PWA support with offline storage
- [x] Real-time Socket.IO events
- [x] Docker Compose orchestration

### 🔜 Planned

- [ ] Full backend API for all CRUD operations
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Email notification system (SendGrid)
- [ ] Advanced reporting with PDF export
- [ ] Multi-location/warehouse management
- [ ] Supplier management module
- [ ] Customer-facing display
- [ ] Receipt printing integration
- [ ] Barcode label generation
- [ ] Mobile app (React Native)

---

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- **TypeScript** throughout (strict mode)
- **ESLint** for linting (`npm run lint`)
- **Prettier** formatting (pending setup)
- **Conventional Commits** for commit messages

---

## License

**Proprietary** — AlgoHub SMC. All rights reserved.

---

> *Generated on February 23, 2026 — AlgoHub POS v4.0.0*
