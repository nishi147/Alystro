import { Router } from 'express';
import {
  getAdminProgramPricing,
  updateAdminProgramPricing,
  updateAdminPartnershipBenefits,
  getAdminSchoolCommercials,
  updateAdminSchoolCommercials,
  getSchoolMyTerms,
} from '../controllers/pricingController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// =========================================================================
// 1. ADMIN PRICING & COMMERCIAL MANAGEMENT
// Strictly restricted to SUPER_ADMIN & ADMIN
// =========================================================================
router.get(
  '/admin/programs',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'ADMIN'),
  getAdminProgramPricing
);

router.put(
  '/admin/programs/:id',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'ADMIN'),
  updateAdminProgramPricing
);

router.put(
  '/admin/benefits',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'ADMIN'),
  updateAdminPartnershipBenefits
);

router.get(
  '/admin/schools',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'ADMIN'),
  getAdminSchoolCommercials
);

router.put(
  '/admin/schools/:schoolId',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'ADMIN'),
  updateAdminSchoolCommercials
);

// =========================================================================
// 2. SCHOOL TENANT COMMERCIAL TERMS & BILLING
// Strictly restricted to authenticated SCHOOL_ADMIN (and SUPER_ADMIN viewing)
// Single-tenant isolation enforced on server
// =========================================================================
router.get(
  '/school/my-terms',
  authenticate,
  authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'),
  getSchoolMyTerms
);

export default router;
