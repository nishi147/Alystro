import { Router } from 'express';
import {
  getQuizzes,
  getQuizById,
  attemptQuiz,
  createQuiz,
  getQuizResults,
  deleteQuiz,
} from '../controllers/quizController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { enforceTenantIsolation } from '../middleware/tenant.js';

const router = Router();

router.get('/', authenticate, enforceTenantIsolation, getQuizzes);
router.post(
  '/',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN', 'TEACHER'),
  enforceTenantIsolation,
  createQuiz
);
router.get('/:id/results', authenticate, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'), getQuizResults);
router.get('/all/results', authenticate, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'), getQuizResults);
router.get('/:id', authenticate, getQuizById);
router.post('/:id/attempt', authenticate, authorizeRoles('STUDENT'), attemptQuiz);
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN', 'TEACHER'),
  deleteQuiz
);

export default router;
