import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { GoogleClassroom } from '../models/GoogleClassroom.js';
import { School } from '../models/School.js';
import { Program } from '../models/Program.js';
import { Batch } from '../models/Batch.js';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { validateStrictGoogleClassroomUrl } from '../utils/validators.js';

// ─── GET /api/google-classrooms (Admin / School Admin) ────────────────────────
export async function getGoogleClassrooms(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { schoolId, courseId, batchId, status, search, page = 1, limit = 50 } = req.query;

    const query: any = {};

    // Role-based scoping: School Admins can only view classrooms for their assigned school
    if (req.user?.role === 'SCHOOL_ADMIN') {
      if (!req.schoolId) {
        res.status(403).json({ success: false, message: 'No school affiliated with this school administrator.' });
        return;
      }
      query.school = req.schoolId;
    } else if (schoolId) {
      if (!mongoose.Types.ObjectId.isValid(schoolId as string)) {
        res.status(400).json({ success: false, message: 'Invalid school ID.' });
        return;
      }
      query.school = schoolId;
    }

    if (courseId) {
      if (!mongoose.Types.ObjectId.isValid(courseId as string)) {
        res.status(400).json({ success: false, message: 'Invalid course ID.' });
        return;
      }
      query.course = courseId;
    }

    if (batchId) {
      if (!mongoose.Types.ObjectId.isValid(batchId as string)) {
        res.status(400).json({ success: false, message: 'Invalid batch ID.' });
        return;
      }
      query.batch = batchId;
    }

    if (status && (status === 'ACTIVE' || status === 'INACTIVE')) {
      query.status = status;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const term = search.trim();
      query.$or = [
        { classroomName: { $regex: term, $options: 'i' } },
        { instructions: { $regex: term, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [classrooms, total] = await Promise.all([
      GoogleClassroom.find(query)
        .populate('school', 'name code city state logo')
        .populate('course', 'name slug category gradeLevel durationMonths banner')
        .populate('batch', 'name grade section schedule startDate currentStudentCount maxStudents')
        .populate('teacher', 'name email phone avatar')
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      GoogleClassroom.countDocuments(query),
    ]);

    // Enrich each classroom with active student count
    const enriched = await Promise.all(
      classrooms.map(async (c) => {
        const studentCount = await Student.countDocuments({
          batch: c.batch?._id || c.batch,
          status: 'ACTIVE',
        });
        const obj = c.toObject();
        return {
          ...obj,
          studentCount,
        };
      })
    );

    res.json({
      success: true,
      data: enriched,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch Google Classrooms.' });
  }
}

// ─── GET /api/google-classrooms/:id (Details with Roster) ──────────────────────
export async function getGoogleClassroomById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid classroom ID.' });
      return;
    }

    const classroom = await GoogleClassroom.findById(id)
      .populate('school', 'name code city state logo')
      .populate('course', 'name slug category gradeLevel durationMonths features syllabus')
      .populate('batch', 'name grade section schedule startDate currentStudentCount maxStudents meetingLink')
      .populate('teacher', 'name email phone avatar')
      .populate('createdBy', 'name email role')
      .populate('updateRequest.requestedBy', 'name email phone');

    if (!classroom) {
      res.status(404).json({ success: false, message: 'Google Classroom not found.' });
      return;
    }

    // Role-based access check
    if (req.user?.role === 'SCHOOL_ADMIN') {
      const schoolId = (classroom.school as any)?._id?.toString() || classroom.school?.toString();
      if (schoolId !== req.schoolId) {
        res.status(403).json({ success: false, message: 'Access denied: Classroom belongs to another school.' });
        return;
      }
    } else if (req.user?.role === 'TEACHER') {
      const teacherUserId = (classroom.teacher as any)?._id?.toString() || classroom.teacher?.toString();
      if (teacherUserId !== req.user.userId) {
        res.status(403).json({ success: false, message: 'Access denied: You are not assigned to this classroom.' });
        return;
      }
    } else if (req.user?.role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user.userId, status: 'ACTIVE' });
      if (!student || student.batch?.toString() !== classroom.batch?._id?.toString()) {
        res.status(403).json({ success: false, message: 'Access denied: You are not enrolled in this classroom batch.' });
        return;
      }
    }

    // Fetch enrolled students roster for this classroom's batch
    const students = await Student.find({ batch: classroom.batch?._id || classroom.batch, status: 'ACTIVE' })
      .populate('user', 'name email phone avatar')
      .select('rollNumber grade section attendanceRate totalScore completedAssignments user')
      .sort({ rollNumber: 1 });

    const formattedStudents = students.map((s) => ({
      _id: s._id,
      rollNumber: s.rollNumber,
      grade: s.grade,
      section: s.section,
      attendanceRate: s.attendanceRate,
      name: (s.user as any)?.name || 'Student',
      email: (s.user as any)?.email || '',
      phone: (s.user as any)?.phone || '',
      avatar: (s.user as any)?.avatar,
    }));

    res.json({
      success: true,
      data: {
        ...classroom.toObject(),
        enrolledStudents: formattedStudents,
        totalEnrolled: formattedStudents.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch classroom details.' });
  }
}

// ─── POST /api/google-classrooms (Admin Create) ────────────────────────────────
export async function createGoogleClassroom(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const {
      schoolId: rawSchoolId,
      school: bodySchool,
      courseId: rawCourseId,
      course: bodyCourse,
      batchId: rawBatchId,
      batch: bodyBatch,
      teacherId: rawTeacherId,
      teacher: bodyTeacher,
      classroomName,
      classroomUrl,
      instructions,
      status = 'ACTIVE',
    } = req.body;

    const schoolId = req.user?.role === 'SCHOOL_ADMIN' ? req.schoolId : (rawSchoolId || bodySchool);
    const courseId = rawCourseId || bodyCourse;
    const batchId = rawBatchId || bodyBatch;
    const teacherId = rawTeacherId || bodyTeacher;

    // Validate required fields
    if (!schoolId || !courseId || !batchId || !classroomName || !classroomUrl) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: School, Course, Batch, Classroom Name, and Google Classroom URL are required.',
      });
      return;
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      res.status(400).json({ success: false, message: 'Invalid School ID.' });
      return;
    }
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      res.status(400).json({ success: false, message: 'Invalid Course ID.' });
      return;
    }
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      res.status(400).json({ success: false, message: 'Invalid Batch ID.' });
      return;
    }

    // Validate Google Classroom URL
    const urlValidation = validateStrictGoogleClassroomUrl(classroomUrl);
    if (!urlValidation.isValid) {
      res.status(400).json({ success: false, message: urlValidation.error || 'Invalid Google Classroom URL.' });
      return;
    }

    // Verify School exists
    const school = await School.findById(schoolId);
    if (!school) {
      res.status(404).json({ success: false, message: 'Selected School does not exist.' });
      return;
    }

    // Verify Course (Program) exists
    const course = await Program.findById(courseId);
    if (!course) {
      res.status(404).json({ success: false, message: 'Selected Course does not exist.' });
      return;
    }

    // Verify Batch exists and matches school and program
    const batchDoc = await Batch.findById(batchId);
    if (!batchDoc) {
      res.status(404).json({ success: false, message: 'Selected Batch does not exist.' });
      return;
    }

    if (batchDoc.school.toString() !== schoolId.toString()) {
      res.status(400).json({ success: false, message: 'The selected batch does not belong to the selected school.' });
      return;
    }

    // Check for duplicate association
    const existing = await GoogleClassroom.findOne({
      school: schoolId,
      course: courseId,
      batch: batchId,
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: 'A Google Classroom is already linked to this course, school, and batch. Please edit the existing entry instead.',
        existingId: existing._id,
      });
      return;
    }

    // Determine teacher (either provided teacherId or batch.teacher)
    let finalTeacherId = teacherId;
    if (finalTeacherId) {
      if (!mongoose.Types.ObjectId.isValid(finalTeacherId)) {
        res.status(400).json({ success: false, message: 'Invalid Teacher ID.' });
        return;
      }
      const teacherUser = await User.findById(finalTeacherId);
      if (!teacherUser || (teacherUser.role !== 'TEACHER' && teacherUser.role !== 'SUPER_ADMIN')) {
        res.status(400).json({ success: false, message: 'Assigned teacher must have the TEACHER role.' });
        return;
      }
    } else if (batchDoc.teacher) {
      finalTeacherId = batchDoc.teacher;
    }

    const newClassroom = await GoogleClassroom.create({
      classroomName: classroomName.trim(),
      school: schoolId,
      course: courseId,
      batch: batchId,
      teacher: finalTeacherId || undefined,
      classroomUrl: classroomUrl.trim(),
      instructions: instructions ? instructions.trim() : undefined,
      status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      createdBy: req.user?.userId,
    });

    // Synchronize batch's googleClassroomUrl
    await Batch.findByIdAndUpdate(batchId, {
      googleClassroomUrl: classroomUrl.trim(),
    });

    const populated = await GoogleClassroom.findById(newClassroom._id)
      .populate('school', 'name code')
      .populate('course', 'name category')
      .populate('batch', 'name grade section')
      .populate('teacher', 'name email phone avatar');

    res.status(201).json({
      success: true,
      message: 'Google Classroom connected successfully.',
      data: populated,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'A Google Classroom is already linked to this course, school, and batch.',
      });
      return;
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to create Google Classroom link.' });
  }
}

