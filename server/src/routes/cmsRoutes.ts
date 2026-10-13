import { Router } from 'express';
import { getCMSByKey, getAllCMS, updateCMS } from '../controllers/cmsController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Public route to fetch CMS section data
router.get('/public/:key', getCMSByKey);

// Protected CMS admin routes
router.get('/', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN'), getAllCMS);
router.put('/:key', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN'), updateCMS);

export default router;
