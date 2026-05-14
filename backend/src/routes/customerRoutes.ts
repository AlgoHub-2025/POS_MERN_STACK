import { Router } from 'express';
import {
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  addCommunication,
  addNote,
  uploadDocument,
  importCustomers,
  exportCustomers,
  findDuplicates,
  mergeCustomers,
  getCustomerAnalytics,
  addToSegment,
  removeFromSegment,
  updateTags,
  getCommunicationHistory,
  getCustomerNotes,
  upload
} from '../controllers/customerController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Basic CRUD operations
router.post('/', createCustomer);
router.get('/', searchCustomers);
router.get('/analytics', getCustomerAnalytics);
router.get('/duplicates', findDuplicates);
router.get('/export', exportCustomers);
router.post('/import', upload.single('file'), importCustomers);
router.post('/merge', mergeCustomers);
router.get('/:customerId', getCustomer);
router.put('/:customerId', updateCustomer);
router.delete('/:customerId', deleteCustomer);

// Communication and notes
router.post('/:customerId/communications', addCommunication);
router.get('/:customerId/communications', getCommunicationHistory);
router.post('/:customerId/notes', addNote);
router.get('/:customerId/notes', getCustomerNotes);

// Document management
router.post('/:customerId/documents', uploadDocument);

// Segmentation
router.post('/:customerId/segments', addToSegment);
router.delete('/:customerId/segments/:segmentId', removeFromSegment);

// Tag management
router.put('/:customerId/tags', updateTags);

export default router;
