import { Request, Response } from 'express';
import { School } from '../models/School.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Batch } from '../models/Batch.js';
import { Program } from '../models/Program.js';
import { AuditLog } from '../models/AuditLog.js';
import { hashPassword } from '../utils/password.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getSchools(req: Request, res: Response): Promise<void> {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query: any = {};

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

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const [schools, total] = await Promise.all([
      School.find(query)
        .populate('programsEnrolled', 'name slug category')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      School.countDocuments(query),
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getSchoolBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const school = await School.findOne({ slug: slug.toLowerCase() })
      .select('-commercialTerms')
      .populate(
        'programsEnrolled',
        'name slug gradeLevel category description syllabus features'
      );

    if (!school) {
      res.status(404).json({ success: false, message: 'School not found.' });
      return;
    }

    // Fetch school batches and student count
    const [batches, studentsCount] = await Promise.all([
      Batch.find({ school: school._id, status: 'ACTIVE' }).populate('program', 'name category'),
      Student.countDocuments({ school: school._id, status: 'ACTIVE' }),
    ]);

    res.json({
      success: true,
      data: {
        school,
        batches,
        activeStudents: studentsCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getSchoolById(req: Request, res: Response): Promise<void> {
  try {
    const school = await School.findById(req.params.id)
      .select('-commercialTerms')
      .populate('programsEnrolled');
    if (!school) {
      res.status(404).json({ success: false, message: 'School not found.' });
      return;
    }
    res.json({ success: true, data: school });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createSchool(req: AuthenticatedRequest, res: Response): Promise<void> {
  let createdSchool: any = null;
  try {
    const {
      name,
      address,
      contactPerson,
      classesServed,
      studentCapacity,
      programsEnrolled,
      adminEmail,
      adminPassword,
    } = req.body;

    // Validate school name
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ success: false, message: 'School name is required.' });
      return;
    }

    // Check duplicate school name
    const escapedName = name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existingSchool = await School.findOne({ name: { $regex: `^${escapedName}$`, $options: 'i' } });
    if (existingSchool) {
      res.status(409).json({ success: false, message: `A partner school named "${name.trim()}" is already registered.` });
      return;
    }

    // Validate address
    if (!address || !address.city || !address.state) {
      res.status(400).json({ success: false, message: 'School city and state are required.' });
      return;
    }

    // Validate contact person
    if (!contactPerson || !contactPerson.name || !contactPerson.phone) {
      res.status(400).json({ success: false, message: 'Contact person name and phone number are required.' });
      return;
    }

    const effectiveContactEmail = (contactPerson.email || adminEmail || '').trim().toLowerCase();
    if (!effectiveContactEmail) {
      res.status(400).json({ success: false, message: 'A contact email address is required.' });
      return;
    }

    const normalizedAdminEmail = (adminEmail || effectiveContactEmail).toLowerCase().trim();

    // Check if an account with this admin email is already registered
    const existingUser = await User.findOne({ email: normalizedAdminEmail });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: `An account with email "${normalizedAdminEmail}" already exists. Please choose a different school admin email.`,
      });
      return;
    }

    // Generate unique slug
    let baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await School.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // Generate unique school code
    const cleanPrefix = name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'SCH';
    const randomCodeSuffix = Math.floor(100 + Math.random() * 900);
    const code = `${cleanPrefix}-${randomCodeSuffix}`;

    try {
      createdSchool = await School.create({
        name: name.trim(),
        slug,
        code,
        address: {
          street: address.street || '',
          city: address.city.trim(),
          state: address.state.trim(),
          pincode: address.pincode || '',
          country: address.country || 'India',
        },
        contactPerson: {
          name: contactPerson.name.trim(),
          phone: contactPerson.phone.trim(),
          email: effectiveContactEmail,
          designation: contactPerson.designation || 'Principal',
        },
        classesServed: classesServed || ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
        studentCapacity: Number(studentCapacity) || 500,
        programsEnrolled: programsEnrolled || [],
        status: 'ACTIVE',
      });

      // Automatically create School Admin user account
      const effectivePassword = adminPassword && adminPassword.trim() ? adminPassword.trim() : 'School@123';
      const hashedPassword = await hashPassword(effectivePassword);

      await User.create({
        name: contactPerson.name.trim() || `${name.trim()} Admin`,
        email: normalizedAdminEmail,
        password: hashedPassword,
        role: 'SCHOOL_ADMIN',
        school: createdSchool._id,
        phone: contactPerson.phone.trim(),
        status: 'ACTIVE',
      });

      await AuditLog.create({
        user: req.user?.userId,
        userName: req.user?.name,
        action: 'CREATE_SCHOOL',
        entity: 'School',
        entityId: createdSchool._id.toString(),
        details: `Created new school: ${createdSchool.name} (${createdSchool.code}) with admin: ${normalizedAdminEmail}`,
      }).catch((logErr) => console.warn('[AuditLog] Non-critical audit log write warning:', logErr.message));

      res.status(201).json({
        success: true,
        message: 'School created successfully with dedicated admin credentials.',
        data: createdSchool,
      });
    } catch (innerError: any) {
      // Safe rollback: clean up orphaned school record if user provisioning fails
      if (createdSchool && createdSchool._id) {
        try {
          await School.findByIdAndDelete(createdSchool._id);
        } catch (cleanupErr: any) {
          console.error('[createSchool] Rollback cleanup failed:', cleanupErr.message);
        }
      }
      throw innerError;
    }
  } catch (error: any) {
    console.error('[createSchool] Error:', error.message);
    if (error.code === 11000) {
      const dupField = Object.keys(error.keyPattern || {})[0] || 'field';
      res.status(409).json({
        success: false,
        message: `A record with this ${dupField} already exists in the system.`,
      });
      return;
    }
    if (error.name === 'ValidationError') {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to create school tenant.' });
  }
}

export async function updateSchool(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const school = await School.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!school) {
      res.status(404).json({ success: false, message: 'School not found.' });
      return;
    }

    await AuditLog.create({
      user: req.user?.userId,
      userName: req.user?.name,
      action: 'UPDATE_SCHOOL',
      entity: 'School',
      entityId: school._id.toString(),
      details: `Updated school settings for ${school.name}`,
    });

    res.json({ success: true, message: 'School updated successfully.', data: school });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteSchool(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    // Safe deactivation / archiving
    const school = await School.findByIdAndUpdate(
      req.params.id,
      { status: 'ARCHIVED' },
      { new: true }
    );
    if (!school) {
      res.status(404).json({ success: false, message: 'School not found.' });
      return;
    }

    // Set associated users to INACTIVE
    await User.updateMany({ school: school._id }, { status: 'INACTIVE' });

    await AuditLog.create({
      user: req.user?.userId,
      userName: req.user?.name,
      action: 'ARCHIVE_SCHOOL',
      entity: 'School',
      entityId: school._id.toString(),
      details: `Archived school: ${school.name}`,
    });

    res.json({ success: true, message: 'School archived and associated users suspended.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
