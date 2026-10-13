"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudents = getStudents;
exports.getStudentById = getStudentById;
exports.createStudent = createStudent;
exports.bulkImportStudents = bulkImportStudents;
exports.updateStudent = updateStudent;
const Student_js_1 = require("../models/Student.js");
const User_js_1 = require("../models/User.js");
const Batch_js_1 = require("../models/Batch.js");
const School_js_1 = require("../models/School.js");
const password_js_1 = require("../utils/password.js");
async function getStudents(req, res) {
    try {
        const { batchId, grade, search, page = 1, limit = 20 } = req.query;
        const query = {};
        // Tenant isolation
        if (['SCHOOL_ADMIN', 'TEACHER'].includes(req.user?.role || '')) {
            query.school = req.schoolId;
        }
        else if (req.query.schoolId) {
            query.school = req.query.schoolId;
        }
        if (batchId)
            query.batch = batchId;
        if (grade)
            query.grade = grade;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const [students, total] = await Promise.all([
            Student_js_1.Student.find(query)
                .populate('user', 'name email phone avatar status')
                .populate('batch', 'name grade section')
                .populate('school', 'name code')
                .populate('program', 'name category')
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            Student_js_1.Student.countDocuments(query),
        ]);
        // Format for frontend
        const formatted = students
            .filter((s) => s.user)
            .map((s) => ({
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
            attendanceRate: s.attendanceRate || 85,
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function getStudentById(req, res) {
    try {
        const student = await Student_js_1.Student.findById(req.params.id)
            .populate('user', 'name email phone avatar status')
            .populate('batch')
            .populate('school', 'name code logo')
            .populate('program');
        if (!student) {
            res.status(404).json({ success: false, message: 'Student not found.' });
            return;
        }
        // Tenant check
        if (['SCHOOL_ADMIN', 'TEACHER'].includes(req.user?.role || '') &&
            student.school._id.toString() !== req.schoolId?.toString()) {
            res.status(403).json({ success: false, message: 'Unauthorized access to student record.' });
            return;
        }
        res.json({ success: true, data: student });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function createStudent(req, res) {
    try {
        const { name, email, password = 'Student@123', schoolId: requestedSchoolId, batchId, programId, rollNumber, grade, section = 'A', parentName, parentPhone, parentEmail, } = req.body;
        const schoolId = req.schoolId || requestedSchoolId;
        if (!schoolId) {
            res.status(400).json({ success: false, message: 'School ID is required.' });
            return;
        }
        // Check existing email
        const existingUser = await User_js_1.User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            res.status(409).json({ success: false, message: 'User with this email already exists.' });
            return;
        }
        const hashedPassword = await (0, password_js_1.hashPassword)(password);
        const user = await User_js_1.User.create({
            name,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: 'STUDENT',
            school: schoolId,
            phone: parentPhone,
            status: 'ACTIVE',
        });
        const student = await Student_js_1.Student.create({
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
            await Batch_js_1.Batch.findByIdAndUpdate(batchId, { $inc: { currentStudentCount: 1 } });
        }
        await School_js_1.School.findByIdAndUpdate(schoolId, { $inc: { activeStudentCount: 1 } });
        res.status(201).json({
            success: true,
            message: 'Student enrolled and portal access created.',
            data: student,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function bulkImportStudents(req, res) {
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
            errors: [],
        };
        const defaultHashedPassword = await (0, password_js_1.hashPassword)('Student@123');
        for (let i = 0; i < rawRows.length; i++) {
            const row = rawRows[i];
            try {
                if (!row.name || !row.email || !row.rollNumber || !row.grade) {
                    results.failedCount++;
                    results.errors.push({
                        row: i + 1,
                        name: row.name || 'Unknown',
                        error: 'Missing required fields: name, email, rollNumber, or grade.',
                    });
                    continue;
                }
                const existing = await User_js_1.User.findOne({ email: row.email.toLowerCase().trim() });
                if (existing) {
                    results.failedCount++;
                    results.errors.push({
                        row: i + 1,
                        name: row.name,
                        error: `Email ${row.email} is already in use.`,
                    });
                    continue;
                }
                const user = await User_js_1.User.create({
                    name: row.name,
                    email: row.email.toLowerCase().trim(),
                    password: defaultHashedPassword,
                    role: 'STUDENT',
                    school: schoolId,
                    phone: row.parentPhone || row.phone,
                    status: 'ACTIVE',
                });
                await Student_js_1.Student.create({
                    user: user._id,
                    school: schoolId,
                    batch: row.batchId || batchId,
                    program: row.programId || programId,
                    rollNumber: row.rollNumber,
                    grade: row.grade,
                    section: row.section || 'A',
                    parentName: row.parentName,
                    parentPhone: row.parentPhone,
                    status: 'ACTIVE',
                });
                results.successCount++;
            }
            catch (err) {
                results.failedCount++;
                results.errors.push({ row: i + 1, name: row.name || 'Row', error: err.message });
            }
        }
        await School_js_1.School.findByIdAndUpdate(schoolId, { $inc: { activeStudentCount: results.successCount } });
        if (batchId && results.successCount > 0) {
            await Batch_js_1.Batch.findByIdAndUpdate(batchId, { $inc: { currentStudentCount: results.successCount } });
        }
        res.json({
            success: true,
            message: `Bulk import finished: ${results.successCount} imported successfully, ${results.failedCount} skipped.`,
            data: results,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function updateStudent(req, res) {
    try {
        const student = await Student_js_1.Student.findById(req.params.id);
        if (!student) {
            res.status(404).json({ success: false, message: 'Student not found.' });
            return;
        }
        if (['SCHOOL_ADMIN', 'TEACHER'].includes(req.user?.role || '') &&
            student.school.toString() !== req.schoolId?.toString()) {
            res.status(403).json({ success: false, message: 'Forbidden: Cross-tenant modification denied.' });
            return;
        }
        const { name, phone, rollNumber, grade, section, parentName, parentPhone, batchId, status } = req.body;
        if (name || phone) {
            await User_js_1.User.findByIdAndUpdate(student.user, {
                ...(name && { name }),
                ...(phone && { phone }),
            });
        }
        student.rollNumber = rollNumber || student.rollNumber;
        student.grade = grade || student.grade;
        student.section = section || student.section;
        student.parentName = parentName || student.parentName;
        student.parentPhone = parentPhone || student.parentPhone;
        if (batchId)
            student.batch = batchId;
        if (status)
            student.status = status;
        await student.save();
        res.json({ success: true, message: 'Student details updated successfully.', data: student });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
