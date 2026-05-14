import { Router } from 'express';
import {
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  searchEmployees,
  addPerformanceReview,
  addTrainingRecord,
  addTimeOffRequest,
  approveTimeOffRequest,
  rejectTimeOffRequest,
  updateSkill,
  getEmployeesByDepartment,
  getEmployeesByManager,
  getActiveEmployees,
  importEmployees,
  exportEmployees,
  getEmployeeAnalytics,
  updatePerformanceMetrics,
  getEmployeeDirectory,
  getUpcomingBirthdays,
  getWorkAnniversaries,
  getPerformanceReviews,
  getTrainingRecords,
  getTimeOffRequests,
  upload
} from '../controllers/employeeController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Basic CRUD operations
router.post('/', createEmployee);
router.get('/', searchEmployees);
router.get('/analytics', getEmployeeAnalytics);
router.get('/directory', getEmployeeDirectory);
router.get('/birthdays', getUpcomingBirthdays);
router.get('/anniversaries', getWorkAnniversaries);
router.get('/active', getActiveEmployees);
router.get('/export', exportEmployees);
router.post('/import', upload.single('file'), importEmployees);
router.get('/:employeeId', getEmployee);
router.put('/:employeeId', updateEmployee);
router.delete('/:employeeId', deleteEmployee);

// Performance and reviews
router.post('/:employeeId/performance-reviews', addPerformanceReview);
router.get('/:employeeId/performance-reviews', getPerformanceReviews);
router.put('/:employeeId/performance-metrics', updatePerformanceMetrics);

// Training and development
router.post('/:employeeId/training-records', addTrainingRecord);
router.get('/:employeeId/training-records', getTrainingRecords);

// Time off management
router.post('/:employeeId/time-off-requests', addTimeOffRequest);
router.get('/:employeeId/time-off-requests', getTimeOffRequests);
router.put('/:employeeId/time-off-requests/:requestId/approve', approveTimeOffRequest);
router.put('/:employeeId/time-off-requests/:requestId/reject', rejectTimeOffRequest);

// Skills management
router.put('/:employeeId/skills', updateSkill);

// Department and manager based queries
router.get('/department/:department', getEmployeesByDepartment);
router.get('/manager/:managerId', getEmployeesByManager);

export default router;
