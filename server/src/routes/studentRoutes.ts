import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  bulkImportStudents,
  updateStudent,
} from '../controllers/studentController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { enforceTenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.get('/', authenticate, enforceTenantIsolation, getStudents);
router.get('/:id', authenticate, getStudentById);
router.post('/', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'), createStudent);
router.post('/bulk-import', authenticate, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), bulkImportStudents);
router.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'), updateStudent);

export default router;
