import { Router } from 'express';
import {
  login,
  getCurrentUser,
  getMyStatus,
  registerSchool,
  registerTeacher,
  registerStudent,
  logout,
  forgotPassword,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public auth endpoints
router.post('/login', login);
router.post('/register/school', registerSchool);
router.post('/register/teacher', registerTeacher);
router.post('/register/student', registerStudent);
router.post('/forgot-password', forgotPassword);

// Authenticated session & status endpoints (accessible to pending/active users)
router.get('/me', authenticate, getCurrentUser);
router.get('/my-status', authenticate, getMyStatus);
router.post('/logout', authenticate, logout);

export default router;
