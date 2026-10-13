import { Router } from 'express';
import {
  getPrograms,
  getProgramBySlug,
  createProgram,
  updateProgram,
} from '../controllers/programController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Public routes for catalog and details
router.get('/', getPrograms);
router.get('/:slug', getProgramBySlug);

// Admin routes
router.post('/', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN'), createProgram);
router.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN'), updateProgram);

export default router;
