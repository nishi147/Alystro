"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCertificates = getCertificates;
exports.verifyCertificate = verifyCertificate;
exports.issueCertificate = issueCertificate;
const qrcode_1 = __importDefault(require("qrcode"));
const Certificate_js_1 = require("../models/Certificate.js");
const Student_js_1 = require("../models/Student.js");
const School_js_1 = require("../models/School.js");
const Program_js_1 = require("../models/Program.js");
const AuditLog_js_1 = require("../models/AuditLog.js");
async function getCertificates(req, res) {
    try {
        const query = {};
        if (['SCHOOL_ADMIN', 'TEACHER'].includes(req.user?.role || '')) {
            query.school = req.schoolId;
        }
        else if (req.user?.role === 'STUDENT') {
            const student = await Student_js_1.Student.findOne({ user: req.user.userId });
            if (student) {
                query.student = student._id;
            }
        }
        else if (req.query.schoolId) {
            query.school = req.query.schoolId;
        }
        const certs = await Certificate_js_1.Certificate.find(query).sort({ issueDate: -1 });
        res.json({ success: true, data: certs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function verifyCertificate(req, res) {
    try {
        const { certificateId } = req.params;
        const cert = await Certificate_js_1.Certificate.findOne({
            certificateId: certificateId.toUpperCase().trim(),
        })
            .populate('school', 'name logo address')
            .populate('program', 'name category durationMonths');
        if (!cert) {
            res.status(404).json({
                success: false,
                valid: false,
                message: 'No official ALYSTRO certificate was found matching this credential identifier.',
            });
            return;
        }
        res.json({
            success: true,
            valid: cert.status === 'VALID',
            data: {
                certificateId: cert.certificateId,
                studentName: cert.studentName,
                schoolName: cert.schoolName,
                programName: cert.programName,
                grade: cert.grade,
                issueDate: cert.issueDate,
                completionDate: cert.completionDate,
                status: cert.status,
                verificationQrCode: cert.verificationQrCode,
                school: cert.school,
                program: cert.program,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function issueCertificate(req, res) {
    try {
        const { studentId, programId, grade = 'Distinction', completionDate } = req.body;
        const student = await Student_js_1.Student.findById(studentId).populate('user').populate('school');
        if (!student) {
            res.status(404).json({ success: false, message: 'Student not found.' });
            return;
        }
        const program = await Program_js_1.Program.findById(programId || student.program);
        if (!program) {
            res.status(404).json({ success: false, message: 'Program not found.' });
            return;
        }
        const school = await School_js_1.School.findById(student.school);
        if (!school) {
            res.status(404).json({ success: false, message: 'School not found.' });
            return;
        }
        // Generate unique ID: ALY-YYYY-XXXXXX
        const year = new Date().getFullYear();
        const randomHex = Math.floor(100000 + Math.random() * 900000);
        const certificateId = `ALY-${year}-${randomHex}`;
        // Verification URL
        const verifyUrl = `${req.protocol}://${req.get('host')}/verify/${certificateId}`;
        const qrCodeDataUrl = await qrcode_1.default.toDataURL(verifyUrl, {
            width: 250,
            margin: 1,
            color: { dark: '#0B1B3D', light: '#FFFFFF' },
        });
        const cert = await Certificate_js_1.Certificate.create({
            certificateId,
            student: student._id,
            studentName: student.user?.name || 'Student',
            school: school._id,
            schoolName: school.name,
            program: program._id,
            programName: program.name,
            grade,
            issueDate: new Date(),
            completionDate: completionDate ? new Date(completionDate) : new Date(),
            verificationQrCode: qrCodeDataUrl,
            status: 'VALID',
            issuedBy: req.user?.userId,
        });
        await AuditLog_js_1.AuditLog.create({
            user: req.user?.userId,
            userName: req.user?.name,
            action: 'ISSUE_CERTIFICATE',
            entity: 'Certificate',
            entityId: cert._id.toString(),
            details: `Issued Certificate ${certificateId} for ${cert.studentName}`,
        });
        res.status(201).json({
            success: true,
            message: 'Certificate generated with verification QR code.',
            data: cert,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
