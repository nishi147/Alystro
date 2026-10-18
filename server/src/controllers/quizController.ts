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
          const qObj = q.toObject();
          // Security: strip answer key for students
          if (Array.isArray(qObj.questions)) {
            qObj.questions = qObj.questions.map((quest: any) => {
              const { correctOptionIndex, explanation, ...safeQuest } = quest;
              return safeQuest;
            });
          }
          return {
            ...qObj,
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

    const qObj = quiz.toObject();
    if (req.user?.role === 'STUDENT' && Array.isArray(qObj.questions)) {
      qObj.questions = qObj.questions.map((quest: any) => {
        const { correctOptionIndex, explanation, ...safeQuest } = quest;
        return safeQuest;
      });
    }

    res.json({ success: true, data: qObj });
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

export async function createQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { batchId, programId, title, description, durationMinutes, passingScore, questions, status } = req.body;
    const schoolId = req.schoolId;

    if (!schoolId) {
      res.status(400).json({ success: false, message: 'School identifier is required.' });
      return;
    }

    if (!title || !batchId) {
      res.status(400).json({ success: false, message: 'Test title and batch are required.' });
      return;
    }

    const defaultQuestions = questions && Array.isArray(questions) && questions.length > 0 ? questions : [
      {
        questionText: 'What does AI stand for in modern computing?',
        options: ['Artificial Intelligence', 'Automated Interface', 'Advanced Internet', 'Action Index'],
        correctOptionIndex: 0,
        explanation: 'AI stands for Artificial Intelligence.',
        marks: 10,
      },
      {
        questionText: 'Which Python library is standard for data analysis?',
        options: ['pandas', 'django', 'flask', 'css'],
        correctOptionIndex: 0,
        explanation: 'pandas is the standard data manipulation library in Python.',
        marks: 10,
      },
    ];

    const quiz = await Quiz.create({
      school: schoolId,
      batch: batchId,
      program: programId,
      title: title.trim(),
      description: description || 'Official institutional practice test & assessment',
      durationMinutes: Number(durationMinutes) || 20,
      passingScore: Number(passingScore) || 60,
      questions: defaultQuestions,
      status: status || 'PUBLISHED',
    });

    res.status(201).json({ success: true, message: 'Test/Quiz created successfully.', data: quiz });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getQuizResults(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const query: any = {};
    if (id) query.quiz = id;

    if (['SCHOOL_ADMIN', 'TEACHER'].includes(req.user?.role || '')) {
      query.school = req.schoolId;
    } else if (req.query.schoolId) {
      query.school = req.query.schoolId;
    }

    const results = await Result.find(query)
      .populate({
        path: 'student',
        populate: [{ path: 'user', select: 'name email phone avatar' }, { path: 'school', select: 'name' }],
      })
      .populate('quiz', 'title totalMarks passingScore')
      .sort({ completedAt: -1 });

    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      res.status(404).json({ success: false, message: 'Quiz not found.' });
      return;
    }

    if (
      ['SCHOOL_ADMIN', 'TEACHER'].includes(req.user?.role || '') &&
      quiz.school.toString() !== req.schoolId?.toString()
    ) {
      res.status(403).json({ success: false, message: 'Forbidden: Cross-tenant removal denied.' });
      return;
    }

    await Quiz.findByIdAndDelete(quiz._id);
    await Result.deleteMany({ quiz: quiz._id });

    res.json({ success: true, message: 'Test/Assessment removed successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
