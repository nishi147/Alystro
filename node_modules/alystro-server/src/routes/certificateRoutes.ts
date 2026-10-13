import { Router } from 'express';
import {
  getCertificates,
  verifyCertificate,
  issueCertificate,
} from '../controllers/certificateController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { enforceTenantIsolation } from '../middleware/tenant.js';

const router = Router();

// Public verification endpoint
router.get('/verify/:certificateId', verifyCertificate);

// Protected routes
router.get('/', authenticate, enforceTenantIsolation, getCertificates);
router.post(
  '/issue',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'),
  enforceTenantIsolation,
  issueCertificate
);

export default router;
