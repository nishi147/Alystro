"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeachers = getTeachers;
exports.createTeacher = createTeacher;
const Teacher_js_1 = require("../models/Teacher.js");
const User_js_1 = require("../models/User.js");
const password_js_1 = require("../utils/password.js");
async function getTeachers(req, res) {
    try {
        const query = {};
        if (['SCHOOL_ADMIN', 'TEACHER'].includes(req.user?.role || '')) {
            query.school = req.schoolId;
        }
        else if (req.query.schoolId) {
            query.school = req.query.schoolId;
        }
        const teachers = await Teacher_js_1.Teacher.find(query)
            .populate('user', 'name email phone avatar status lastLogin')
            .populate('assignedBatches', 'name grade section meetingLink')
            .populate('school', 'name code');
        const formatted = teachers
            .filter((t) => t.user)
            .map((t) => ({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function createTeacher(req, res) {
    try {
        const { name, email, password = 'Teacher@123', phone, specialization, qualification, assignedBatches } = req.body;
        const schoolId = req.schoolId || req.body.schoolId;
        if (!schoolId) {
            res.status(400).json({ success: false, message: 'School identifier is required.' });
            return;
        }
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
            role: 'TEACHER',
            school: schoolId,
            phone,
            status: 'ACTIVE',
        });
        const teacher = await Teacher_js_1.Teacher.create({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
