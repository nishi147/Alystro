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
    const school = await School.findOne({ slug: slug.toLowerCase() }).populate(
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
    const school = await School.findById(req.params.id).populate('programsEnrolled');
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

    // Generate slug
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
    const randomCodeSuffix = Math.floor(100 + Math.random() * 900);
    const code = `${name.slice(0, 3).toUpperCase()}-${randomCodeSuffix}`;

    const school = await School.create({
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
      const hashedPassword = await hashPassword(adminPassword);
      await User.create({
        name: contactPerson.name || `${name} Admin`,
        email: adminEmail.toLowerCase().trim(),
        password: hashedPassword,
        role: 'SCHOOL_ADMIN',
        school: school._id,
        phone: contactPerson.phone,
        status: 'ACTIVE',
      });
    }

    await AuditLog.create({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
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
