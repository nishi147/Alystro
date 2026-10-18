import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  bulkImportStudents,
  updateStudent,
  deleteStudent,
  getMyStudentProfile,
  updateMyStudentProfile,
  getMyStudentBatch,
  getMyStudentCourse,
  getMyStudentClassroom,
  getMyStudentLiveClasses,
  getMyStudentRecordings,
  getMyStudentMaterials,
  getMyStudentProgress,
} from '../controllers/studentController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { enforceTenantIsolation } from '../middleware/tenant.js';

const router = Router();

// Student Portal Specific Routes (Must come before /:id)
router.get('/me/profile', authenticate, authorizeRoles('STUDENT'), getMyStudentProfile);
router.put('/me/profile', authenticate, authorizeRoles('STUDENT'), updateMyStudentProfile);
router.get('/me/batch', authenticate, authorizeRoles('STUDENT'), getMyStudentBatch);
router.get('/me/course', authenticate, authorizeRoles('STUDENT'), getMyStudentCourse);
router.get('/me/classroom', authenticate, authorizeRoles('STUDENT'), getMyStudentClassroom);
router.get('/me/live-classes', authenticate, authorizeRoles('STUDENT'), getMyStudentLiveClasses);
router.get('/me/recordings', authenticate, authorizeRoles('STUDENT'), getMyStudentRecordings);
router.get('/me/materials', authenticate, authorizeRoles('STUDENT'), getMyStudentMaterials);
router.get('/me/progress', authenticate, authorizeRoles('STUDENT'), getMyStudentProgress);

// General & Admin Student Routes
router.get('/', authenticate, enforceTenantIsolation, getStudents);
router.get('/:id', authenticate, getStudentById);
router.post('/', authenticate, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'), createStudent);
router.post('/bulk-import', authenticate, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), bulkImportStudents);
router.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'), updateStudent);
router.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), deleteStudent);

export default router;
