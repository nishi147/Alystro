import { Router } from 'express';
import { getBatches, createBatch, updateBatch } from '../controllers/batchController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { enforceTenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.get('/', authenticate, enforceTenantIsolation, getBatches);
router.post('/', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'), createBatch);
router.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN', 'TEACHER'), updateBatch);

export default router;
