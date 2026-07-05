import { Router } from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController';
import { getProductAnalytics } from '../controllers/productAnalyticsController';

const router = Router();

// Specific routes must be registered before parameterized routes.
router.get('/analytics', getProductAnalytics);

// Product CRUD routes
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
