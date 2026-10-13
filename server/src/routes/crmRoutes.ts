import { Router } from 'express';
import {
  getLeads,
  createLead,
  updateLeadStatus,
  convertLeadToSchool,
} from '../controllers/crmController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Public lead submission for "Book a Free Demo" & "Partner With Your School" forms
router.post('/', createLead);

// Protected CRM routes
router.get('/', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN'), getLeads);
router.put('/:id/status', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN'), updateLeadStatus);
router.post('/:id/convert', authenticate, authorizeRoles('SUPER_ADMIN'), convertLeadToSchool);

export default router;
