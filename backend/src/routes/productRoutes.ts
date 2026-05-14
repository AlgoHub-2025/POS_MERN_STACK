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

// Product CRUD routes
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// Analytics route
router.get('/analytics', getProductAnalytics);

export default router;
