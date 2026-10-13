"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBatches = getBatches;
exports.createBatch = createBatch;
exports.updateBatch = updateBatch;
const Batch_js_1 = require("../models/Batch.js");
const Teacher_js_1 = require("../models/Teacher.js");
const Student_js_1 = require("../models/Student.js");
async function getBatches(req, res) {
    try {
        const query = {};
        if (['SCHOOL_ADMIN'].includes(req.user?.role || '')) {
            query.school = req.schoolId;
        }
        else if (req.user?.role === 'TEACHER') {
            query.school = req.schoolId;
            // Filter batches where teacher is assigned
            query.teacher = req.user.userId;
        }
        else if (req.user?.role === 'STUDENT') {
            const student = await Student_js_1.Student.findOne({ user: req.user.userId });
            if (student?.batch) {
                query._id = student.batch;
            }
        }
        else if (req.query.schoolId) {
            query.school = req.query.schoolId;
        }
        const batches = await Batch_js_1.Batch.find(query)
            .populate('program', 'name category slug durationMonths')
            .populate('teacher', 'name email phone avatar')
            .populate('school', 'name code')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: batches });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function createBatch(req, res) {
    try {
        const { name, programId, teacherId, grade, section = 'A', schedule, meetingLink, maxStudents } = req.body;
        const schoolId = req.schoolId || req.body.schoolId;
        if (!schoolId) {
            res.status(400).json({ success: false, message: 'School identifier is required.' });
            return;
        }
        const batch = await Batch_js_1.Batch.create({
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
            await Teacher_js_1.Teacher.findOneAndUpdate({ user: teacherId }, { $addToSet: { assignedBatches: batch._id } });
        }
        res.status(201).json({ success: true, message: 'Batch created successfully.', data: batch });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function updateBatch(req, res) {
    try {
        const batch = await Batch_js_1.Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!batch) {
            res.status(404).json({ success: false, message: 'Batch not found.' });
            return;
        }
        res.json({ success: true, message: 'Batch updated successfully.', data: batch });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
