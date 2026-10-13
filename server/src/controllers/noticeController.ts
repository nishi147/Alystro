import { Response } from 'express';
import { Notice } from '../models/Notice.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getNotices(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const query: any = {};
    if (req.schoolId) {
      query.school = req.schoolId;
    }

    if (req.user?.role === 'STUDENT') {
      query.targetRole = { $in: ['ALL', 'STUDENT'] };
    } else if (req.user?.role === 'TEACHER') {
      query.targetRole = { $in: ['ALL', 'TEACHER'] };
    }

    const notices = await Notice.find(query)
      .populate('postedBy', 'name role')
      .sort({ pinned: -1, createdAt: -1 });

    res.json({ success: true, data: notices });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createNotice(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { title, content, category, targetRole, pinned } = req.body;
    const schoolId = req.schoolId;

    if (!schoolId) {
      res.status(400).json({ success: false, message: 'School identifier is required.' });
      return;
    }

    const notice = await Notice.create({
      school: schoolId,
      title,
      content,
      category: category || 'ANNOUNCEMENT',
      targetRole: targetRole || 'ALL',
      postedBy: req.user?.userId,
      pinned: pinned || false,
    });

    res.status(201).json({ success: true, message: 'Notice posted.', data: notice });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
