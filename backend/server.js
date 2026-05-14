const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let users = [];
let nextId = 1;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  const existingUser = users.find(u => u.email === email);
  if (existingUser) return res.status(409).json({ message: 'User exists' });
  
  const user = { id: nextId++, email, password, firstName, lastName, role: 'cashier' };
  users.push(user);
  res.json({ success: true, token: 'dummy-token', user: { ...user, password: undefined } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ success: true, token: 'dummy-token', user: { ...user, password: undefined } });
});

// Products routes
app.get('/api/products', (req, res) => {
  res.json([
    { _id: '1', name: 'Espresso', price: 3.50, stock: 50, category: 'Beverages', status: 'active', inStock: true },
    { _id: '2', name: 'Latte', price: 4.00, stock: 30, category: 'Beverages', status: 'active', inStock: true },
    { _id: '3', name: 'Croissant', price: 2.25, stock: 20, category: 'Bakery', status: 'active', inStock: true },
    { _id: '4', name: 'Muffin', price: 2.75, stock: 45, category: 'Bakery', status: 'active', inStock: true },
    { _id: '5', name: 'Cappuccino', price: 3.75, stock: 15, category: 'Beverages', status: 'active', inStock: true },
  ]);
});

// Analytics endpoint (FIXES 404 ERROR)
app.get('/api/products/analytics', (req, res) => {
  res.json({
    success: true,
    data: {
      totalProducts: 45,
      totalValue: 1250.75,
      lowStockCount: 3,
      outOfStockCount: 1,
      topCategories: [
        { name: 'Beverages', count: 15, value: 450.50 },
        { name: 'Bakery', count: 12, value: 275.25 }
      ]
    }
  });
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
