import { Response } from 'express';
import mongoose from 'mongoose';
import { Program } from '../models/Program.js';
import { School } from '../models/School.js';
import { PartnershipConfig } from '../models/PartnershipConfig.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AuditLog } from '../models/AuditLog.js';

// Helper to ensure standard PartnershipConfig exists in database
async function getOrCreatePartnershipConfig() {
  let config = await PartnershipConfig.findOne({ key: 'standard_partnership_terms' });
  if (!config) {
    config = await PartnershipConfig.create({
      key: 'standard_partnership_terms',
      title: 'ALYSTRO School Partnership Technology Package',
      milestoneStudents: 300,
      combinedValuation: 200000,
      currency: 'INR',
      gstRate: 18,
      benefits: [
        {
          id: 'website',
          title: 'Professional School Website',
          valuation: 50000,
          description: 'Modern mobile-responsive school portal with admissions, announcements, photo gallery, and management system.',
          milestoneStudents: 300,
          isUnlocked: true,
        },
        {
          id: 'mobile_app',
          title: 'School Mobile App',
          valuation: 150000,
          description: 'Custom school-branded mobile application for students, parents, and faculty with attendance and progress tracking.',
          milestoneStudents: 300,
          isUnlocked: true,
        },
      ],
      additionalSupport: [
        'Classroom & Projector Technology Integration Support',
        'Faculty & Computer Teacher Orientation and Co-Hosting Credentials',
        'Student & Guardian Access Provisioning and Parent Progress Alerts',
        'Digital Promotion Guidance & School Enrollment Assistance',
        '10% Institutional Commission on Eligible Enrollments below Milestone',
      ],
    });
  }
  return config;
}

// -----------------------------------------------------------------------
// 1. ADMIN ENDPOINTS (Authenticated SUPER_ADMIN & ADMIN Only)
// -----------------------------------------------------------------------

/**
 * GET /api/v1/pricing/admin/programs
 * Retrieves all program-wise partnership fees, standard values, GST, and standard technology package.
 */
