import { Response } from 'express';
import { Teacher } from '../models/Teacher.js';
import { User } from '../models/User.js';
import { hashPassword } from '../utils/password.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getTeachers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const query: any = {};
    if (['SCHOOL_ADMIN', 'TEACHER'].includes(req.user?.role || '')) {
      query.school = req.schoolId;
    } else if (req.query.schoolId) {
      query.school = req.query.schoolId;
    }

    const teachers = await Teacher.find(query)
      .populate('user', 'name email phone avatar status lastLogin')
      .populate('assignedBatches', 'name grade section meetingLink')
      .populate('school', 'name code');

    const formatted = teachers
      .filter((t) => t.user)
      .map((t: any) => ({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createTeacher(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { name, email, password = 'Teacher@123', phone, specialization, qualification, assignedBatches } =
      req.body;
    const schoolId = req.schoolId || req.body.schoolId;

    if (!schoolId) {
      res.status(400).json({ success: false, message: 'School identifier is required.' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'User with this email already exists.' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'TEACHER',
      school: schoolId,
      phone,
      status: 'ACTIVE',
    });

    const teacher = await Teacher.create({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
