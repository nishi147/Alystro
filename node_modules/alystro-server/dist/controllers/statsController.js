"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuperAdminStats = getSuperAdminStats;
exports.getSchoolAdminStats = getSchoolAdminStats;
const School_js_1 = require("../models/School.js");
const Student_js_1 = require("../models/Student.js");
const Teacher_js_1 = require("../models/Teacher.js");
const Batch_js_1 = require("../models/Batch.js");
const Program_js_1 = require("../models/Program.js");
const Certificate_js_1 = require("../models/Certificate.js");
const Lead_js_1 = require("../models/Lead.js");
const Assignment_js_1 = require("../models/Assignment.js");
const Notice_js_1 = require("../models/Notice.js");
async function getSuperAdminStats(req, res) {
    try {
        const [totalSchools, activeSchools, totalStudents, activeStudents, totalTeachers, activeBatches, totalPrograms, certificatesIssued, leadsList,] = await Promise.all([
            School_js_1.School.countDocuments(),
            School_js_1.School.countDocuments({ status: 'ACTIVE' }),
            Student_js_1.Student.countDocuments(),
            Student_js_1.Student.countDocuments({ status: 'ACTIVE' }),
            Teacher_js_1.Teacher.countDocuments({ status: 'ACTIVE' }),
            Batch_js_1.Batch.countDocuments({ status: 'ACTIVE' }),
            Program_js_1.Program.countDocuments({ published: true }),
            Certificate_js_1.Certificate.countDocuments({ status: 'VALID' }),
            Lead_js_1.Lead.find().select('status leadSource city createdAt'),
        ]);
        // Aggregate Leads
        const totalLeads = leadsList.length;
        const newLeads = leadsList.filter((l) => l.status === 'NEW').length;
        const scheduledDemos = leadsList.filter((l) => l.status === 'DEMO_SCHEDULED').length;
        const convertedSchools = leadsList.filter((l) => l.status === 'CONVERTED').length;
        // School-wise student breakdown
        const schoolBreakdown = await Student_js_1.Student.aggregate([
            { $match: { status: 'ACTIVE' } },
            { $group: { _id: '$school', count: { $sum: 1 } } },
            { $lookup: { from: 'schools', localField: '_id', foreignField: '_id', as: 'schoolInfo' } },
            { $unwind: '$schoolInfo' },
            { $project: { schoolName: '$schoolInfo.name', count: 1 } },
            { $limit: 6 },
        ]);
        // Monthly enrollment aggregation
        const monthlyEnrollment = await Student_js_1.Student.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $limit: 12 },
        ]);
        // Calculated Revenue estimates based on active students (₹1,500/student/quarter)
        const estimatedQuarterlyRevenue = totalStudents * 1500;
        const pendingPayments = totalSchools > 0 ? (totalSchools - activeSchools) * 45000 : 0;
        res.json({
            success: true,
            data: {
                summary: {
                    totalSchools,
                    activeSchools,
                    totalStudents,
                    activeStudents,
                    totalTeachers,
                    activeBatches,
                    totalPrograms,
                    certificatesIssued,
                    revenue: estimatedQuarterlyRevenue,
                    pendingPayments,
                    totalLeads,
                    newLeads,
                    scheduledDemos,
                    convertedSchools,
                },
                charts: {
                    schoolBreakdown: schoolBreakdown.map((s) => ({
                        name: s.schoolName,
                        students: s.count,
                    })),
                    monthlyEnrollment: monthlyEnrollment.map((m) => ({
                        month: m._id,
                        students: m.count,
                    })),
                    crmFunnel: [
                        { stage: 'New Leads', count: newLeads },
                        { stage: 'Contacted', count: leadsList.filter((l) => l.status === 'CONTACTED').length },
                        { stage: 'Demo Scheduled', count: scheduledDemos },
                        { stage: 'Demo Done', count: leadsList.filter((l) => l.status === 'DEMO_DONE').length },
                        { stage: 'Converted', count: convertedSchools },
                    ],
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function getSchoolAdminStats(req, res) {
    try {
        const schoolId = req.schoolId;
        if (!schoolId) {
            res.status(400).json({ success: false, message: 'School identifier is required.' });
            return;
        }
        const [school, studentsCount, activeStudentsCount, teachersCount, batchesCount, certificatesCount, assignmentsCount, noticesCount,] = await Promise.all([
            School_js_1.School.findById(schoolId),
            Student_js_1.Student.countDocuments({ school: schoolId }),
            Student_js_1.Student.countDocuments({ school: schoolId, status: 'ACTIVE' }),
            Teacher_js_1.Teacher.countDocuments({ school: schoolId }),
            Batch_js_1.Batch.countDocuments({ school: schoolId, status: 'ACTIVE' }),
            Certificate_js_1.Certificate.countDocuments({ school: schoolId, status: 'VALID' }),
            Assignment_js_1.Assignment.countDocuments({ school: schoolId, status: 'ACTIVE' }),
            Notice_js_1.Notice.countDocuments({ school: schoolId }),
        ]);
        // Average attendance rate across students in this school
        const attendanceAgg = await Student_js_1.Student.aggregate([
            { $match: { school: school?._id, status: 'ACTIVE' } },
            { $group: { _id: null, avgRate: { $avg: '$attendanceRate' } } },
        ]);
        const avgAttendance = attendanceAgg[0]?.avgRate || 88.5;
        res.json({
            success: true,
            data: {
                school,
                summary: {
                    studentsCount,
                    activeStudentsCount,
                    teachersCount,
                    batchesCount,
                    certificatesCount,
                    assignmentsCount,
                    noticesCount,
                    averageAttendance: Math.round(avgAttendance),
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
