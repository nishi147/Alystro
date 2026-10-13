import { Router } from 'express';
import {
  getAttendance,
  markAttendance,
  getStudentAttendanceSummary,
} from '../controllers/attendanceController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { enforceTenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.get('/', authenticate, enforceTenantIsolation, getAttendance);
router.post(
  '/mark',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'),
  enforceTenantIsolation,
  markAttendance
);
router.get('/student/:studentId', authenticate, getStudentAttendanceSummary);

export default router;
