import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { SchoolApplication } from '../models/SchoolApplication.js';
import { AffiliationRequest } from '../models/AffiliationRequest.js';
import { School } from '../models/School.js';
import { User } from '../models/User.js';
import { Teacher } from '../models/Teacher.js';
import { Student } from '../models/Student.js';
import { AuditLog } from '../models/AuditLog.js';

// GET /api/v1/schools/public-list
// Public dropdown endpoint for Teacher & Student signups
export async function getPublicSchoolsList(req: any, res: Response): Promise<void> {
  try {
    const schools = await School.find({ status: 'ACTIVE' })
      .select('_id name code slug address logo')
      .sort({ name: 1 })
      .lean();

    res.json({
      success: true,
      data: schools.map((s) => ({
        _id: s._id,
        name: s.name,
        code: s.code,
        slug: s.slug,
        city: s.address?.city || '',
        state: s.address?.state || '',
        logo: s.logo,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/v1/admin/school-applications
// Super Admin lists school registration requests
export async function getSchoolApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status && status !== 'ALL') {
      filter.status = status;
    }

    const applications = await SchoolApplication.find(filter)
      .populate('adminUser', 'name email phone status')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: applications,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/v1/admin/school-applications/:id
export async function getSchoolApplicationById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const application = await SchoolApplication.findById(req.params.id)
      .populate('adminUser', 'name email phone status')
      .populate('approvedBy', 'name email')
      .populate('createdSchool');

    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/v1/admin/school-applications/:id/approve
export async function approveSchoolApplication(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const application = await SchoolApplication.findById(req.params.id);
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }

    if (application.status === 'APPROVED') {
      res.status(400).json({ success: false, message: 'This application has already been approved.' });
      return;
    }

    // Generate unique slug
    let baseSlug = application.schoolName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await School.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // Generate unique school code
    const cleanPrefix = application.schoolName.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'SCH';
    const code = `${cleanPrefix}-${Math.floor(100 + Math.random() * 900)}`;

    // Create the active School tenant
    const school = await School.create({
      name: application.schoolName,
      slug,
      code,
      address: {
        street: application.address,
        city: application.city,
        state: application.state,
        country: 'India',
      },
      contactPerson: {
        name: application.contactPersonName,
        designation: application.contactPersonDesignation || 'Principal',
        phone: application.schoolPhone,
        email: application.schoolEmail,
      },
      classesServed: application.classesOffered && application.classesOffered.length > 0
        ? application.classesOffered
        : ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
      studentCapacity: application.studentCount || 500,
      programsEnrolled: [],
      status: 'ACTIVE',
    });

    // Activate the School Admin user account and link to created school
    await User.findByIdAndUpdate(application.adminUser, {
      status: 'ACTIVE',
      school: school._id,
      schoolAffiliationStatus: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: req.user?.userId,
      rejectionReason: undefined,
    });

    // Update the application record
    application.status = 'APPROVED';
    application.approvedAt = new Date();
    application.approvedBy = req.user?.userId as any;
    application.createdSchool = school._id as any;
    application.rejectionReason = undefined;
    await application.save();

    await AuditLog.create({
      user: req.user?.userId,
      userName: req.user?.name,
      action: 'APPROVE_SCHOOL_APPLICATION',
      entity: 'School',
      entityId: school._id.toString(),
      details: `Approved school application "${application.schoolName}" (${school.code}) and activated School Admin account`,
    }).catch(() => {});

    res.json({
      success: true,
      message: `School "${application.schoolName}" approved successfully. School Admin account activated.`,
      data: {
        school,
        application,
      },
    });
  } catch (error: any) {
    console.error('[approveSchoolApplication] Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to approve school application.' });
  }
}

// POST /api/v1/admin/school-applications/:id/reject
export async function rejectSchoolApplication(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { reason } = req.body;
    const application = await SchoolApplication.findById(req.params.id);
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }

    const rejectionReason = reason && reason.trim() ? reason.trim() : 'Application did not meet onboarding criteria.';

    // Set application status to REJECTED
    application.status = 'REJECTED';
    application.rejectionReason = rejectionReason;
    application.rejectedAt = new Date();
    application.rejectedBy = req.user?.userId as any;
    await application.save();

    // Set user account status to REJECTED
    await User.findByIdAndUpdate(application.adminUser, {
      status: 'REJECTED',
      rejectionReason,
    });

    await AuditLog.create({
      user: req.user?.userId,
      userName: req.user?.name,
      action: 'REJECT_SCHOOL_APPLICATION',
      entity: 'SchoolApplication',
      entityId: application._id.toString(),
      details: `Rejected school application "${application.schoolName}". Reason: ${rejectionReason}`,
    }).catch(() => {});

    res.json({
      success: true,
      message: `Application for "${application.schoolName}" rejected.`,
      data: application,
    });
  } catch (error: any) {
    console.error('[rejectSchoolApplication] Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to reject school application.' });
  }
}

