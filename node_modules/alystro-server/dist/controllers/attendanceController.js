"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendance = getAttendance;
exports.markAttendance = markAttendance;
exports.getStudentAttendanceSummary = getStudentAttendanceSummary;
const Attendance_js_1 = require("../models/Attendance.js");
const Student_js_1 = require("../models/Student.js");
async function getAttendance(req, res) {
    try {
        const { batchId, date } = req.query;
        const query = {};
        if (['SCHOOL_ADMIN', 'TEACHER'].includes(req.user?.role || '')) {
            query.school = req.schoolId;
        }
        else if (req.query.schoolId) {
            query.school = req.query.schoolId;
        }
        if (batchId)
            query.batch = batchId;
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }
        const records = await Attendance_js_1.Attendance.find(query)
            .populate('batch', 'name grade section')
            .populate('teacher', 'name email')
            .populate('records.student')
            .sort({ date: -1 });
        res.json({ success: true, data: records });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function markAttendance(req, res) {
    try {
        const { batchId, date, topicCovered, records } = req.body;
        const schoolId = req.schoolId;
        if (!batchId || !records || !Array.isArray(records)) {
            res.status(400).json({ success: false, message: 'Batch ID and attendance records are required.' });
            return;
        }
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);
        // Upsert attendance document for batch on this date
        let attendance = await Attendance_js_1.Attendance.findOne({
            batch: batchId,
            date: {
                $gte: new Date(targetDate.getTime()),
                $lte: new Date(targetDate.getTime() + 86400000 - 1),
            },
        });
        if (attendance) {
            attendance.records = records;
            attendance.topicCovered = topicCovered || attendance.topicCovered;
            attendance.teacher = req.user?.userId;
            await attendance.save();
        }
        else {
            attendance = await Attendance_js_1.Attendance.create({
                school: schoolId,
                batch: batchId,
                date: targetDate,
                teacher: req.user?.userId,
                topicCovered,
                records,
            });
        }
        // Update attendance rates for involved students asynchronously
        for (const item of records) {
            const studentId = item.student;
            const allStudentRecords = await Attendance_js_1.Attendance.find({ 'records.student': studentId });
            let presentCount = 0;
            let totalCount = 0;
            allStudentRecords.forEach((att) => {
                const studentRec = att.records.find((r) => r.student.toString() === studentId.toString());
                if (studentRec) {
                    totalCount++;
                    if (studentRec.status === 'PRESENT' || studentRec.status === 'LATE') {
                        presentCount++;
                    }
                }
            });
            const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;
            await Student_js_1.Student.findByIdAndUpdate(studentId, { attendanceRate: rate });
        }
        res.json({ success: true, message: 'Attendance recorded successfully.', data: attendance });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function getStudentAttendanceSummary(req, res) {
    try {
        let studentId = req.params.studentId;
        if (req.user?.role === 'STUDENT') {
            const student = await Student_js_1.Student.findOne({ user: req.user.userId });
            if (!student) {
                res.status(404).json({ success: false, message: 'Student profile not found.' });
                return;
            }
            studentId = student._id.toString();
        }
        const attendances = await Attendance_js_1.Attendance.find({ 'records.student': studentId })
            .populate('batch', 'name')
            .sort({ date: -1 });
        const history = attendances.map((att) => {
            const record = att.records.find((r) => r.student.toString() === studentId.toString());
            return {
                date: att.date,
                batchName: att.batch?.name,
                topicCovered: att.topicCovered,
                status: record?.status || 'ABSENT',
                remark: record?.remark,
            };
        });
        const totalSessions = history.length;
        const presentSessions = history.filter((h) => h.status === 'PRESENT' || h.status === 'LATE').length;
        const rate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100;
        res.json({
            success: true,
            data: {
                totalSessions,
                presentSessions,
                absentSessions: totalSessions - presentSessions,
                attendanceRate: rate,
                history,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