export async function getAdminProgramPricing(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const [programs, partnershipConfig] = await Promise.all([
      Program.find({ published: true })
        .select('_id name slug gradeLevel category durationMonths pricing')
        .sort({ gradeLevel: 1 }),
      getOrCreatePartnershipConfig(),
    ]);

    res.json({
      success: true,
      data: {
        programs,
        partnershipConfig,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * PUT /api/v1/pricing/admin/programs/:id
 * Allows authorized admins to update program pricing in the database.
 */
export async function updateAdminProgramPricing(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { partnerFee, standardValue, gstRate, discountPercent, currency } = req.body;

    const program = await Program.findById(id);
    if (!program) {
      res.status(404).json({ success: false, message: 'Program not found.' });
      return;
    }

    program.pricing = {
      partnerFee: Number(partnerFee) || program.pricing?.partnerFee || 5000,
      standardValue: Number(standardValue) || program.pricing?.standardValue || 10000,
      gstRate: gstRate !== undefined ? Number(gstRate) : (program.pricing?.gstRate ?? 18),
      currency: currency || program.pricing?.currency || 'INR',
      discountPercent: discountPercent !== undefined ? Number(discountPercent) : (program.pricing?.discountPercent ?? 50),
    };

    await program.save();

    await AuditLog.create({
      user: req.user?.userId,
      userName: req.user?.name,
      action: 'UPDATE_PROGRAM_PRICING',
      entity: 'Program',
      entityId: program._id.toString(),
      details: `Updated pricing for ${program.name}: Partner Fee ₹${program.pricing.partnerFee}, Standard ₹${program.pricing.standardValue}`,
    }).catch(() => {});

    res.json({
      success: true,
      message: `Pricing updated successfully for ${program.name}.`,
      data: program,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * PUT /api/v1/pricing/admin/benefits
 * Allows authorized admins to update standard technology package benefits and valuations.
 */
export async function updateAdminPartnershipBenefits(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { title, combinedValuation, milestoneStudents, benefits, additionalSupport, gstRate } = req.body;

    let config = await getOrCreatePartnershipConfig();

    if (title) config.title = title;
    if (combinedValuation !== undefined) config.combinedValuation = Number(combinedValuation);
    if (milestoneStudents !== undefined) config.milestoneStudents = Number(milestoneStudents);
    if (benefits && Array.isArray(benefits)) config.benefits = benefits;
    if (additionalSupport && Array.isArray(additionalSupport)) config.additionalSupport = additionalSupport;
    if (gstRate !== undefined) config.gstRate = Number(gstRate);
    config.updatedBy = req.user?.userId ? new mongoose.Types.ObjectId(req.user.userId) : undefined;

    await config.save();

    await AuditLog.create({
      user: req.user?.userId,
      userName: req.user?.name,
      action: 'UPDATE_PARTNERSHIP_BENEFITS',
      entity: 'PartnershipConfig',
      entityId: config._id.toString(),
      details: `Updated partnership valuation to ₹${config.combinedValuation} with ${config.milestoneStudents}-student milestone.`,
    }).catch(() => {});

    res.json({
      success: true,
      message: 'Partnership technology valuations and benefits updated successfully.',
      data: config,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/v1/pricing/admin/schools
 * Lists all partner schools along with their negotiated commercial terms and billing status.
 */
export async function getAdminSchoolCommercials(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const schools = await School.find()
      .select('_id name code slug status contactPerson commercialTerms paymentStatus')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: schools,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * PUT /api/v1/pricing/admin/schools/:schoolId
 * Updates school-specific agreed program fees (negotiated rates), terms, or billing records.
 */
export async function updateAdminSchoolCommercials(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { schoolId } = req.params;
    const { commercialTerms, paymentStatus } = req.body;

    const school = await School.findById(schoolId);
    if (!school) {
      res.status(404).json({ success: false, message: 'School not found.' });
      return;
    }

    if (commercialTerms) {
      school.commercialTerms = {
        ...school.commercialTerms,
        ...commercialTerms,
      };
    }

    if (paymentStatus) {
      school.paymentStatus = paymentStatus;
      if (school.commercialTerms?.billing) {
        school.commercialTerms.billing.paymentStatus = paymentStatus;
      }
    }

    await school.save();

    await AuditLog.create({
      user: req.user?.userId,
      userName: req.user?.name,
      action: 'UPDATE_SCHOOL_COMMERCIALS',
      entity: 'School',
      entityId: school._id.toString(),
      details: `Updated commercial terms & billing for ${school.name} (${school.code})`,
    }).catch(() => {});

    res.json({
      success: true,
      message: `Commercial terms updated successfully for ${school.name}.`,
      data: school,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// -----------------------------------------------------------------------
// 2. SCHOOL TENANT ENDPOINTS (Authenticated & Enforced to Own School)
// -----------------------------------------------------------------------

/**
 * GET /api/v1/pricing/school/my-terms
 * Returns strictly the authenticated school's agreed plan, negotiated fees, GST, invoices, and benefits.
 * - Single-tenant isolation is strictly enforced on the server.
 * - Pending or unapproved schools receive 403 Forbidden.
 */
export async function getSchoolMyTerms(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    let targetSchoolId: string | undefined;

    if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN') {
      // Super Admin viewing a school's terms
      targetSchoolId = (req.query.schoolId as string) || (req.user.schoolId ? req.user.schoolId.toString() : undefined);
      if (!targetSchoolId) {
        // Fallback to first active school if none specified
        const firstActive = await School.findOne({ status: 'ACTIVE' });
        targetSchoolId = firstActive?._id.toString();
      }
    } else if (req.user.role === 'SCHOOL_ADMIN') {
      // School Admin: STRICTLY enforce their own assigned schoolId
      if (!req.user.schoolId) {
        res.status(403).json({
          success: false,
          message: 'Access denied: User account is not assigned to an active partner school tenant.',
        });
        return;
      }
      targetSchoolId = req.user.schoolId.toString();
    } else {
      res.status(403).json({
        success: false,
        message: 'Access denied: Your account role is not authorized to view commercial records.',
      });
      return;
    }

    if (!targetSchoolId) {
      res.status(404).json({ success: false, message: 'No school tenant identifier found.' });
      return;
    }

    const school = await School.findById(targetSchoolId)
      .select('name code slug status address contactPerson paymentStatus commercialTerms');

    if (!school) {
      res.status(404).json({ success: false, message: 'School tenant not found.' });
      return;
    }

    // Security Check: Pending or unapproved schools must not gain access to restricted commercial records
    if (['PENDING_APPROVAL', 'REJECTED', 'SUSPENDED', 'ARCHIVED'].includes(school.status)) {
      res.status(403).json({
        success: false,
        message: 'Access restricted: Commercial agreements and billing records are only accessible to approved partner schools.',
        status: school.status,
      });
      return;
    }

    // Default terms generator if commercialTerms not yet populated
    let terms = school.commercialTerms;
    if (!terms || !terms.agreedProgramFees || terms.agreedProgramFees.length === 0) {
      const programs = await Program.find({ published: true }).select('_id name gradeLevel pricing');
      const agreedProgramFees = programs.map((p) => ({
        programId: p._id,
        programName: p.name,
        gradeLevel: p.gradeLevel === 'CLASS_6_8' ? 'Classes 6–7 (Foundation)' : p.gradeLevel === 'CLASS_9_10' ? 'Classes 8–10 (Skill Development)' : 'Classes 11–12 (Advanced & Career Ready)',
        standardFee: p.pricing?.partnerFee || 5000,
        negotiatedFee: p.pricing?.partnerFee || 5000,
        gstRate: p.pricing?.gstRate || 18,
      }));

      terms = {
        planName: 'ALYSTRO School Partnership Agreement (Standard)',
        enrollmentMilestone: 300,
        agreedProgramFees,
        technologyBenefits: [
          {
            id: 'website',
            title: 'Professional School Website',
            valuation: 50000,
            status: 'ACTIVE',
          },
          {
            id: 'mobile_app',
            title: 'School Mobile App',
            valuation: 150000,
            status: 'ACTIVE',
          },
        ],
        totalValuation: 200000,
        billing: {
          totalBilledAmount: 0,
          paidAmount: 0,
          outstandingBalance: 0,
          paymentStatus: school.paymentStatus || 'PENDING',
          invoices: [],
          paymentHistory: [],
        },
      };

      // Persist defaults
      school.commercialTerms = terms;
      await school.save();
    }

    res.json({
      success: true,
      data: {
        schoolId: school._id,
        schoolName: school.name,
        schoolCode: school.code,
        status: school.status,
        contactPerson: school.contactPerson,
        commercialTerms: terms,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