// POST /api/v1/admin/school-applications/:id/request-info
export async function requestMoreInfoApplication(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { notes } = req.body;
    const application = await SchoolApplication.findById(req.params.id);
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }

    application.notes = notes ? notes.trim() : 'Additional academic and affiliation documentation requested.';
    await application.save();

    res.json({
      success: true,
      message: 'Information request recorded on application.',
      data: application,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/v1/school-admin/affiliations
// School Admin or Super Admin lists affiliation requests
export async function getAffiliationRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const filter: any = {};

    // If School Admin, scope to their school
    if (req.user?.role === 'SCHOOL_ADMIN' && req.user.schoolId) {
      filter.school = req.user.schoolId;
    }

    const { status, role } = req.query;
    if (status && status !== 'ALL') filter.status = status;
    if (role && role !== 'ALL') filter.role = role;

    const requests = await AffiliationRequest.find(filter)
      .populate('user', 'name email phone avatar status')
      .populate('school', 'name code city state')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/v1/school-admin/affiliations/:id/approve
export async function approveAffiliation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const affiliation = await AffiliationRequest.findById(req.params.id);
    if (!affiliation) {
      res.status(404).json({ success: false, message: 'Affiliation request not found.' });
      return;
    }

    // Check authority: must be Super Admin or School Admin of the matching school
    if (
      req.user?.role !== 'SUPER_ADMIN' &&
      req.user?.role !== 'ADMIN' &&
      (!req.user?.schoolId || affiliation.school?.toString() !== req.user.schoolId)
    ) {
      res.status(403).json({ success: false, message: 'Forbidden: You cannot approve affiliations for another institution.' });
      return;
    }

    const targetSchoolId = affiliation.school || req.user?.schoolId;
    if (!targetSchoolId) {
      res.status(400).json({ success: false, message: 'Cannot approve affiliation without an assigned school tenant.' });
      return;
    }

    // Activate the User account
    await User.findByIdAndUpdate(affiliation.user, {
      status: 'ACTIVE',
      school: targetSchoolId,
      schoolAffiliationStatus: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: req.user?.userId,
      rejectionReason: undefined,
    });

    // Create role record (Teacher or Student) if not already created
    if (affiliation.role === 'TEACHER') {
      const existingTeacher = await Teacher.findOne({ user: affiliation.user });
      if (!existingTeacher) {
        await Teacher.create({
          user: affiliation.user,
          school: targetSchoolId,
          qualification: affiliation.details?.qualification,
          assignedBatches: [],
          status: 'ACTIVE',
        });
      } else {
        existingTeacher.status = 'ACTIVE';
        existingTeacher.school = targetSchoolId as any;
        await existingTeacher.save();
      }
    } else if (affiliation.role === 'STUDENT') {
      const existingStudent = await Student.findOne({ user: affiliation.user });
      if (!existingStudent) {
        const studentCount = await Student.countDocuments({ school: targetSchoolId });
        await Student.create({
          user: affiliation.user,
          school: targetSchoolId,
          rollNumber: `STU-${100 + studentCount + 1}`,
          grade: affiliation.details?.grade || 'Class 8',
          section: 'A',
          parentName: affiliation.details?.parentName,
          parentPhone: affiliation.details?.parentPhone,
          status: 'ACTIVE',
        });
      } else {
        existingStudent.status = 'ACTIVE';
        existingStudent.school = targetSchoolId as any;
        await existingStudent.save();
      }
    }

    affiliation.status = 'APPROVED';
    affiliation.reviewedBy = req.user?.userId as any;
    affiliation.reviewedAt = new Date();
    affiliation.rejectionReason = undefined;
    await affiliation.save();

    await AuditLog.create({
      user: req.user?.userId,
      userName: req.user?.name,
      action: 'APPROVE_AFFILIATION',
      entity: 'AffiliationRequest',
      entityId: affiliation._id.toString(),
      details: `Approved ${affiliation.role} affiliation for user ${affiliation.user}`,
    }).catch(() => {});

    res.json({
      success: true,
      message: `${affiliation.role} affiliation approved successfully. User account activated.`,
      data: affiliation,
    });
  } catch (error: any) {
    console.error('[approveAffiliation] Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to approve affiliation.' });
  }
}

// POST /api/v1/school-admin/affiliations/:id/reject
export async function rejectAffiliation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { reason } = req.body;
    const affiliation = await AffiliationRequest.findById(req.params.id);
    if (!affiliation) {
      res.status(404).json({ success: false, message: 'Affiliation request not found.' });
      return;
    }

    if (
      req.user?.role !== 'SUPER_ADMIN' &&
      req.user?.role !== 'ADMIN' &&
      (!req.user?.schoolId || affiliation.school?.toString() !== req.user.schoolId)
    ) {
      res.status(403).json({ success: false, message: 'Forbidden: You cannot reject affiliations for another institution.' });
      return;
    }

    const rejectionReason = reason && reason.trim() ? reason.trim() : 'Affiliation request was not accepted by school authority.';

    affiliation.status = 'REJECTED';
    affiliation.rejectionReason = rejectionReason;
    affiliation.reviewedBy = req.user?.userId as any;
    affiliation.reviewedAt = new Date();
    await affiliation.save();

    await User.findByIdAndUpdate(affiliation.user, {
      status: 'REJECTED',
      schoolAffiliationStatus: 'REJECTED',
      rejectionReason,
    });

    await AuditLog.create({
      user: req.user?.userId,
      userName: req.user?.name,
      action: 'REJECT_AFFILIATION',
      entity: 'AffiliationRequest',
      entityId: affiliation._id.toString(),
      details: `Rejected ${affiliation.role} affiliation. Reason: ${rejectionReason}`,
    }).catch(() => {});

    res.json({
      success: true,
      message: `${affiliation.role} affiliation request rejected.`,
      data: affiliation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to reject affiliation.' });
  }
}
