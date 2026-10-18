import { Router } from 'express';
import { getNotices, createNotice, deleteNotice } from '../controllers/noticeController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { enforceTenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.get('/', authenticate, enforceTenantIsolation, getNotices);
router.post(
  '/',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'),
  enforceTenantIsolation,
  createNotice
);
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'),
  deleteNotice
);

export default router;
