import { rest } from 'msw'

const API_BASE_URL = 'http://localhost:3001/api'

// Mock data
const mockProducts = [
  {
    id: '1',
    name: 'Espresso',
    price: 3.50,
    category: 'Coffee',
    image: '/products/espresso.jpg',
    inStock: true,
    sku: 'ESP001',
    cost: 1.20,
    tax: 0.28,
    barcode: '1234567890123',
    description: 'Rich and bold espresso shot',
    popularity: 95,
    tags: ['coffee', 'espresso', 'hot']
  },
  {
    id: '2',
    name: 'Cappuccino',
    price: 4.50,
    category: 'Coffee',
    image: '/products/cappuccino.jpg',
    inStock: true,
    sku: 'CAP001',
    cost: 1.80,
    tax: 0.36,
    barcode: '1234567890124',
    description: 'Smooth cappuccino with foam',
    popularity: 88,
    tags: ['coffee', 'cappuccino', 'milk']
  },
  {
    id: '3',
    name: 'Croissant',
    price: 2.75,
    category: 'Bakery',
    image: '/products/croissant.jpg',
    inStock: true,
    sku: 'CRO001',
    cost: 0.90,
    tax: 0.22,
    barcode: '1234567890125',
    description: 'Buttery French croissant',
    popularity: 76,
    tags: ['bakery', 'croissant', 'pastry']
  }
]

const mockCustomers = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    status: 'active',
    tier: 'gold',
    points: 1250,
    totalSpent: 2456.78,
    orderCount: 45,
    lastVisit: '2026-02-15T14:30:00Z',
    preferences: ['coffee', 'pastries'],
    notes: 'Regular morning customer'
  }
]

const mockEmployees = [
  {
    id: '1',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@algohub.com',
    position: 'Store Manager',
    department: 'Management',
    status: 'active',
    twoFactorEnabled: true,
    lastLogin: '2026-02-16T08:15:00Z',
    permissions: ['all'],
    hourlyRate: 25.00,
    monthlyHours: 160,
    salesMetrics: {
      totalSales: 15420.50,
      orderCount: 342,
      averageOrder: 45.12,
      upsellRate: 23.5
    }
  }
]

export const handlers = [
  // Products API
  rest.get(`${API_BASE_URL}/products`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockProducts,
        total: mockProducts.length
      })
    )
  }),

  rest.post(`${API_BASE_URL}/products`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: 'Product created successfully'
      })
    )
  }),

  // Customers API
  rest.get(`${API_BASE_URL}/customers`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockCustomers,
        total: mockCustomers.length
      })
    )
  }),

  rest.post(`${API_BASE_URL}/customers`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: 'Customer created successfully'
      })
    )
  }),

  // Employees API
  rest.get(`${API_BASE_URL}/employees`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockEmployees,
        total: mockEmployees.length
      })
    )
  }),

  // Authentication API
  rest.post(`${API_BASE_URL}/auth/login`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          user: {
            id: '1',
            email: 'admin@algohub.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin'
          },
          tokens: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            expiresIn: 3600
          }
        }
      })
    )
  }),

  rest.post(`${API_BASE_URL}/auth/refresh`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          accessToken: 'new-mock-access-token',
          expiresIn: 3600
        }
      })
    )
  }),

  // Analytics API
  rest.get(`${API_BASE_URL}/analytics/dashboard`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          totalSales: 89355.50,
          totalOrders: 658,
          averageOrderValue: 135.78,
          topProducts: mockProducts.slice(0, 5),
 salesByCategory: [
            { category: 'Coffee', amount: 45670.50, percentage: 51.1 },
            { category: 'Bakery', amount: 28450.75, percentage: 31.8 },
            { category: 'Other', amount: 15234.25, percentage: 17.1 }
          ],
          dailySales: [
            { date: '2026-02-16', sales: 2456.78 },
            { date: '2026-02-15', sales: 3234.56 },
            { date: '2026-02-14', sales: 2890.12 }
          ]
        }
      })
    )
  }),

  // Payment Processing API
  rest.post(`${API_BASE_URL}/payments/process`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          transactionId: 'txn_' + Date.now(),
          status: 'completed',
          amount: 45.50,
          paymentMethod: 'credit_card',
          timestamp: new Date().toISOString()
        }
      })
    )
  }),

  // Default handler for unmocked endpoints
  rest.all('*', (req, res, ctx) => {
    console.warn(`Unhandled request: ${req.method} ${req.url}`)
    return res(
      ctx.status(404),
      ctx.json({ error: 'Endpoint not mocked' })
    )
  })
]
