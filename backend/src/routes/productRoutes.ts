import { Router } from 'express';
import { z } from 'zod';
import {
  bulkUpdateProducts,
  createProduct,
  deleteProduct,
  exportProducts,
  getProductById,
  getProducts,
  importProducts,
  updateProduct,
  updateProductStock,
} from '../controllers/productController';
import { getProductAnalytics } from '../controllers/productAnalyticsController';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();
router.use(authMiddleware);

const productBaseSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  sku: z.string().min(1).max(100),
  barcode: z.string().optional(),
  categoryId: z.string().optional(),
  unit: z.enum(['pcs', 'kg', 'liter', 'meter', 'box', 'dozen']),
  cost: z.number().min(0),
  price: z.number().min(0),
  taxRate: z.number().min(0).max(100),
  reorderLevel: z.number().min(0).optional(),
  reorderQuantity: z.number().min(1).optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
}).strict();

const productBodySchema = productBaseSchema.extend({
  unit: z.enum(['pcs', 'kg', 'liter', 'meter', 'box', 'dozen']).default('pcs'),
  cost: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(100).default(0),
});

const productUpdateSchema = productBaseSchema.partial().strict();

const stockSchema = z.object({
  stock: z.number().min(0),
}).strict();

const bulkUpdateSchema = z.object({
  updates: z.array(z.object({
    id: z.string().min(1),
    data: productUpdateSchema,
  })).min(1).max(100),
}).strict();

router.get('/analytics', getProductAnalytics);
router.patch('/bulk', validateBody(bulkUpdateSchema), bulkUpdateProducts);
router.post('/import', importProducts);
router.get('/export', exportProducts);
router.patch('/:id/stock', validateBody(stockSchema), updateProductStock);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', validateBody(productBodySchema), createProduct);
router.put('/:id', validateBody(productUpdateSchema), updateProduct);
router.delete('/:id', deleteProduct);

export default router;
