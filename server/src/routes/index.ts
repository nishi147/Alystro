import { Router } from 'express';
import authRoutes from './authRoutes.js';
import statsRoutes from './statsRoutes.js';
import schoolRoutes from './schoolRoutes.js';
import programRoutes from './programRoutes.js';
import studentRoutes from './studentRoutes.js';
import teacherRoutes from './teacherRoutes.js';
import batchRoutes from './batchRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import assignmentRoutes from './assignmentRoutes.js';
import quizRoutes from './quizRoutes.js';
import certificateRoutes from './certificateRoutes.js';
import crmRoutes from './crmRoutes.js';
import cmsRoutes from './cmsRoutes.js';
import noticeRoutes from './noticeRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import pricingRoutes from './pricingRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/stats', statsRoutes);
apiRouter.use('/schools', schoolRoutes);
apiRouter.use('/programs', programRoutes);
apiRouter.use('/students', studentRoutes);
apiRouter.use('/teachers', teacherRoutes);
apiRouter.use('/batches', batchRoutes);
apiRouter.use('/attendance', attendanceRoutes);
apiRouter.use('/assignments', assignmentRoutes);
apiRouter.use('/quizzes', quizRoutes);
apiRouter.use('/certificates', certificateRoutes);
apiRouter.use('/crm', crmRoutes);
apiRouter.use('/cms', cmsRoutes);
apiRouter.use('/notices', noticeRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/pricing', pricingRoutes);

export default apiRouter;
