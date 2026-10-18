import { Response } from 'express';
import { Teacher } from '../models/Teacher.js';
import { User } from '../models/User.js';
import { Batch } from '../models/Batch.js';
import { Student } from '../models/Student.js';
import { Attendance } from '../models/Attendance.js';
import { Assignment } from '../models/Assignment.js';
import { Submission } from '../models/Submission.js';
import { Quiz } from '../models/Quiz.js';
import { Result } from '../models/Result.js';
import { hashPassword } from '../utils/password.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { validateClassroomUrl } from '../utils/validators.js';

// ─── Helper: resolve Teacher doc from authenticated user ─────────────────────
async function resolveTeacher(userId: string) {
  const teacher = await Teacher.findOne({ user: userId });
  return teacher;
}

// ─── GET /teachers ────────────────────────────────────────────────────────────
export async function getTeachers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const query: any = {};
    if (['SCHOOL_ADMIN', 'TEACHER'].includes(req.user?.role || '')) {
      query.school = req.schoolId;
    } else if (req.query.schoolId) {
      query.school = req.query.schoolId;
    }

    const teachers = await Teacher.find(query)
      .populate('user', 'name email phone avatar status lastLogin')
      .populate('assignedBatches', 'name grade section meetingLink')
      .populate('school', 'name code');

    const formatted = teachers
      .filter((t) => t.user)
      .map((t: any) => ({
        _id: t._id,
        name: t.user?.name,
        email: t.user?.email,
        phone: t.user?.phone,
        avatar: t.user?.avatar,
        specialization: t.specialization,
        qualification: t.qualification,
        assignedBatches: t.assignedBatches,
        school: t.school,
        status: t.status,
      }));

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// ─── POST /teachers ───────────────────────────────────────────────────────────
export async function createTeacher(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { name, email, password = 'Teacher@123', phone, specialization, qualification, assignedBatches } =
      req.body;
    const schoolId = req.schoolId || req.body.schoolId;

    if (!schoolId) {
      res.status(400).json({ success: false, message: 'School identifier is required.' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'User with this email already exists.' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'TEACHER',
      school: schoolId,
      phone,
      status: 'ACTIVE',
    });

    const teacher = await Teacher.create({
      user: user._id,
      school: schoolId,
      specialization: specialization || ['AI & Smart Tools', 'Digital Skills'],
      qualification,
      assignedBatches: assignedBatches || [],
      status: 'ACTIVE',
    });

    res.status(201).json({
      success: true,
      message: 'Teacher account created with portal access.',
      data: teacher,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// ─── PUT /teachers/:id ────────────────────────────────────────────────────────
export async function updateTeacher(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      res.status(404).json({ success: false, message: 'Teacher record not found.' });
      return;
    }

    if (
      ['SCHOOL_ADMIN'].includes(req.user?.role || '') &&
      teacher.school.toString() !== req.schoolId?.toString()
    ) {
      res.status(403).json({ success: false, message: 'Forbidden: Cross-tenant modification denied.' });
      return;
    }

    const { name, phone, avatar, specialization, qualification, assignedBatches, status } = req.body;

    if (name || phone || avatar) {
      await User.findByIdAndUpdate(teacher.user, {
        ...(name && { name: name.trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(avatar && { avatar }),
      });
    }

    if (specialization) teacher.specialization = specialization;
    if (qualification) teacher.qualification = qualification;
    if (assignedBatches) teacher.assignedBatches = assignedBatches;
    if (status) teacher.status = status;

    await teacher.save();

    res.json({ success: true, message: 'Teacher details updated successfully.', data: teacher });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// ─── DELETE /teachers/:id ─────────────────────────────────────────────────────
export async function deleteTeacher(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      res.status(404).json({ success: false, message: 'Teacher not found.' });
      return;
    }

    if (
      ['SCHOOL_ADMIN'].includes(req.user?.role || '') &&
      teacher.school.toString() !== req.schoolId?.toString()
    ) {
      res.status(403).json({ success: false, message: 'Forbidden: Cross-tenant removal denied.' });
      return;
    }

    await User.findByIdAndUpdate(teacher.user, { status: 'INACTIVE' });
    await Teacher.findByIdAndDelete(teacher._id);

    res.json({ success: true, message: 'Teacher removed from school tenant.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TEACHER SELF-SERVICE ENDPOINTS (/teachers/me/*) ─────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─── GET /teachers/me/profile ─────────────────────────────────────────────────
export async function getMyTeacherProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const teacher = await Teacher.findOne({ user: req.user?.userId })
      .populate('user', 'name email phone avatar status createdAt')
      .populate('assignedBatches', 'name grade section status')
      .populate('school', 'name code city state');

    if (!teacher) {
      res.status(404).json({ success: false, message: 'Teacher profile not found.' });
      return;
    }

    const t: any = teacher;
    res.json({
      success: true,
      data: {
        _id: t._id,
        userId: t.user?._id,
        name: t.user?.name,
        email: t.user?.email,
        phone: t.user?.phone,
        avatar: t.user?.avatar,
        status: t.status,
        specialization: t.specialization,
        qualification: t.qualification,
        assignedBatches: t.assignedBatches,
        school: t.school,
        joinedAt: t.user?.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// ─── PUT /teachers/me/profile ─────────────────────────────────────────────────
export async function updateMyTeacherProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const teacher = await Teacher.findOne({ user: req.user?.userId });
    if (!teacher) {
      res.status(404).json({ success: false, message: 'Teacher profile not found.' });
      return;
    }

    // Permitted fields only
    const { avatar, phone, specialization, qualification } = req.body;

    await User.findByIdAndUpdate(req.user?.userId, {
      ...(avatar && { avatar }),
      ...(phone && { phone: phone.trim() }),
    });

    if (specialization && Array.isArray(specialization)) teacher.specialization = specialization;
    if (qualification) teacher.qualification = qualification.trim();

    await teacher.save();

    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// ─── GET /teachers/me/batches ─────────────────────────────────────────────────
export async function getMyTeacherBatches(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const batches = await Batch.find({ teacher: req.user?.userId })
      .populate('program', 'name category durationMonths mode googleClassroomUrl googleClassroomCode')
      .populate('school', 'name code')
      .sort({ createdAt: -1 });

    // Attach student count per batch
    const enriched = await Promise.all(
      batches.map(async (b: any) => {
        const studentCount = await Student.countDocuments({ batch: b._id });
        return { ...b.toObject(), studentCount };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// ─── PUT /teachers/me/batches/:batchId/classroom ──────────────────────────────
export async function updateMyTeacherBatchClassroom(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { batchId } = req.params;
    const { googleClassroomUrl, googleClassroomCode, meetingLink } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch) {
      res.status(404).json({ success: false, message: 'Batch not found.' });
      return;
    }

    // Access control: verify teacher is assigned to this batch
    const isAssigned =
      batch.teacher?.toString() === req.user?.userId ||
      (await Teacher.exists({ user: req.user?.userId, assignedBatches: batch._id }));

    if (!isAssigned) {
      res.status(403).json({ success: false, message: 'Forbidden. You are not assigned to manage this batch.' });
      return;
    }

    if (googleClassroomUrl !== undefined) {
      if (googleClassroomUrl && googleClassroomUrl.trim() !== '') {
        const check = validateClassroomUrl(googleClassroomUrl);
        if (!check.isValid) {
          res.status(400).json({ success: false, message: check.error || 'Invalid Google Classroom URL.' });
          return;
        }
        batch.googleClassroomUrl = googleClassroomUrl.trim();
        // Also keep meetingLink in sync
        batch.meetingLink = meetingLink?.trim() || googleClassroomUrl.trim();
      } else {
        batch.googleClassroomUrl = undefined;
        if (meetingLink) batch.meetingLink = meetingLink.trim();
      }
    }

    if (googleClassroomCode !== undefined) {
      batch.googleClassroomCode = googleClassroomCode?.trim() || undefined;
    }

    await batch.save();

    const populated = await Batch.findById(batch._id)
      .populate('program', 'name category durationMonths mode googleClassroomUrl googleClassroomCode')
      .populate('school', 'name code');

    const studentCount = await Student.countDocuments({ batch: batch._id });

    res.json({
      success: true,
      message: 'Google Classroom link saved successfully for batch.',
      data: { ...populated?.toObject(), studentCount },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// ─── GET /teachers/me/students ────────────────────────────────────────────────
export async function getMyTeacherStudents(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { batchId, search, page = 1, limit = 30 } = req.query;

    // Get teacher's batch IDs
    const myBatches = await Batch.find({ teacher: req.user?.userId }).select('_id');
    const batchIds = myBatches.map((b) => b._id);

    if (batchIds.length === 0) {
      res.json({ success: true, data: [], total: 0 });
      return;
    }

    const query: any = { batch: { $in: batchIds } };
    if (batchId && batchIds.some((id) => id.toString() === batchId)) {
      query.batch = batchId;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).select('_id');
      query.$or = [{ user: { $in: matchingUsers.map((u) => u._id) } }, { rollNumber: searchRegex }];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const [students, total] = await Promise.all([
      Student.find(query)
        .populate('user', 'name email phone avatar status')
        .populate('batch', 'name grade section')
        .populate('program', 'name category')
        .sort({ grade: 1, rollNumber: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Student.countDocuments(query),
    ]);

    const formatted = students
      .filter((s) => s.user)
      .map((s: any) => ({
        _id: s._id,
        userId: s.user?._id,
        name: s.user?.name,
        email: s.user?.email,
        phone: s.user?.phone,
        avatar: s.user?.avatar,
        rollNumber: s.rollNumber,
        grade: s.grade,
        section: s.section,
        batch: s.batch,
        program: s.program,
        attendanceRate: s.attendanceRate,
        completedAssignments: s.completedAssignments,
        totalScore: s.totalScore,
        status: s.status,
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        enrolledAt: s.enrolledAt,
      }));

    res.json({ success: true, data: formatted, total, page: pageNum, limit: limitNum });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// ─── GET /teachers/me/attendance ─────────────────────────────────────────────
export async function getMyTeacherAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { batchId, date, startDate, endDate } = req.query;

    const myBatches = await Batch.find({ teacher: req.user?.userId }).select('_id');
    const batchIds = myBatches.map((b) => b._id.toString());

    const query: any = { batch: { $in: batchIds } };
    if (batchId && batchIds.includes(batchId as string)) {
      query.batch = batchId;
    }

    if (date) {
      const d = new Date(date as string);
      d.setHours(0, 0, 0, 0);
      query.date = { $gte: d, $lte: new Date(d.getTime() + 86399999) };
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const records = await Attendance.find(query)
      .populate('batch', 'name grade section')
      .populate({
        path: 'records.student',
        populate: { path: 'user', select: 'name email avatar' },
      })
      .sort({ date: -1 })
      .limit(100);

    res.json({ success: true, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// ─── GET /teachers/me/assignments ─────────────────────────────────────────────
export async function getMyTeacherAssignments(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { batchId } = req.query;

    const myBatches = await Batch.find({ teacher: req.user?.userId }).select('_id');
    const batchIds = myBatches.map((b) => b._id);

    const query: any = { teacher: req.user?.userId };
    if (batchId && batchIds.some((id) => id.toString() === batchId)) {
      query.batch = batchId;
    }

    const assignments = await Assignment.find(query)
      .populate('batch', 'name grade section')
      .populate('program', 'name')
      .sort({ dueDate: 1 });

    // Attach submission counts
    const enriched = await Promise.all(
      assignments.map(async (a: any) => {
        const totalStudents = await Student.countDocuments({ batch: a.batch });
        const submittedCount = await Submission.countDocuments({ assignment: a._id });
        const gradedCount = await Submission.countDocuments({ assignment: a._id, status: 'GRADED' });
        return {
          ...a.toObject(),
          submittedCount,
          gradedCount,
          totalStudents,
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// ─── GET /teachers/me/quizzes ─────────────────────────────────────────────────
export async function getMyTeacherQuizzes(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const myBatches = await Batch.find({ teacher: req.user?.userId }).select('_id');
    const batchIds = myBatches.map((b) => b._id);

    const quizzes = await Quiz.find({ batch: { $in: batchIds } })
      .populate('batch', 'name grade section')
      .populate('program', 'name')
      .sort({ createdAt: -1 });

    const enriched = await Promise.all(
      quizzes.map(async (q: any) => {
        const attemptCount = await Result.countDocuments({ quiz: q._id });
        const passCount = await Result.countDocuments({ quiz: q._id, passed: true });
        return {
          ...q.toObject(),
          attemptCount,
          passCount,
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// ─── GET /teachers/me/progress ────────────────────────────────────────────────
export async function getMyTeacherProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { batchId } = req.query;

    const myBatches = await Batch.find({ teacher: req.user?.userId }).select('_id name grade section');
    const batchIds = myBatches.map((b) => b._id);

    const targetBatchIds = batchId ? [batchId] : batchIds;

    const students = await Student.find({ batch: { $in: targetBatchIds } })
      .populate('user', 'name avatar')
      .populate('batch', 'name grade section');

    const progressData = await Promise.all(
      students.map(async (s: any) => {
        // Attendance rate (already stored)
        const attRate = s.attendanceRate || 0;

        // Assignment completion rate
        const totalAssignments = await Assignment.countDocuments({ batch: s.batch });
        const submitted = await Submission.countDocuments({ student: s._id });
        const assignmentRate = totalAssignments > 0 ? Math.round((submitted / totalAssignments) * 100) : 0;

        // Quiz average
        const results = await Result.find({ student: s._id });
        const avgQuiz =
          results.length > 0
            ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
            : 0;

        const overall = Math.round((attRate * 0.35 + assignmentRate * 0.35 + avgQuiz * 0.3));

        return {
          studentId: s._id,
          name: s.user?.name,
          avatar: s.user?.avatar,
          rollNumber: s.rollNumber,
          grade: s.grade,
          batch: s.batch,
          attendanceRate: attRate,
          assignmentRate,
          avgQuiz,
          overall,
        };
      })
    );

    res.json({ success: true, data: progressData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// ─── GET /teachers/me/reports ─────────────────────────────────────────────────
export async function getMyTeacherReports(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { batchId, startDate, endDate } = req.query;

    const myBatches = await Batch.find({ teacher: req.user?.userId })
      .populate('program', 'name')
      .select('_id name grade section program');
    const batchIds = myBatches.map((b) => b._id);

    const targetIds = batchId ? [batchId] : batchIds;

    const dateQuery: any = {};
    if (startDate) dateQuery.$gte = new Date(startDate as string);
    if (endDate) dateQuery.$lte = new Date(endDate as string);

    // Batch summaries
    const batchReports = await Promise.all(
      myBatches
        .filter((b) => !batchId || b._id.toString() === batchId)
        .map(async (b: any) => {
          const totalStudents = await Student.countDocuments({ batch: b._id });
          const attendanceDocs = await Attendance.find({ batch: b._id, ...(Object.keys(dateQuery).length ? { date: dateQuery } : {}) });
          const totalSessions = attendanceDocs.length;
          const totalPresent = attendanceDocs.reduce((sum, att) => {
            return sum + att.records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
          }, 0);
          const totalPossible = totalSessions * totalStudents;
          const batchAttRate = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;

          const totalAssignments = await Assignment.countDocuments({ batch: b._id, teacher: req.user?.userId });
          const totalSubmissions = await Submission.countDocuments({ assignment: { $in: await Assignment.find({ batch: b._id }).select('_id').then((a) => a.map((x) => x._id)) } });
          const gradedSubmissions = await Submission.countDocuments({ status: 'GRADED', assignment: { $in: await Assignment.find({ batch: b._id }).select('_id').then((a) => a.map((x) => x._id)) } });

          const quizIds = await Quiz.find({ batch: b._id }).select('_id');
          const quizResults = await Result.find({ quiz: { $in: quizIds.map((q) => q._id) } });
          const avgQuizScore = quizResults.length > 0
            ? Math.round(quizResults.reduce((sum, r) => sum + r.percentage, 0) / quizResults.length)
            : 0;

          return {
            batchId: b._id,
            batchName: b.name,
            grade: b.grade,
            section: b.section,
            program: b.program?.name,
            totalStudents,
            totalSessions,
            batchAttRate,
            totalAssignments,
            totalSubmissions,
            gradedSubmissions,
            avgQuizScore,
          };
        })
    );

    res.json({ success: true, data: batchReports });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
