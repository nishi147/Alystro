import { Router } from 'express';
import { getQuizzes, getQuizById, attemptQuiz } from '../controllers/quizController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { enforceTenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.get('/', authenticate, enforceTenantIsolation, getQuizzes);
router.get('/:id', authenticate, getQuizById);
router.post('/:id/attempt', authenticate, authorizeRoles('STUDENT'), attemptQuiz);

export default router;
