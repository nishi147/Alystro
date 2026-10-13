import { Router } from 'express';
import { getSuperAdminStats, getSchoolAdminStats } from '../controllers/statsController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { enforceTenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.get('/super-admin', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN'), getSuperAdminStats);
router.get('/school', authenticate, enforceTenantIsolation, getSchoolAdminStats);

export default router;
