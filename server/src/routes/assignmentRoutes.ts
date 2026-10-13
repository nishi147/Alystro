import { Router } from 'express';
import {
  getAssignments,
  createAssignment,
  submitAssignment,
  getSubmissions,
  gradeSubmission,
} from '../controllers/assignmentController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { enforceTenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.get('/', authenticate, enforceTenantIsolation, getAssignments);
router.post(
  '/',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'),
  enforceTenantIsolation,
  createAssignment
);
router.post('/:assignmentId/submit', authenticate, authorizeRoles('STUDENT'), submitAssignment);
router.get(
  '/:assignmentId/submissions',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'),
  getSubmissions
);
router.put(
  '/submissions/:submissionId/grade',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'),
  gradeSubmission
);

export default router;
