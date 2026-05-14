import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple auth routes
app.post('/api/auth/register', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Registration endpoint' });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Login endpoint', token: 'dummy-token' });
});

// Products routes
app.get('/api/products', (req: Request, res: Response) => {
  res.json([
    { _id: '1', name: 'Espresso', price: 3.50, stock: 50, category: 'Beverages', status: 'active', inStock: true },
    { _id: '2', name: 'Latte', price: 4.00, stock: 30, category: 'Beverages', status: 'active', inStock: true },
    { _id: '3', name: 'Croissant', price: 2.25, stock: 20, category: 'Bakery', status: 'active', inStock: true },
    { _id: '4', name: 'Muffin', price: 2.75, stock: 45, category: 'Bakery', status: 'active', inStock: true },
    { _id: '5', name: 'Cappuccino', price: 3.75, stock: 15, category: 'Beverages', status: 'active', inStock: true },
  ]);
});

// ADD MISSING ANALYTICS ENDPOINT
app.get('/api/products/analytics', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalProducts: 45,
      totalValue: 1250.75,
      lowStockCount: 3,
      outOfStockCount: 1,
      topCategories: [
        { name: 'Beverages', count: 15, value: 450.50 },
        { name: 'Bakery', count: 12, value: 275.25 },
      ]
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
});
