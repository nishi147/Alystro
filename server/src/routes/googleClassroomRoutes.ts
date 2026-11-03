import { Router } from 'express';
import {
  getGoogleClassrooms,
  getGoogleClassroomById,
  createGoogleClassroom,
  updateGoogleClassroom,
  updateGoogleClassroomStatus,
  deleteGoogleClassroom,
  getTeacherGoogleClassrooms,
  requestClassroomUpdate,
  getStudentGoogleClassrooms,
} from '../controllers/googleClassroomController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Student-specific endpoint (requires authentication & active student)
router.get(
  '/student',
  authenticate,
  authorizeRoles('STUDENT', 'SUPER_ADMIN'),
  getStudentGoogleClassrooms
);

// Teacher-specific endpoint (requires authentication & teacher role)
router.get(
  '/teacher',
  authenticate,
  authorizeRoles('TEACHER', 'SUPER_ADMIN', 'ADMIN'),
  getTeacherGoogleClassrooms
);

// Teacher request update endpoint
router.post(
  '/:id/request-update',
  authenticate,
  authorizeRoles('TEACHER', 'SUPER_ADMIN'),
  requestClassroomUpdate
);

// Admin listing endpoint
router.get(
  '/',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'),
  getGoogleClassrooms
);

// Admin creation endpoint
router.post(
  '/',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'),
  createGoogleClassroom
);

// Detail endpoint with student roster
router.get(
  '/:id',
  authenticate,
  getGoogleClassroomById
);

// Admin update endpoint
router.put(
  '/:id',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'),
  updateGoogleClassroom
);

// Admin status toggle endpoint
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'),
  updateGoogleClassroomStatus
);

// Admin delete endpoint
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'),
  deleteGoogleClassroom
);

export default router;

