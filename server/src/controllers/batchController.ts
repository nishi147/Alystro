import { Response } from 'express';
import { Batch } from '../models/Batch.js';
import { Teacher } from '../models/Teacher.js';
import { Student } from '../models/Student.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { validateClassroomUrl } from '../utils/validators.js';

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
      .populate('program', 'name category slug durationMonths googleClassroomUrl googleClassroomCode')
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
    const {
      name,
      programId,
      teacherId,
      grade,
      section = 'A',
      schedule,
      meetingLink,
      googleClassroomUrl,
      googleClassroomCode,
      classroomNumber,
      maxStudents,
    } = req.body;
    const schoolId = req.schoolId || req.body.schoolId;

    if (!schoolId) {
      res.status(400).json({ success: false, message: 'School identifier is required.' });
      return;
    }

    if (googleClassroomUrl) {
      const check = validateClassroomUrl(googleClassroomUrl);
      if (!check.isValid) {
        res.status(400).json({ success: false, message: check.error || 'Invalid Google Classroom URL.' });
        return;
      }
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
      meetingLink: meetingLink?.trim() || googleClassroomUrl?.trim() || undefined,
      googleClassroomUrl: googleClassroomUrl?.trim() || undefined,
      googleClassroomCode: googleClassroomCode?.trim() || undefined,
      classroomNumber: classroomNumber?.trim() || undefined,
      maxStudents: maxStudents || 40,
      status: 'ACTIVE',
    });

    if (teacherId) {
      await Teacher.findOneAndUpdate({ user: teacherId }, { $addToSet: { assignedBatches: batch._id } });
    }

    const populated = await Batch.findById(batch._id)
      .populate('program', 'name category slug durationMonths googleClassroomUrl googleClassroomCode')
      .populate('teacher', 'name email phone avatar')
      .populate('school', 'name code');

    res.status(201).json({ success: true, message: 'Batch created successfully.', data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateBatch(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      res.status(404).json({ success: false, message: 'Batch not found.' });
      return;
    }

    // Access control verification
    if (req.user?.role === 'SCHOOL_ADMIN') {
      if (batch.school.toString() !== req.schoolId?.toString()) {
        res.status(403).json({ success: false, message: 'Forbidden. You can only manage batches belonging to your school.' });
        return;
      }
    } else if (req.user?.role === 'TEACHER') {
      const isTeacherAssigned =
        batch.teacher?.toString() === req.user.userId ||
        (await Teacher.exists({ user: req.user.userId, assignedBatches: batch._id }));

      if (!isTeacherAssigned) {
        res.status(403).json({ success: false, message: 'Forbidden. You are not assigned to manage this batch.' });
        return;
      }
    }

    // If Google Classroom URL is being updated, validate it
    if (req.body.googleClassroomUrl !== undefined) {
      if (req.body.googleClassroomUrl && req.body.googleClassroomUrl.trim() !== '') {
        const check = validateClassroomUrl(req.body.googleClassroomUrl);
        if (!check.isValid) {
          res.status(400).json({ success: false, message: check.error || 'Invalid Google Classroom URL.' });
          return;
        }
        batch.googleClassroomUrl = req.body.googleClassroomUrl.trim();
        // Also keep meetingLink in sync if not explicitly different
        if (!req.body.meetingLink) {
          batch.meetingLink = req.body.googleClassroomUrl.trim();
        }
      } else {
        batch.googleClassroomUrl = undefined;
      }
    }

    if (req.body.googleClassroomCode !== undefined) {
      batch.googleClassroomCode = req.body.googleClassroomCode?.trim() || undefined;
    }

    if (req.body.meetingLink !== undefined) {
      batch.meetingLink = req.body.meetingLink?.trim() || undefined;
    }

    if (req.body.classroomNumber !== undefined) {
      batch.classroomNumber = req.body.classroomNumber?.trim() || undefined;
    }

    // School Admins and Super Admins can update administrative fields
    if (['SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'].includes(req.user?.role || '')) {
      if (req.body.name) batch.name = req.body.name.trim();
      if (req.body.grade) batch.grade = req.body.grade;
      if (req.body.section) batch.section = req.body.section;
      if (req.body.status) batch.status = req.body.status;
      if (req.body.maxStudents) batch.maxStudents = req.body.maxStudents;
      if (req.body.schedule) batch.schedule = req.body.schedule;
      if (req.body.teacherId) {
        batch.teacher = req.body.teacherId;
        await Teacher.findOneAndUpdate({ user: req.body.teacherId }, { $addToSet: { assignedBatches: batch._id } });
      }
      if (req.body.programId) batch.program = req.body.programId;
    }

    await batch.save();

    const populated = await Batch.findById(batch._id)
      .populate('program', 'name category slug durationMonths googleClassroomUrl googleClassroomCode')
      .populate('teacher', 'name email phone avatar')
      .populate('school', 'name code');

    res.json({ success: true, message: 'Batch updated successfully.', data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteBatch(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      res.status(404).json({ success: false, message: 'Batch not found.' });
      return;
    }

    if (
      ['SCHOOL_ADMIN'].includes(req.user?.role || '') &&
      batch.school.toString() !== req.schoolId?.toString()
    ) {
      res.status(403).json({ success: false, message: 'Forbidden.' });
      return;
    }

    // Unassign students and teacher
    await Student.updateMany({ batch: batch._id }, { $unset: { batch: '' } });
    if (batch.teacher) {
      await Teacher.findOneAndUpdate({ user: batch.teacher }, { $pull: { assignedBatches: batch._id } });
    }
    await Batch.findByIdAndDelete(batch._id);

    res.json({ success: true, message: 'Batch removed successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function assignStudentsToBatch(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { batchId } = req.params;
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds)) {
      res.status(400).json({ success: false, message: 'Array of studentIds is required.' });
      return;
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      res.status(404).json({ success: false, message: 'Batch not found.' });
      return;
    }

    await Student.updateMany({ _id: { $in: studentIds } }, { batch: batch._id });
    const count = await Student.countDocuments({ batch: batch._id, status: 'ACTIVE' });
    batch.currentStudentCount = count;
    await batch.save();

    res.json({
      success: true,
      message: `${studentIds.length} students assigned to batch successfully.`,
      data: { batch, count },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
