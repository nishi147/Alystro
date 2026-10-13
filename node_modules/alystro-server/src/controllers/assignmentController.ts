import { Response } from 'express';
import { Assignment } from '../models/Assignment.js';
import { Submission } from '../models/Submission.js';
import { Student } from '../models/Student.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getAssignments(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { batchId } = req.query;
    const query: any = { status: 'ACTIVE' };

    if (['SCHOOL_ADMIN', 'TEACHER'].includes(req.user?.role || '')) {
      query.school = req.schoolId;
    } else if (req.user?.role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user.userId });
      if (student?.batch) {
        query.batch = student.batch;
      }
    } else if (req.query.schoolId) {
      query.school = req.query.schoolId;
    }

    if (batchId) query.batch = batchId;

    const assignments = await Assignment.find(query)
      .populate('batch', 'name grade section')
      .populate('program', 'name category')
      .populate('teacher', 'name email avatar')
      .sort({ dueDate: 1 });

    // If student, attach their submission status
    let formatted: any[] = assignments;
    if (req.user?.role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user.userId });
      if (student) {
        const studentSubmissions = await Submission.find({ student: student._id });
        const subMap = new Map();
        studentSubmissions.forEach((s) => subMap.set(s.assignment.toString(), s));

        formatted = assignments.map((a: any) => {
          const sub = subMap.get(a._id.toString());
          return {
            ...a.toObject(),
            userSubmission: sub || null,
          };
        });
      }
    }

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createAssignment(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { title, description, batchId, programId, dueDate, totalMarks, attachments } = req.body;
    const schoolId = req.schoolId;

    if (!schoolId) {
      res.status(400).json({ success: false, message: 'School identifier is required.' });
      return;
    }

    const assignment = await Assignment.create({
      school: schoolId,
      batch: batchId,
      program: programId,
      teacher: req.user?.userId,
      title,
      description,
      dueDate: new Date(dueDate),
      totalMarks: totalMarks || 100,
      attachments: attachments || [],
    });

    res.status(201).json({ success: true, message: 'Assignment published.', data: assignment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function submitAssignment(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { assignmentId } = req.params;
    const { fileUrl, notes } = req.body;

    const student = await Student.findOne({ user: req.user?.userId });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found.' });
      return;
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found.' });
      return;
    }

    // Upsert submission
    let submission = await Submission.findOne({ assignment: assignmentId, student: student._id });
    if (submission) {
      submission.fileUrl = fileUrl || submission.fileUrl;
      submission.notes = notes || submission.notes;
      submission.submittedAt = new Date();
      submission.status = 'SUBMITTED';
      await submission.save();
    } else {
      submission = await Submission.create({
        assignment: assignmentId,
        student: student._id,
        school: student.school,
        fileUrl,
        notes,
        submittedAt: new Date(),
        status: 'SUBMITTED',
      });
      await Student.findByIdAndUpdate(student._id, { $inc: { completedAssignments: 1 } });
    }

    res.json({
      success: true,
      message: 'Assignment submitted successfully. Mentor will review shortly.',
      data: submission,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getSubmissions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { assignmentId } = req.params;
    const submissions = await Submission.find({ assignment: assignmentId })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email avatar' },
      })
      .sort({ submittedAt: -1 });

    res.json({ success: true, data: submissions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function gradeSubmission(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { submissionId } = req.params;
    const { marksObtained, feedback } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      {
        marksObtained,
        feedback,
        gradedBy: req.user?.userId,
        gradedAt: new Date(),
        status: 'GRADED',
      },
      { new: true }
    );

    if (!submission) {
      res.status(404).json({ success: false, message: 'Submission not found.' });
      return;
    }

    res.json({ success: true, message: 'Marks and feedback saved.', data: submission });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
