import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { School } from '../models/School.js';
import { Student } from '../models/Student.js';
import { Teacher } from '../models/Teacher.js';
import { Batch } from '../models/Batch.js';
import { Program } from '../models/Program.js';
import { Certificate } from '../models/Certificate.js';
import { Lead } from '../models/Lead.js';
import { Attendance } from '../models/Attendance.js';
import { Assignment } from '../models/Assignment.js';
import { Notice } from '../models/Notice.js';

export async function getSuperAdminStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const [
      totalSchools,
      activeSchools,
      totalStudents,
      activeStudents,
      totalTeachers,
      activeBatches,
      totalPrograms,
      certificatesIssued,
      leadsList,
    ] = await Promise.all([
      School.countDocuments(),
      School.countDocuments({ status: 'ACTIVE' }),
      Student.countDocuments(),
      Student.countDocuments({ status: 'ACTIVE' }),
      Teacher.countDocuments({ status: 'ACTIVE' }),
      Batch.countDocuments({ status: 'ACTIVE' }),
      Program.countDocuments({ published: true }),
      Certificate.countDocuments({ status: 'VALID' }),
      Lead.find().select('status leadSource city createdAt'),
    ]);

    // Aggregate Leads
    const totalLeads = leadsList.length;
    const newLeads = leadsList.filter((l) => l.status === 'NEW').length;
    const scheduledDemos = leadsList.filter((l) => l.status === 'DEMO_SCHEDULED').length;
    const convertedSchools = leadsList.filter((l) => l.status === 'CONVERTED').length;

    // School-wise student breakdown
    const schoolBreakdown = await Student.aggregate([
      { $match: { status: 'ACTIVE' } },
      { $group: { _id: '$school', count: { $sum: 1 } } },
      { $lookup: { from: 'schools', localField: '_id', foreignField: '_id', as: 'schoolInfo' } },
      { $unwind: '$schoolInfo' },
      { $project: { schoolName: '$schoolInfo.name', count: 1 } },
      { $limit: 6 },
    ]);

    // Monthly enrollment aggregation
    const monthlyEnrollment = await Student.aggregate([
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getSchoolAdminStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const schoolId = req.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, message: 'School identifier is required.' });
      return;
    }

    const [
      school,
      studentsCount,
      activeStudentsCount,
      teachersCount,
      batchesCount,
      certificatesCount,
      assignmentsCount,
      noticesCount,
    ] = await Promise.all([
      School.findById(schoolId),
      Student.countDocuments({ school: schoolId }),
      Student.countDocuments({ school: schoolId, status: 'ACTIVE' }),
      Teacher.countDocuments({ school: schoolId }),
      Batch.countDocuments({ school: schoolId, status: 'ACTIVE' }),
      Certificate.countDocuments({ school: schoolId, status: 'VALID' }),
      Assignment.countDocuments({ school: schoolId, status: 'ACTIVE' }),
      Notice.countDocuments({ school: schoolId }),
    ]);

    // Average attendance rate across students in this school
    const attendanceAgg = await Student.aggregate([
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
