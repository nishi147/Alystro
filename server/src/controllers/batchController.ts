import { Response } from 'express';
import { Batch } from '../models/Batch.js';
import { Teacher } from '../models/Teacher.js';
import { Student } from '../models/Student.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getBatches(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const query: any = {};

    if (['SCHOOL_ADMIN'].includes(req.user?.role || '')) {
      query.school = req.schoolId;
    } else if (req.user?.role === 'TEACHER') {
      query.school = req.schoolId;
      // Filter batches where teacher is assigned
      query.teacher = req.user.userId;
    } else if (req.user?.role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user.userId });
      if (student?.batch) {
        query._id = student.batch;
      }
    } else if (req.query.schoolId) {
      query.school = req.query.schoolId;
    }

    const batches = await Batch.find(query)
      .populate('program', 'name category slug durationMonths')
      .populate('teacher', 'name email phone avatar')
      .populate('school', 'name code')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: batches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createBatch(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { name, programId, teacherId, grade, section = 'A', schedule, meetingLink, maxStudents } =
      req.body;
    const schoolId = req.schoolId || req.body.schoolId;

    if (!schoolId) {
      res.status(400).json({ success: false, message: 'School identifier is required.' });
      return;
    }

    const batch = await Batch.create({
      name,
      school: schoolId,
      program: programId,
      teacher: teacherId || undefined,
      grade,
      section,
      schedule: schedule || [
        { dayOfWeek: 'Monday', startTime: '16:00', endTime: '16:45' },
        { dayOfWeek: 'Wednesday', startTime: '16:00', endTime: '16:45' },
        { dayOfWeek: 'Friday', startTime: '16:00', endTime: '16:45' },
      ],
      meetingLink: meetingLink || 'https://meet.google.com/aly-live-session',
      maxStudents: maxStudents || 40,
      status: 'ACTIVE',
    });

    if (teacherId) {
      await Teacher.findOneAndUpdate({ user: teacherId }, { $addToSet: { assignedBatches: batch._id } });
    }

    res.status(201).json({ success: true, message: 'Batch created successfully.', data: batch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateBatch(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!batch) {
      res.status(404).json({ success: false, message: 'Batch not found.' });
      return;
    }
    res.json({ success: true, message: 'Batch updated successfully.', data: batch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
