import { Response } from 'express';
import { Quiz } from '../models/Quiz.js';
import { Result } from '../models/Result.js';
import { Student } from '../models/Student.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getQuizzes(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const query: any = { status: 'PUBLISHED' };

    if (['SCHOOL_ADMIN', 'TEACHER'].includes(req.user?.role || '')) {
      query.school = req.schoolId;
    } else if (req.user?.role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user.userId });
      if (student?.batch) {
        query.batch = student.batch;
      }
    }

    const quizzes = await Quiz.find(query)
      .populate('batch', 'name grade section')
      .populate('program', 'name category')
      .sort({ createdAt: -1 });

    // If student, attach prior results
    let formatted: any[] = quizzes;
    if (req.user?.role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user.userId });
      if (student) {
        const results = await Result.find({ student: student._id });
        const resMap = new Map();
        results.forEach((r) => resMap.set(r.quiz.toString(), r));

        formatted = quizzes.map((q: any) => {
          const resObj = resMap.get(q._id.toString());
          return {
            ...q.toObject(),
            userResult: resObj || null,
          };
        });
      }
    }

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getQuizById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('batch', 'name')
      .populate('program', 'name');

    if (!quiz) {
      res.status(404).json({ success: false, message: 'Quiz not found.' });
      return;
    }

    res.json({ success: true, data: quiz });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function attemptQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { answers } = req.body; // Array of selected option indices

    const student = await Student.findOne({ user: req.user?.userId });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found.' });
      return;
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      res.status(404).json({ success: false, message: 'Quiz not found.' });
      return;
    }

    // Calculate score
    let score = 0;
    let totalMarks = 0;

    quiz.questions.forEach((q, idx) => {
      const marks = q.marks || 10;
      totalMarks += marks;
      if (answers && answers[idx] === q.correctOptionIndex) {
        score += marks;
      }
    });

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const passed = percentage >= (quiz.passingScore || 60);

    const result = await Result.findOneAndUpdate(
      { quiz: quiz._id, student: student._id },
      {
        quiz: quiz._id,
        student: student._id,
        school: student.school,
        score,
        totalMarks,
        percentage,
        passed,
        selectedAnswers: answers,
        completedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: passed ? 'Congratulations! You passed the quiz.' : 'Quiz completed. Keep practicing!',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
