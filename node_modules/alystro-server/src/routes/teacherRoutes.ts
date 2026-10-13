import { Router } from 'express';
import { getTeachers, createTeacher } from '../controllers/teacherController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { enforceTenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.get('/', authenticate, enforceTenantIsolation, getTeachers);
router.post('/', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'), createTeacher);

export default router;
