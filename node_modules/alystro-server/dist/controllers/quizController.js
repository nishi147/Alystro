"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuizzes = getQuizzes;
exports.getQuizById = getQuizById;
exports.attemptQuiz = attemptQuiz;
const Quiz_js_1 = require("../models/Quiz.js");
const Result_js_1 = require("../models/Result.js");
const Student_js_1 = require("../models/Student.js");
async function getQuizzes(req, res) {
    try {
        const query = { status: 'PUBLISHED' };
        if (['SCHOOL_ADMIN', 'TEACHER'].includes(req.user?.role || '')) {
            query.school = req.schoolId;
        }
        else if (req.user?.role === 'STUDENT') {
            const student = await Student_js_1.Student.findOne({ user: req.user.userId });
            if (student?.batch) {
                query.batch = student.batch;
            }
        }
        const quizzes = await Quiz_js_1.Quiz.find(query)
            .populate('batch', 'name grade section')
            .populate('program', 'name category')
            .sort({ createdAt: -1 });
        // If student, attach prior results
        let formatted = quizzes;
        if (req.user?.role === 'STUDENT') {
            const student = await Student_js_1.Student.findOne({ user: req.user.userId });
            if (student) {
                const results = await Result_js_1.Result.find({ student: student._id });
                const resMap = new Map();
                results.forEach((r) => resMap.set(r.quiz.toString(), r));
                formatted = quizzes.map((q) => {
                    const resObj = resMap.get(q._id.toString());
                    return {
                        ...q.toObject(),
                        userResult: resObj || null,
                    };
                });
            }
        }
        res.json({ success: true, data: formatted });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function getQuizById(req, res) {
    try {
        const quiz = await Quiz_js_1.Quiz.findById(req.params.id)
            .populate('batch', 'name')
            .populate('program', 'name');
        if (!quiz) {
            res.status(404).json({ success: false, message: 'Quiz not found.' });
            return;
        }
        res.json({ success: true, data: quiz });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function attemptQuiz(req, res) {
    try {
        const { id } = req.params;
        const { answers } = req.body; // Array of selected option indices
        const student = await Student_js_1.Student.findOne({ user: req.user?.userId });
        if (!student) {
            res.status(404).json({ success: false, message: 'Student profile not found.' });
            return;
        }
        const quiz = await Quiz_js_1.Quiz.findById(id);
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
        const result = await Result_js_1.Result.findOneAndUpdate({ quiz: quiz._id, student: student._id }, {
            quiz: quiz._id,
            student: student._id,
            school: student.school,
            score,
            totalMarks,
            percentage,
            passed,
            selectedAnswers: answers,
            completedAt: new Date(),
        }, { upsert: true, new: true });
        res.json({
            success: true,
            message: passed ? 'Congratulations! You passed the quiz.' : 'Quiz completed. Keep practicing!',
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
