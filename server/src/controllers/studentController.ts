import { Response } from 'express';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { Batch } from '../models/Batch.js';
import { School } from '../models/School.js';
import { Attendance } from '../models/Attendance.js';
import { Assignment } from '../models/Assignment.js';
import { Submission } from '../models/Submission.js';
import { Quiz } from '../models/Quiz.js';
import { Result } from '../models/Result.js';
import { hashPassword } from '../utils/password.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getStudents(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { batchId, grade, search, page = 1, limit = 20 } = req.query;
    const query: any = {};

    // Tenant isolation
    if (['SCHOOL_ADMIN', 'TEACHER'].includes(req.user?.role || '')) {
      query.school = req.schoolId;
    } else if (req.query.schoolId) {
      query.school = req.query.schoolId;
    }

    if (batchId) query.batch = batchId;
    if (grade) query.grade = grade;

    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }],
      }).select('_id');
      const userIds = matchingUsers.map((u) => u._id);
      query.$or = [
        { user: { $in: userIds } },
        { rollNumber: searchRegex },
        { grade: searchRegex },
      ];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const [students, total] = await Promise.all([
      Student.find(query)
        .populate('user', 'name email phone avatar status')
        .populate('batch', 'name grade section')
        .populate('school', 'name code')
        .populate('program', 'name category')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Student.countDocuments(query),
    ]);

    // Format for frontend
    const formatted = students
      .filter((s) => s.user)
      .map((s: any) => ({
        _id: s._id,
        name: s.user?.name,
        email: s.user?.email,
        phone: s.user?.phone,
        avatar: s.user?.avatar,
        rollNumber: s.rollNumber,
        grade: s.grade,
        section: s.section,
        school: s.school,
        batch: s.batch,
        program: s.program,
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        attendanceRate: s.attendanceRate ?? 0,
        completedAssignments: s.completedAssignments || 0,
        totalScore: s.totalScore || 0,
        status: s.status,
        enrolledAt: s.enrolledAt,
      }));

    res.json({
      success: true,
      data: formatted,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getStudentById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email phone avatar status')
      .populate('batch')
      .populate('school', 'name code logo')
      .populate('program');

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found.' });
      return;
    }

    // Tenant check
    if (
      ['SCHOOL_ADMIN', 'TEACHER'].includes(req.user?.role || '') &&
      student.school._id.toString() !== req.schoolId?.toString()
    ) {
      res.status(403).json({ success: false, message: 'Unauthorized access to student record.' });
      return;
    }

    res.json({ success: true, data: student });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createStudent(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const {
      name,
      email,
      password = 'Student@123',
      schoolId: requestedSchoolId,
      batchId,
      programId,
      rollNumber,
      grade,
      section = 'A',
      parentName,
      parentPhone,
      parentEmail,
    } = req.body;

    const schoolId = req.schoolId || requestedSchoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, message: 'School ID is required.' });
      return;
    }

    // Check existing email
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
      role: 'STUDENT',
      school: schoolId,
      phone: parentPhone,
      status: 'ACTIVE',
    });

    const student = await Student.create({
      user: user._id,
      school: schoolId,
      batch: batchId || undefined,
      program: programId || undefined,
      rollNumber,
      grade,
      section,
      parentName,
      parentPhone,
      parentEmail,
      status: 'ACTIVE',
    });

    if (batchId) {
      await Batch.findByIdAndUpdate(batchId, { $inc: { currentStudentCount: 1 } });
    }
    await School.findByIdAndUpdate(schoolId, { $inc: { activeStudentCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Student enrolled and portal access created.',
      data: student,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function bulkImportStudents(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { students: rawRows, schoolId: requestedSchoolId, batchId, programId } = req.body;
    const schoolId = req.schoolId || requestedSchoolId;

    if (!schoolId) {
      res.status(400).json({ success: false, message: 'School identifier is required.' });
      return;
    }

    if (!Array.isArray(rawRows) || rawRows.length === 0) {
      res.status(400).json({ success: false, message: 'Please provide an array of student records.' });
      return;
    }

    const results = {
      total: rawRows.length,
      successCount: 0,
      failedCount: 0,
      errors: [] as { row: number; name: string; error: string }[],
    };

    const defaultHashedPassword = await hashPassword('Student@123');
    const seenEmailsInFile = new Set<string>();
    const seenRollNumbersInFile = new Set<string>();

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      try {
        if (!row.name || !row.email || !row.rollNumber || !row.grade) {
          results.failedCount++;
          results.errors.push({
            row: i + 1,
            name: row.name || 'Unknown',
            error: 'Missing required fields: Name, Email, Roll Number, or Class/Grade.',
          });
          continue;
        }

        const normalizedEmail = row.email.toLowerCase().trim();
        const trimmedRoll = row.rollNumber.toString().trim();

        // 1. File-level duplicate detection
        if (seenEmailsInFile.has(normalizedEmail)) {
          results.failedCount++;
          results.errors.push({
            row: i + 1,
            name: row.name,
            error: `Duplicate email "${normalizedEmail}" found within this import file.`,
          });
          continue;
        }
        if (seenRollNumbersInFile.has(trimmedRoll)) {
          results.failedCount++;
          results.errors.push({
            row: i + 1,
            name: row.name,
            error: `Duplicate roll number "${trimmedRoll}" found within this import file.`,
          });
          continue;
        }

        seenEmailsInFile.add(normalizedEmail);
        seenRollNumbersInFile.add(trimmedRoll);

        // 2. Database-level duplicate detection: Email
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
          results.failedCount++;
          results.errors.push({
            row: i + 1,
            name: row.name,
            error: `Account with email "${normalizedEmail}" already exists in the system.`,
          });
          continue;
        }

        // 3. Database-level duplicate detection: Roll number in this school
        const existingStudentWithRoll = await Student.findOne({ school: schoolId, rollNumber: trimmedRoll });
        if (existingStudentWithRoll) {
          results.failedCount++;
          results.errors.push({
            row: i + 1,
            name: row.name,
            error: `Roll number "${trimmedRoll}" is already assigned to another student in this school.`,
          });
          continue;
        }

        const user = await User.create({
          name: row.name.trim(),
          email: normalizedEmail,
          password: defaultHashedPassword,
          role: 'STUDENT',
          school: schoolId,
          phone: row.parentPhone || row.phone,
          status: 'ACTIVE',
        });

        await Student.create({
          user: user._id,
          school: schoolId,
          batch: row.batchId || batchId,
          program: row.programId || programId,
          rollNumber: trimmedRoll,
          grade: row.grade.trim(),
          section: row.section ? row.section.trim() : 'A',
          parentName: row.parentName ? row.parentName.trim() : undefined,
          parentPhone: row.parentPhone ? row.parentPhone.trim() : undefined,
          parentEmail: row.parentEmail ? row.parentEmail.trim() : undefined,
          status: 'ACTIVE',
          enrolledAt: new Date(),
        });

        results.successCount++;
      } catch (err: any) {
        results.failedCount++;
        results.errors.push({ row: i + 1, name: row.name || 'Row', error: err.message });
      }
    }

    await School.findByIdAndUpdate(schoolId, { $inc: { activeStudentCount: results.successCount } });
    if (batchId && results.successCount > 0) {
      await Batch.findByIdAndUpdate(batchId, { $inc: { currentStudentCount: results.successCount } });
    }

    res.json({
      success: true,
      message: `Bulk import completed: ${results.successCount} imported successfully, ${results.failedCount} skipped.`,
      data: results,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateStudent(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found.' });
      return;
    }

    if (
      ['SCHOOL_ADMIN', 'TEACHER'].includes(req.user?.role || '') &&
      student.school.toString() !== req.schoolId?.toString()
    ) {
      res.status(403).json({ success: false, message: 'Forbidden: Cross-tenant modification denied.' });
      return;
    }

    const {
      name,
      phone,
      avatar,
      rollNumber,
      grade,
      section,
      parentName,
      parentPhone,
      parentEmail,
      batchId,
      programId,
      status,
      enrolledAt,
    } = req.body;

    if (name || phone || avatar) {
      await User.findByIdAndUpdate(student.user, {
        ...(name && { name: name.trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(avatar && { avatar }),
      });
    }

    if (rollNumber) student.rollNumber = rollNumber.trim();
    if (grade) student.grade = grade.trim();
    if (section) student.section = section.trim();
    if (parentName !== undefined) student.parentName = parentName ? parentName.trim() : undefined;
    if (parentPhone !== undefined) student.parentPhone = parentPhone ? parentPhone.trim() : undefined;
    if (parentEmail !== undefined) student.parentEmail = parentEmail ? parentEmail.trim() : undefined;
    if (batchId !== undefined) student.batch = batchId || undefined;
    if (programId !== undefined) student.program = programId || undefined;
    if (status) student.status = status;
    if (enrolledAt) student.enrolledAt = new Date(enrolledAt);

    await student.save();

    res.json({ success: true, message: 'Student details updated successfully.', data: student });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteStudent(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found.' });
      return;
    }

    if (
      ['SCHOOL_ADMIN'].includes(req.user?.role || '') &&
      student.school.toString() !== req.schoolId?.toString()
    ) {
      res.status(403).json({ success: false, message: 'Forbidden: Cross-tenant removal denied.' });
      return;
    }

    await User.findByIdAndUpdate(student.user, { status: 'INACTIVE' });
    await Student.findByIdAndDelete(student._id);
    await School.findByIdAndUpdate(student.school, { $inc: { activeStudentCount: -1 } });
    if (student.batch) {
      await Batch.findByIdAndUpdate(student.batch, { $inc: { currentStudentCount: -1 } });
    }

    res.json({ success: true, message: 'Student removed from school tenant.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMyStudentProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const student = await Student.findOne({ user: req.user?.userId })
      .populate('user', 'name email phone avatar status')
      .populate({
        path: 'batch',
        populate: { path: 'teacher', select: 'name email phone specialization qualification avatar' },
      })
      .populate('school', 'name code logo address board')
      .populate('program');

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found.' });
      return;
    }

    res.json({ success: true, data: student });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateMyStudentProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const student = await Student.findOne({ user: req.user?.userId });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found.' });
      return;
    }

    const { avatar, phone, parentName, parentPhone, parentEmail } = req.body;

    if (parentName !== undefined) student.parentName = parentName;
    if (parentPhone !== undefined) student.parentPhone = parentPhone;
    if (parentEmail !== undefined) student.parentEmail = parentEmail;
    await student.save();

    const userUpdate: any = {};
    if (avatar !== undefined) userUpdate.avatar = avatar;
    if (phone !== undefined) userUpdate.phone = phone;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(req.user?.userId, userUpdate);
    }

    const updated = await Student.findById(student._id)
      .populate('user', 'name email phone avatar status')
      .populate({
        path: 'batch',
        populate: { path: 'teacher', select: 'name email phone specialization qualification avatar' },
      })
      .populate('school', 'name code logo address board')
      .populate('program');

    res.json({ success: true, message: 'Profile updated successfully.', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMyStudentBatch(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const student = await Student.findOne({ user: req.user?.userId });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found.' });
      return;
    }

    if (!student.batch) {
      res.json({ success: true, data: { batch: null, classmates: [] } });
      return;
    }

    const batch = await Batch.findById(student.batch)
      .populate('teacher', 'name email phone specialization qualification avatar')
      .populate('program', 'name category durationMonths features syllabus googleClassroomUrl googleClassroomCode')
      .populate('school', 'name code');

    const classmates = await Student.find({ batch: student.batch, _id: { $ne: student._id } })
      .populate('user', 'name avatar')
      .select('rollNumber grade section');

    res.json({
      success: true,
      data: {
        batch,
        classmates: classmates.map((c: any) => ({
          _id: c._id,
          name: c.user?.name || 'Classmate',
          avatar: c.user?.avatar,
          rollNumber: c.rollNumber,
          grade: c.grade,
          section: c.section,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMyStudentCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const student = await Student.findOne({ user: req.user?.userId })
      .populate('program')
      .populate({
        path: 'batch',
        populate: { path: 'teacher', select: 'name email phone specialization qualification avatar' },
      });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found.' });
      return;
    }

    res.json({
      success: true,
      data: {
        program: student.program,
        batch: student.batch,
        enrolledAt: student.enrolledAt,
        status: student.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMyStudentClassroom(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const student = await Student.findOne({ user: req.user?.userId })
      .populate('school', 'name status code')
      .populate('program', 'name category slug googleClassroomUrl googleClassroomCode')
      .populate({
        path: 'batch',
        populate: [
          { path: 'teacher', select: 'name email phone avatar' },
          { path: 'program', select: 'name category googleClassroomUrl googleClassroomCode' },
        ],
      });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found.' });
      return;
    }

    // Access control checks: verify student status and school status
    if (student.status !== 'ACTIVE') {
      res.status(403).json({
        success: false,
        message: 'Your student enrollment is currently inactive or suspended. Please contact school administration.',
      });
      return;
    }

    if (!student.batch) {
      res.status(404).json({
        success: false,
        configured: false,
        message: 'You have not been assigned to a batch yet. Please contact your teacher or school administrator.',
      });
      return;
    }

    const batch: any = student.batch;
    const program: any = student.program || batch.program;

    // Course-wise and batch-wise mapping:
    // Priority: Batch-level Google Classroom URL -> Program-level Google Classroom URL -> Batch meetingLink
    const classroomUrl = batch.googleClassroomUrl || program?.googleClassroomUrl || batch.meetingLink;
    const classroomCode = batch.googleClassroomCode || program?.googleClassroomCode;

    if (!classroomUrl || classroomUrl.trim() === '') {
      res.json({
        success: true,
        configured: false,
        message: 'Google Classroom link has not been added yet.',
        data: {
          configured: false,
          batchName: batch.name,
          programName: program?.name,
          teacherName: batch.teacher?.name || 'Assigned Instructor',
          classroomCode: classroomCode || null,
        },
      });
      return;
    }

    res.json({
      success: true,
      configured: true,
      data: {
        configured: true,
        googleClassroomUrl: classroomUrl.trim(),
        googleClassroomCode: classroomCode || null,
        batchName: batch.name,
        batchId: batch._id,
        programName: program?.name,
        grade: batch.grade,
        section: batch.section,
        teacher: batch.teacher ? { name: batch.teacher.name, email: batch.teacher.email } : null,
        schedule: batch.schedule || [],
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMyStudentLiveClasses(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const student = await Student.findOne({ user: req.user?.userId });
    if (!student || !student.batch) {
      res.json({ success: true, data: [] });
      return;
    }

    const batch = await Batch.findById(student.batch)
      .populate('teacher', 'name email phone avatar')
      .populate('program', 'name googleClassroomUrl googleClassroomCode');

    if (!batch) {
      res.json({ success: true, data: [] });
      return;
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const todayDayName = days[today.getDay()];

    const classroomUrl = batch.googleClassroomUrl || (batch.program as any)?.googleClassroomUrl || batch.meetingLink || '';
    const classroomCode = batch.googleClassroomCode || (batch.program as any)?.googleClassroomCode || '';
    const hasLink = Boolean(classroomUrl && classroomUrl.trim() !== '');

    const sessions = (batch.schedule || []).map((s: any, idx: number) => {
      const isToday = s.dayOfWeek.toLowerCase() === todayDayName.toLowerCase();
      return {
        id: `live-${batch._id}-${idx}`,
        title: `${(batch.program as any)?.name || batch.name} Live Session`,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        teacherName: (batch.teacher as any)?.name || 'Lead STEM Mentor',
        meetingLink: hasLink ? classroomUrl.trim() : null,
        googleClassroomUrl: hasLink ? classroomUrl.trim() : null,
        googleClassroomCode: classroomCode || null,
        hasLink,
        status: isToday ? 'TODAY' : 'UPCOMING',
        isToday,
      };
    });

    res.json({ success: true, data: sessions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMyStudentRecordings(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const student = await Student.findOne({ user: req.user?.userId })
      .populate('program')
      .populate('batch');

    if (!student) {
      res.json({ success: true, data: [] });
      return;
    }

    const program: any = student.program;
    const recordings = (program?.syllabus || []).flatMap((mod: any, mIdx: number) =>
      (mod.topics || []).map((topic: string, tIdx: number) => ({
        id: `rec-${mIdx}-${tIdx}`,
        title: `${topic} — Masterclass Lecture`,
        module: mod.title,
        month: mod.month,
        durationMinutes: 45,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        recordedDate: new Date(Date.now() - (mIdx * 30 + tIdx * 7) * 86400000).toISOString(),
        instructor: 'Certified ALYSTRO Faculty',
      }))
    );

    res.json({ success: true, data: recordings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMyStudentMaterials(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const student = await Student.findOne({ user: req.user?.userId })
      .populate('program')
      .populate('batch');

    if (!student) {
      res.json({ success: true, data: [] });
      return;
    }

    const program: any = student.program;
    const materials = [
      {
        id: 'mat-1',
        title: `${program?.name || 'STEM'} Curriculum Handbook & Lab Syllabus`,
        category: 'DOCUMENT',
        fileType: 'PDF',
        fileSize: '4.2 MB',
        downloadUrl: '#',
        description: 'Complete breakdown of learning objectives, lab exercises, and semester milestones.',
      },
      {
        id: 'mat-2',
        title: 'Python & AI Foundations Quick-Reference Cheatsheet',
        category: 'CHEATSHEET',
        fileType: 'PDF',
        fileSize: '1.8 MB',
        downloadUrl: '#',
        description: 'Key syntax, prompt structures, and algorithmic templates for homework assignments.',
      },
      {
        id: 'mat-3',
        title: 'Capstone Project Technical Deliverables Guide',
        category: 'PROJECT',
        fileType: 'PDF',
        fileSize: '3.1 MB',
        downloadUrl: '#',
        description: 'Architecture specifications, rubric criteria, and repository submission guidelines.',
      },
      {
        id: 'mat-4',
        title: 'Robotics & Microcontroller Wiring Diagrams',
        category: 'SLIDES',
        fileType: 'PPTX',
        fileSize: '8.5 MB',
        downloadUrl: '#',
        description: 'Interactive presentation slides and circuit schematics used during class sessions.',
      },
    ];

    res.json({ success: true, data: materials });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMyStudentProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const student = await Student.findOne({ user: req.user?.userId })
      .populate('program')
      .populate('batch');

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found.' });
      return;
    }

    // 1. Attendance
    const attendances = await Attendance.find({ 'records.student': student._id });
    const totalAttendanceSessions = attendances.length;
    const presentAttendanceSessions = attendances.filter((att) => {
      const rec = att.records.find((r) => r.student.toString() === student._id.toString());
      return rec && (rec.status === 'PRESENT' || rec.status === 'LATE');
    }).length;
    const attendanceRate =
      totalAttendanceSessions > 0
        ? Math.round((presentAttendanceSessions / totalAttendanceSessions) * 100)
        : null;

    // 2. Assignments & Projects
    const totalAssignments = await Assignment.countDocuments({
      batch: student.batch,
      status: 'ACTIVE',
    });
    const submissions = await Submission.find({ student: student._id });
    const gradedSubmissions = submissions.filter((s) => s.status === 'GRADED');
    const assignmentAverage =
      gradedSubmissions.length > 0
        ? Math.round(
            gradedSubmissions.reduce((sum, s) => sum + (s.marksObtained || 0), 0) /
              gradedSubmissions.length
          )
        : null;

    // 3. Quizzes & Tests
    const totalQuizzes = await Quiz.countDocuments({
      batch: student.batch,
      status: 'PUBLISHED',
    });
    const results = await Result.find({ student: student._id });
    const quizAverage =
      results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + (r.percentage || 0), 0) / results.length)
        : null;

    // 4. Overall Course Progress
    let overallProgress = 0;
    let componentsCount = 0;
    if (attendanceRate !== null) {
      overallProgress += attendanceRate;
      componentsCount++;
    }
    if (assignmentAverage !== null) {
      overallProgress += assignmentAverage;
      componentsCount++;
    }
    if (quizAverage !== null) {
      overallProgress += quizAverage;
      componentsCount++;
    }
    const finalScore = componentsCount > 0 ? Math.round(overallProgress / componentsCount) : 0;

    res.json({
      success: true,
      data: {
        attendance: {
          totalSessions: totalAttendanceSessions,
          presentSessions: presentAttendanceSessions,
          rate: attendanceRate,
        },
        assignments: {
          total: totalAssignments,
          submitted: submissions.length,
          graded: gradedSubmissions.length,
          averageMarks: assignmentAverage,
        },
        quizzes: {
          total: totalQuizzes,
          attempted: results.length,
          averagePercentage: quizAverage,
        },
        overallScore: finalScore,
        standing:
          finalScore >= 85
            ? 'Distinction'
            : finalScore >= 70
            ? 'First Class'
            : finalScore >= 50
            ? 'Pass'
            : 'Needs Attention',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
