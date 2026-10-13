import { Router } from 'express';
import { login, getCurrentUser, logout, forgotPassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', forgotPassword);

export default router;