// ─── PUT /api/google-classrooms/:id (Admin Update) ─────────────────────────────
export async function updateGoogleClassroom(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid classroom ID.' });
      return;
    }

    const classroom = await GoogleClassroom.findById(id);
    if (!classroom) {
      res.status(404).json({ success: false, message: 'Google Classroom not found.' });
      return;
    }

    // Role check for School Admin
    if (req.user?.role === 'SCHOOL_ADMIN' && classroom.school.toString() !== req.schoolId) {
      res.status(403).json({ success: false, message: 'Access denied: Classroom belongs to another school.' });
      return;
    }

    const {
      classroomName,
      classroomUrl,
      instructions,
      teacherId,
      teacher,
      status,
      resolveUpdateRequest,
    } = req.body;

    if (classroomName !== undefined) {
      if (!classroomName || !classroomName.trim()) {
        res.status(400).json({ success: false, message: 'Classroom name cannot be empty.' });
        return;
      }
      classroom.classroomName = classroomName.trim();
    }

    if (classroomUrl !== undefined) {
      const urlValidation = validateStrictGoogleClassroomUrl(classroomUrl);
      if (!urlValidation.isValid) {
        res.status(400).json({ success: false, message: urlValidation.error || 'Invalid Google Classroom URL.' });
        return;
      }
      classroom.classroomUrl = classroomUrl.trim();

      // Synchronize batch's googleClassroomUrl
      await Batch.findByIdAndUpdate(classroom.batch, {
        googleClassroomUrl: classroomUrl.trim(),
      });
    }

    if (instructions !== undefined) {
      classroom.instructions = instructions ? instructions.trim() : '';
    }

    const newTeacherId = teacherId !== undefined ? teacherId : teacher;
    if (newTeacherId !== undefined) {
      if (newTeacherId === '' || newTeacherId === null) {
        classroom.teacher = undefined;
      } else {
        if (!mongoose.Types.ObjectId.isValid(newTeacherId)) {
          res.status(400).json({ success: false, message: 'Invalid Teacher ID.' });
          return;
        }
        classroom.teacher = newTeacherId;
      }
    }

    if (status !== undefined) {
      if (status !== 'ACTIVE' && status !== 'INACTIVE') {
        res.status(400).json({ success: false, message: "Status must be either 'ACTIVE' or 'INACTIVE'." });
        return;
      }
      classroom.status = status;
    }

    if (resolveUpdateRequest && classroom.updateRequest) {
      classroom.updateRequest.resolved = true;
    }

    await classroom.save();

    const populated = await GoogleClassroom.findById(classroom._id)
      .populate('school', 'name code')
      .populate('course', 'name category')
      .populate('batch', 'name grade section')
      .populate('teacher', 'name email phone avatar');

    res.json({
      success: true,
      message: 'Google Classroom updated successfully.',
      data: populated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update Google Classroom.' });
  }
}

