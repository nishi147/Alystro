import { Router } from 'express';
import {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getMyTeacherProfile,
  updateMyTeacherProfile,
  getMyTeacherBatches,
  updateMyTeacherBatchClassroom,
  getMyTeacherStudents,
  getMyTeacherAttendance,
  getMyTeacherAssignments,
  getMyTeacherQuizzes,
  getMyTeacherProgress,
  getMyTeacherReports,
} from '../controllers/teacherController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { enforceTenantIsolation } from '../middleware/tenant.js';

const router = Router();

// ─── Teacher self-service (must come before /:id) ─────────────────────────────
router.get('/me/profile', authenticate, authorizeRoles('TEACHER'), getMyTeacherProfile);
router.put('/me/profile', authenticate, authorizeRoles('TEACHER'), updateMyTeacherProfile);
router.get('/me/batches', authenticate, authorizeRoles('TEACHER'), getMyTeacherBatches);
router.put('/me/batches/:batchId/classroom', authenticate, authorizeRoles('TEACHER'), updateMyTeacherBatchClassroom);
router.get('/me/students', authenticate, authorizeRoles('TEACHER'), getMyTeacherStudents);
router.get('/me/attendance', authenticate, authorizeRoles('TEACHER'), getMyTeacherAttendance);
router.get('/me/assignments', authenticate, authorizeRoles('TEACHER'), getMyTeacherAssignments);
router.get('/me/quizzes', authenticate, authorizeRoles('TEACHER'), getMyTeacherQuizzes);
router.get('/me/progress', authenticate, authorizeRoles('TEACHER'), getMyTeacherProgress);
router.get('/me/reports', authenticate, authorizeRoles('TEACHER'), getMyTeacherReports);

// ─── School admin / Super admin CRUD ─────────────────────────────────────────
router.get('/', authenticate, enforceTenantIsolation, getTeachers);
router.post('/', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'), createTeacher);
router.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'), updateTeacher);
router.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), deleteTeacher);

export default router;
