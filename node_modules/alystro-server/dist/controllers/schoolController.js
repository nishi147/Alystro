"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchools = getSchools;
exports.getSchoolBySlug = getSchoolBySlug;
exports.getSchoolById = getSchoolById;
exports.createSchool = createSchool;
exports.updateSchool = updateSchool;
exports.deleteSchool = deleteSchool;
const School_js_1 = require("../models/School.js");
const User_js_1 = require("../models/User.js");
const Student_js_1 = require("../models/Student.js");
const Batch_js_1 = require("../models/Batch.js");
const AuditLog_js_1 = require("../models/AuditLog.js");
const password_js_1 = require("../utils/password.js");
async function getSchools(req, res) {
    try {
        const { search, status, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status) {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { 'address.city': { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
            ];
        }
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const [schools, total] = await Promise.all([
            School_js_1.School.find(query)
                .populate('programsEnrolled', 'name slug category')
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            School_js_1.School.countDocuments(query),
        ]);
        res.json({
            success: true,
            data: schools,
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
async function getSchoolBySlug(req, res) {
    try {
        const { slug } = req.params;
        const school = await School_js_1.School.findOne({ slug: slug.toLowerCase() }).populate('programsEnrolled', 'name slug gradeLevel category description syllabus features');
        if (!school) {
            res.status(404).json({ success: false, message: 'School not found.' });
            return;
        }
        // Fetch school batches and student count
        const [batches, studentsCount] = await Promise.all([
            Batch_js_1.Batch.find({ school: school._id, status: 'ACTIVE' }).populate('program', 'name category'),
            Student_js_1.Student.countDocuments({ school: school._id, status: 'ACTIVE' }),
        ]);
        res.json({
            success: true,
            data: {
                school,
                batches,
                activeStudents: studentsCount,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function getSchoolById(req, res) {
    try {
        const school = await School_js_1.School.findById(req.params.id).populate('programsEnrolled');
        if (!school) {
            res.status(404).json({ success: false, message: 'School not found.' });
            return;
        }
        res.json({ success: true, data: school });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function createSchool(req, res) {
    try {
        const { name, address, contactPerson, classesServed, studentCapacity, programsEnrolled, adminEmail, adminPassword, } = req.body;
        // Generate slug
        let baseSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        let slug = baseSlug;
        let counter = 1;
        while (await School_js_1.School.findOne({ slug })) {
            slug = `${baseSlug}-${counter++}`;
        }
        // Generate unique school code
        const randomCodeSuffix = Math.floor(100 + Math.random() * 900);
        const code = `${name.slice(0, 3).toUpperCase()}-${randomCodeSuffix}`;
        const school = await School_js_1.School.create({
            name,
            slug,
            code,
            address,
            contactPerson,
            classesServed: classesServed || ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
            studentCapacity: studentCapacity || 500,
            programsEnrolled: programsEnrolled || [],
            status: 'ACTIVE',
        });
        // Automatically create School Admin user account
        if (adminEmail && adminPassword) {
            const hashedPassword = await (0, password_js_1.hashPassword)(adminPassword);
            await User_js_1.User.create({
                name: contactPerson.name || `${name} Admin`,
                email: adminEmail.toLowerCase().trim(),
                password: hashedPassword,
                role: 'SCHOOL_ADMIN',
                school: school._id,
                phone: contactPerson.phone,
                status: 'ACTIVE',
            });
        }
        await AuditLog_js_1.AuditLog.create({
            user: req.user?.userId,
            userName: req.user?.name,
            action: 'CREATE_SCHOOL',
            entity: 'School',
            entityId: school._id.toString(),
            details: `Created new school: ${school.name} (${school.code})`,
        });
        res.status(201).json({
            success: true,
            message: 'School created successfully with dedicated admin credentials.',
            data: school,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function updateSchool(req, res) {
    try {
        const school = await School_js_1.School.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!school) {
            res.status(404).json({ success: false, message: 'School not found.' });
            return;
        }
        await AuditLog_js_1.AuditLog.create({
            user: req.user?.userId,
            userName: req.user?.name,
            action: 'UPDATE_SCHOOL',
            entity: 'School',
            entityId: school._id.toString(),
            details: `Updated school settings for ${school.name}`,
        });
        res.json({ success: true, message: 'School updated successfully.', data: school });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function deleteSchool(req, res) {
    try {
        // Safe deactivation / archiving
        const school = await School_js_1.School.findByIdAndUpdate(req.params.id, { status: 'ARCHIVED' }, { new: true });
        if (!school) {
            res.status(404).json({ success: false, message: 'School not found.' });
            return;
        }
        // Set associated users to INACTIVE
        await User_js_1.User.updateMany({ school: school._id }, { status: 'INACTIVE' });
        await AuditLog_js_1.AuditLog.create({
            user: req.user?.userId,
            userName: req.user?.name,
            action: 'ARCHIVE_SCHOOL',
            entity: 'School',
            entityId: school._id.toString(),
            details: `Archived school: ${school.name}`,
        });
        res.json({ success: true, message: 'School archived and associated users suspended.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