// ─── PATCH /api/google-classrooms/:id/status (Admin Toggle Status) ─────────────
export async function updateGoogleClassroomStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid classroom ID.' });
      return;
    }

    if (status !== 'ACTIVE' && status !== 'INACTIVE') {
      res.status(400).json({ success: false, message: "Status must be 'ACTIVE' or 'INACTIVE'." });
      return;
    }

    const classroom = await GoogleClassroom.findById(id);
    if (!classroom) {
      res.status(404).json({ success: false, message: 'Google Classroom not found.' });
      return;
    }

    if (req.user?.role === 'SCHOOL_ADMIN' && classroom.school.toString() !== req.schoolId) {
      res.status(403).json({ success: false, message: 'Access denied: Classroom belongs to another school.' });
      return;
    }

    classroom.status = status;
    await classroom.save();

    res.json({
      success: true,
      message: `Google Classroom set to ${status}.`,
      data: { _id: classroom._id, status: classroom.status },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update classroom status.' });
  }
}

// ─── DELETE /api/google-classrooms/:id (Admin Delete) ──────────────────────────
export async function deleteGoogleClassroom(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid classroom ID.' });
      return;
    }

    const classroom = await GoogleClassroom.findById(id);
    if (!classroom) {
      res.status(404).json({ success: false, message: 'Google Classroom not found.' });
      return;
    }

    if (req.user?.role === 'SCHOOL_ADMIN' && classroom.school.toString() !== req.schoolId) {
      res.status(403).json({ success: false, message: 'Access denied: Classroom belongs to another school.' });
      return;
    }

    // Clear batch's googleClassroomUrl if it points to this classroom's URL
    await Batch.findByIdAndUpdate(classroom.batch, {
      $unset: { googleClassroomUrl: '' },
    });

    await GoogleClassroom.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Google Classroom link removed successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to remove Google Classroom link.' });
  }
}

