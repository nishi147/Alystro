import { Router } from 'express';
import {
  getSchools,
  getSchoolBySlug,
  getSchoolById,
  createSchool,
  updateSchool,
  deleteSchool,
  addSchoolClass,
  removeSchoolClass,
  getMySchoolProfile,
} from '../controllers/schoolController.js';
import {
  getPublicSchoolsList,
  getSchoolApplications,
  getSchoolApplicationById,
  approveSchoolApplication,
  rejectSchoolApplication,
  requestMoreInfoApplication,
  getAffiliationRequests,
  approveAffiliation,
  rejectAffiliation,
} from '../controllers/approvalController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { enforceTenantIsolation } from '../middleware/tenant.js';

const router = Router();

// Public routes (must precede param routes like /:id)
router.get('/public-list', getPublicSchoolsList);
router.get('/public/:slug', getSchoolBySlug);

// School Applications (Super Admin / Admin)
router.get('/applications', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN'), getSchoolApplications);
router.get('/applications/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN'), getSchoolApplicationById);
router.post('/applications/:id/approve', authenticate, authorizeRoles('SUPER_ADMIN'), approveSchoolApplication);
router.post('/applications/:id/reject', authenticate, authorizeRoles('SUPER_ADMIN'), rejectSchoolApplication);
router.post('/applications/:id/request-info', authenticate, authorizeRoles('SUPER_ADMIN'), requestMoreInfoApplication);

// Affiliations & Enrollment Requests (School Admin / Super Admin)
router.get('/affiliations/requests', authenticate, authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN', 'ADMIN'), getAffiliationRequests);
router.post('/affiliations/:id/approve', authenticate, authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN', 'ADMIN'), approveAffiliation);
router.post('/affiliations/:id/reject', authenticate, authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN', 'ADMIN'), rejectAffiliation);

// Classes Management
router.post('/classes/add', authenticate, authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), addSchoolClass);
router.post('/classes/remove', authenticate, authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'), removeSchoolClass);

// Standard School Management routes
router.get('/', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN'), getSchools);
router.get('/profile/me', authenticate, enforceTenantIsolation, getMySchoolProfile);
router.get('/:id', authenticate, enforceTenantIsolation, getSchoolById);
router.post('/', authenticate, authorizeRoles('SUPER_ADMIN'), createSchool);
router.put('/:id', authenticate, enforceTenantIsolation, updateSchool);
router.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN'), deleteSchool);

export default router;
