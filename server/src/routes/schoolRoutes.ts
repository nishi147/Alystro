import { Router } from 'express';
import {
  getSchools,
  getSchoolBySlug,
  getSchoolById,
  createSchool,
  updateSchool,
  deleteSchool,
} from '../controllers/schoolController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { enforceTenantIsolation } from '../middleware/tenant.js';

const router = Router();

// Public route for school-specific landing page /schools/:slug
router.get('/public/:slug', getSchoolBySlug);

// Protected routes
router.get('/', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN'), getSchools);
router.get('/:id', authenticate, enforceTenantIsolation, getSchoolById);
router.post('/', authenticate, authorizeRoles('SUPER_ADMIN'), createSchool);
router.put('/:id', authenticate, enforceTenantIsolation, updateSchool);
router.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN'), deleteSchool);

export default router;