// ─── GET /api/google-classrooms/teacher (Teacher View) ────────────────────────
export async function getTeacherGoogleClassrooms(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    // Find all batches where teacher is assigned
    const assignedBatches = await Batch.find({ teacher: userId }).select('_id');
    const batchIds = assignedBatches.map((b) => b._id);

    // Find Google Classrooms assigned to this teacher or to batches they lead
    const classrooms = await GoogleClassroom.find({
      $or: [
        { teacher: userId },
        { batch: { $in: batchIds } },
      ],
    })
      .populate('school', 'name code city state logo')
      .populate('course', 'name slug category gradeLevel durationMonths banner')
      .populate('batch', 'name grade section schedule startDate currentStudentCount maxStudents')
      .populate('teacher', 'name email phone avatar')
      .sort({ createdAt: -1 });

    // Enrich each classroom with active student count
    const enriched = await Promise.all(
      classrooms.map(async (c) => {
        const studentCount = await Student.countDocuments({
          batch: c.batch?._id || c.batch,
          status: 'ACTIVE',
        });
        const obj = c.toObject();
        return {
          ...obj,
          studentCount,
        };
      })
    );

    res.json({
      success: true,
      data: enriched,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch teacher Google Classrooms.' });
  }
}

// ─── POST /api/google-classrooms/:id/request-update (Teacher Request Update) ───
export async function requestClassroomUpdate(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { reason, suggestedUrl } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid classroom ID.' });
      return;
    }

    if (!reason || !reason.trim()) {
      res.status(400).json({ success: false, message: 'Please provide a reason for the link update request.' });
      return;
    }

    if (suggestedUrl && suggestedUrl.trim()) {
      const urlCheck = validateStrictGoogleClassroomUrl(suggestedUrl);
      if (!urlCheck.isValid) {
        res.status(400).json({ success: false, message: urlCheck.error || 'Suggested URL is invalid.' });
        return;
      }
    }

    const classroom = await GoogleClassroom.findById(id);
    if (!classroom) {
      res.status(404).json({ success: false, message: 'Google Classroom not found.' });
      return;
    }

    // Verify teacher is assigned to this classroom
    const isAssigned =
      classroom.teacher?.toString() === req.user?.userId ||
      (await Batch.exists({ _id: classroom.batch, teacher: req.user?.userId }));

    if (!isAssigned && req.user?.role !== 'SUPER_ADMIN') {
      res.status(403).json({ success: false, message: 'You are not assigned to this Google Classroom.' });
      return;
    }

    classroom.updateRequest = {
      requestedBy: new mongoose.Types.ObjectId(req.user?.userId),
      requestedAt: new Date(),
      reason: reason.trim(),
      suggestedUrl: suggestedUrl ? suggestedUrl.trim() : undefined,
      resolved: false,
    };

    await classroom.save();

    // Notify Super Admins
    const superAdmins = await User.find({ role: 'SUPER_ADMIN', status: 'ACTIVE' }).select('_id');
    for (const admin of superAdmins) {
      await Notification.create({
        recipient: admin._id,
        title: 'Google Classroom Update Request',
        message: `Teacher ${req.user?.name || 'Mentor'} requested an update for ${classroom.classroomName}: "${reason.trim()}"`,
        type: 'WARNING',
        link: '/admin/google-classroom',
      }).catch(() => {});
    }

    res.json({
      success: true,
      message: 'Update request submitted to ALYSTRO administration successfully.',
      data: classroom.updateRequest,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to submit update request.' });
  }
}

// ─── GET /api/google-classrooms/student (Student View) ────────────────────────
export async function getStudentGoogleClassrooms(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    // Fetch the active student profile
    const student = await Student.findOne({ user: userId });

    if (!student) {
      res.json({
        success: true,
        data: [],
        message: 'No student record found for this account.',
      });
      return;
    }

    if (student.status !== 'ACTIVE') {
      res.status(403).json({
        success: false,
        message: 'Your student account is not currently active.',
      });
      return;
    }

    // Must be actively assigned to a batch or enrolled in a course
    if (!student.batch && !student.program) {
      res.json({
        success: true,
        data: [],
        message: 'Your Google Classroom has not been connected yet. Please contact your administrator.',
      });
      return;
    }

    // Build enrollment criteria: strictly match student's enrolled batch or course & school
    const matchConditions: any[] = [];
    if (student.batch) {
      matchConditions.push({ batch: student.batch });
    }
    if (student.program && student.school) {
      matchConditions.push({ course: student.program, school: student.school });
    }

    // Only ACTIVE Google Classrooms are exposed to students
    const classrooms = await GoogleClassroom.find({
      status: 'ACTIVE',
      $or: matchConditions,
    })
      .populate('school', 'name code logo')
      .populate('course', 'name slug category gradeLevel durationMonths banner')
      .populate('batch', 'name grade section schedule startDate')
      .populate('teacher', 'name email avatar')
      .sort({ createdAt: -1 });

    // Format student-safe payload (never leak sensitive internal data)
    const sanitized = classrooms.map((c) => ({
      _id: c._id,
      classroomName: c.classroomName,
      classroomUrl: c.classroomUrl,
      instructions: c.instructions || '',
      status: c.status,
      courseName: (c.course as any)?.name || 'Course',
      courseCategory: (c.course as any)?.category,
      batchName: (c.batch as any)?.name || 'Batch',
      batchGrade: (c.batch as any)?.grade,
      batchSection: (c.batch as any)?.section,
      teacherName: (c.teacher as any)?.name || 'Lead Instructor',
      teacherAvatar: (c.teacher as any)?.avatar,
      schoolName: (c.school as any)?.name,
      createdAt: c.createdAt,
    }));

    res.json({
      success: true,
      data: sanitized,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch student Google Classrooms.' });
  }
}

