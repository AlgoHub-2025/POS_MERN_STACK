import express from 'express';
import request from 'supertest';
import productRoutes from '../routes/productRoutes';
import { Product } from '../models/Product';

jest.mock('../middleware/auth', () => ({
  authMiddleware: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    req.user = {
      userId: 'user-1',
      id: 'user-1',
      email: 'admin@example.com',
      role: 'admin',
      tenantId: '64f000000000000000000001',
    };
    next();
  },
}));

jest.mock('../models/Product', () => ({
  Product: {
    find: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/products', productRoutes);
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ success: false, message: err.message });
});

describe('product routes tenant isolation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('scopes product listing by authenticated tenant', async () => {
    const chain = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    };
    (Product.find as jest.Mock).mockReturnValue(chain);
    (Product.countDocuments as jest.Mock).mockResolvedValue(0);

    const response = await request(app).get('/products');

    expect(response.status).toBe(200);
    expect(Product.find).toHaveBeenCalledWith({
      tenantId: '64f000000000000000000001',
      isActive: true,
    });
    expect(response.body).toMatchObject({
      success: true,
      products: [],
      pagination: { page: 1, limit: 50, total: 0, pages: 0 },
    });
  });

  it('rejects client-supplied tenantId during product creation', async () => {
    const response = await request(app)
      .post('/products')
      .send({
        tenantId: '64f000000000000000000099',
        name: 'Latte',
        sku: 'LATTE-1',
        price: 4,
      });

    expect(response.status).toBe(400);
    expect(Product.create).not.toHaveBeenCalled();
  });

  it('scopes updates by authenticated tenant', async () => {
    (Product.findOneAndUpdate as jest.Mock).mockResolvedValue({
      _id: 'product-1',
      tenantId: '64f000000000000000000001',
      name: 'Latte',
    });

    const response = await request(app)
      .put('/products/product-1')
      .send({ price: 4.5 });

    expect(response.status).toBe(200);
    expect(Product.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'product-1', tenantId: '64f000000000000000000001' },
      { price: 4.5 },
      { new: true, runValidators: true }
    );
  });
});
