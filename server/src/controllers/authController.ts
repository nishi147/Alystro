import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { School } from '../models/School.js';
import { SchoolApplication } from '../models/SchoolApplication.js';
import { AffiliationRequest } from '../models/AffiliationRequest.js';
import { Student } from '../models/Student.js';
import { AuditLog } from '../models/AuditLog.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required.' });
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email and password.' });
    return;
  }

  // Account suspended or disabled
  if (user.status === 'SUSPENDED') {
    res.status(403).json({ success: false, message: 'This account has been suspended. Please contact ALYSTRO administration.' });
    return;
  }

  if (user.status === 'INACTIVE') {
    res.status(403).json({ success: false, message: 'This account is inactive. Please contact your school administrator.' });
    return;
  }

  const isMatch = await comparePassword(password, user.password || '');
  if (!isMatch) {
    res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email and password.' });
    return;
  }

  user.lastLogin = new Date();
  await user.save();

  let schoolData: any = null;
  if (user.school) {
    schoolData = await School.findById(user.school).select('_id name slug code logo status');
  }

  const token = signToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    schoolId: user.school?.toString(),
    name: user.name,
  });

  // Set HTTP-only cookie
  res.cookie('alystro_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Calculate dashboard path based on role and account status
  let dashboardPath = '/';
  if (user.status === 'PENDING_APPROVAL' || user.status === 'REJECTED') {
    dashboardPath = '/application-status';
  } else if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    dashboardPath = '/admin';
  } else if (user.role === 'SCHOOL_ADMIN') {
    dashboardPath = '/school';
  } else if (user.role === 'TEACHER') {
    dashboardPath = '/teacher';
  } else {
    dashboardPath = '/student';
  }

  res.json({
    success: true,
    message: user.status === 'PENDING_APPROVAL'
      ? 'Welcome to ALYSTRO. Your application is under review.'
      : 'Welcome back to ALYSTRO.',
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        rejectionReason: user.rejectionReason,
        schoolAffiliationStatus: user.schoolAffiliationStatus,
        proposedSchoolName: user.proposedSchoolName,
        school: schoolData,
        avatar: user.avatar,
        phone: user.phone,
      },
      dashboardPath,
    },
  });
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = await User.findById(req.user?.userId).populate('school', 'name slug code logo status');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        rejectionReason: user.rejectionReason,
        schoolAffiliationStatus: user.schoolAffiliationStatus,
        proposedSchoolName: user.proposedSchoolName,
        school: user.school,
        avatar: user.avatar,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    },
  });
}

// GET /api/v1/auth/my-status
// Detailed application / affiliation status tracking for applicants
export async function getMyStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.user?.userId).populate('school', 'name code city state status');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    let applicationData: any = null;
    let affiliationData: any = null;

    if (user.role === 'SCHOOL_ADMIN') {
      applicationData = await SchoolApplication.findOne({ adminUser: user._id })
        .populate('approvedBy', 'name email')
        .populate('createdSchool', 'name code slug status');
    } else {
      affiliationData = await AffiliationRequest.findOne({ user: user._id })
        .populate('school', 'name code city state')
        .populate('reviewedBy', 'name email');
    }

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          rejectionReason: user.rejectionReason,
          schoolAffiliationStatus: user.schoolAffiliationStatus,
          proposedSchoolName: user.proposedSchoolName,
          proposedSchoolCity: user.proposedSchoolCity,
          proposedSchoolState: user.proposedSchoolState,
          school: user.school,
          createdAt: user.createdAt,
        },
        application: applicationData,
        affiliation: affiliationData,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/v1/auth/register/school
export async function registerSchool(req: Request, res: Response): Promise<void> {
  try {
    const {
      schoolName,
      schoolEmail,
      schoolPhone,
      city,
      state,
      address,
      contactPersonName,
      contactPersonDesignation,
      studentCount,
      classesOffered,
      interestedPrograms,
      website,
      password,
      confirmPassword,
      termsAccepted,
    } = req.body;

    if (!schoolName || !schoolEmail || !schoolPhone || !city || !state || !address) {
      res.status(400).json({ success: false, message: 'Please fill in all required school details.' });
      return;
    }
    if (!contactPersonName || !contactPersonDesignation) {
      res.status(400).json({ success: false, message: 'Contact person name and designation are required.' });
      return;
    }
    if (!password || password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }
    if (password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }
    if (!termsAccepted) {
      res.status(400).json({ success: false, message: 'Please accept terms and conditions to proceed.' });
      return;
    }

    const normalizedEmail = schoolEmail.toLowerCase().trim();

    // Check duplicate user email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: `An account with email "${normalizedEmail}" already exists. Please log in or choose a different email.`,
      });
      return;
    }

    // Check existing school with identical name
    const existingSchool = await School.findOne({
      name: { $regex: `^${schoolName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });
    if (existingSchool && existingSchool.status === 'ACTIVE') {
      res.status(409).json({
        success: false,
        message: `An active partner school named "${schoolName.trim()}" is already registered. If you are an educator or student, please select it from the Teacher or Student signup.`,
      });
      return;
    }

    // Create User with role: 'SCHOOL_ADMIN', status: 'PENDING_APPROVAL'
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name: contactPersonName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'SCHOOL_ADMIN',
      phone: schoolPhone.trim(),
      status: 'PENDING_APPROVAL',
      schoolAffiliationStatus: 'PENDING',
    });

    // Create SchoolApplication record
    const application = await SchoolApplication.create({
      schoolName: schoolName.trim(),
      schoolEmail: normalizedEmail,
      schoolPhone: schoolPhone.trim(),
      city: city.trim(),
      state: state.trim(),
      address: address.trim(),
      contactPersonName: contactPersonName.trim(),
      contactPersonDesignation: contactPersonDesignation.trim(),
      studentCount: Number(studentCount) || 0,
      classesOffered: Array.isArray(classesOffered) ? classesOffered : [],
      interestedPrograms: Array.isArray(interestedPrograms) ? interestedPrograms : [],
      website: website ? website.trim() : undefined,
      adminUser: user._id,
      status: 'PENDING_APPROVAL',
    });

    // Sign restricted session token for tracking status
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.cookie('alystro_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await AuditLog.create({
      user: user._id,
      userName: user.name,
      action: 'REGISTER_SCHOOL',
      entity: 'SchoolApplication',
      entityId: application._id.toString(),
      details: `New school application submitted: ${application.schoolName} (${application.schoolEmail})`,
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'School application submitted successfully. Your tenant provisioning is awaiting Super Admin verification.',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
        applicationId: application._id,
        dashboardPath: '/application-status',
      },
    });
  } catch (error: any) {
    console.error('[registerSchool] Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'School registration failed.' });
  }
}

// POST /api/v1/auth/register/teacher
export async function registerTeacher(req: Request, res: Response): Promise<void> {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      qualification,
      experienceYears,
      schoolId,
      isUnlistedSchool,
      unlistedSchoolName,
      unlistedSchoolCity,
      unlistedSchoolState,
      termsAccepted,
    } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }
    if (password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }
    if (!termsAccepted) {
      res.status(400).json({ success: false, message: 'Please accept terms and conditions.' });
      return;
    }

    if (!isUnlistedSchool && !schoolId) {
      res.status(400).json({ success: false, message: 'Please select a school or choose "My school is not listed".' });
      return;
    }
    if (isUnlistedSchool && (!unlistedSchoolName || !unlistedSchoolCity || !unlistedSchoolState)) {
      res.status(400).json({ success: false, message: 'Please provide unlisted school name, city, and state.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: `An account with email "${normalizedEmail}" already exists.`,
      });
      return;
    }

    let linkedSchool: any = null;
    if (schoolId) {
      linkedSchool = await School.findById(schoolId);
      if (!linkedSchool) {
        res.status(404).json({ success: false, message: 'Selected school was not found.' });
        return;
      }
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'TEACHER',
      phone: phone ? phone.trim() : undefined,
      school: linkedSchool ? linkedSchool._id : undefined,
      schoolAffiliationStatus: 'PENDING',
      status: 'PENDING_APPROVAL',
      proposedSchoolName: isUnlistedSchool ? unlistedSchoolName.trim() : undefined,
      proposedSchoolCity: isUnlistedSchool ? unlistedSchoolCity.trim() : undefined,
      proposedSchoolState: isUnlistedSchool ? unlistedSchoolState.trim() : undefined,
    });

    const affiliation = await AffiliationRequest.create({
      user: user._id,
      role: 'TEACHER',
      school: linkedSchool ? linkedSchool._id : undefined,
      proposedSchool: isUnlistedSchool
        ? {
            name: unlistedSchoolName.trim(),
            city: unlistedSchoolCity.trim(),
            state: unlistedSchoolState.trim(),
          }
        : undefined,
      details: {
        qualification: qualification ? qualification.trim() : undefined,
        experienceYears: Number(experienceYears) || 0,
      },
      status: 'PENDING',
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      schoolId: linkedSchool ? linkedSchool._id.toString() : undefined,
    });

    res.cookie('alystro_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Teacher registration submitted. Your school affiliation is pending administrator approval.',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          schoolAffiliationStatus: user.schoolAffiliationStatus,
        },
        affiliationId: affiliation._id,
        dashboardPath: '/application-status',
      },
    });
  } catch (error: any) {
    console.error('[registerTeacher] Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Teacher registration failed.' });
  }
}

// POST /api/v1/auth/register/student
export async function registerStudent(req: Request, res: Response): Promise<void> {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      schoolId,
      isUnlistedSchool,
      unlistedSchoolName,
      unlistedSchoolCity,
      unlistedSchoolState,
      grade,
      programInterest,
      parentName,
      parentPhone,
      enrollmentCode,
      termsAccepted,
    } = req.body;

    if (!name || !email || !password || !grade) {
      res.status(400).json({ success: false, message: 'Name, email, password, and class/grade are required.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }
    if (password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }
    if (!termsAccepted) {
      res.status(400).json({ success: false, message: 'Please accept terms and conditions.' });
      return;
    }

    if (!isUnlistedSchool && !schoolId) {
      res.status(400).json({ success: false, message: 'Please select a school or choose "My school is not listed".' });
      return;
    }
    if (isUnlistedSchool && (!unlistedSchoolName || !unlistedSchoolCity || !unlistedSchoolState)) {
      res.status(400).json({ success: false, message: 'Please provide unlisted school name, city, and state.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: `An account with email "${normalizedEmail}" already exists.`,
      });
      return;
    }

    let linkedSchool: any = null;
    if (schoolId) {
      linkedSchool = await School.findById(schoolId);
      if (!linkedSchool) {
        res.status(404).json({ success: false, message: 'Selected school was not found.' });
        return;
      }
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'STUDENT',
      phone: phone ? phone.trim() : undefined,
      school: linkedSchool ? linkedSchool._id : undefined,
      schoolAffiliationStatus: linkedSchool ? 'APPROVED' : 'PENDING',
      status: 'ACTIVE',
      proposedSchoolName: isUnlistedSchool ? unlistedSchoolName.trim() : undefined,
      proposedSchoolCity: isUnlistedSchool ? unlistedSchoolCity.trim() : undefined,
      proposedSchoolState: isUnlistedSchool ? unlistedSchoolState.trim() : undefined,
    });

    const affiliation = await AffiliationRequest.create({
      user: user._id,
      role: 'STUDENT',
      school: linkedSchool ? linkedSchool._id : undefined,
      proposedSchool: isUnlistedSchool
        ? {
            name: unlistedSchoolName.trim(),
            city: unlistedSchoolCity.trim(),
            state: unlistedSchoolState.trim(),
          }
        : undefined,
      details: {
        grade: grade.trim(),
        programInterest: programInterest ? programInterest.trim() : undefined,
        parentName: parentName ? parentName.trim() : undefined,
        parentPhone: parentPhone ? parentPhone.trim() : undefined,
        enrollmentCode: enrollmentCode ? enrollmentCode.trim() : undefined,
      },
      status: linkedSchool ? 'APPROVED' : 'PENDING',
    });

    // Create real Student record in database so student automatically appears in All Students
    let effectiveSchoolId = linkedSchool ? linkedSchool._id : undefined;
    if (!effectiveSchoolId) {
      const defaultSchool = await School.findOne({ status: 'ACTIVE' });
      effectiveSchoolId = defaultSchool?._id;
    }

    const studentCount = await Student.countDocuments();
    const cleanPrefix = linkedSchool?.code
      ? linkedSchool.code.replace(/[^A-Z0-9]/g, '').slice(0, 4)
      : 'ALY';
    const rollNumber = `${cleanPrefix}-${1000 + studentCount + 1}`;

    await Student.create({
      user: user._id,
      school: effectiveSchoolId,
      rollNumber,
      grade: grade.trim() || 'Class 8',
      section: 'A',
      parentName: parentName ? parentName.trim() : undefined,
      parentPhone: parentPhone ? parentPhone.trim() : undefined,
      status: 'ACTIVE',
      enrolledAt: new Date(),
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      schoolId: linkedSchool ? linkedSchool._id.toString() : undefined,
    });

    res.cookie('alystro_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Student registration completed successfully. Welcome to ALYSTRO!',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          schoolAffiliationStatus: user.schoolAffiliationStatus,
        },
        affiliationId: affiliation._id,
        dashboardPath: '/student',
      },
    });
  } catch (error: any) {
    console.error('[registerStudent] Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Student registration failed.' });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  res.clearCookie('alystro_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.json({ success: true, message: 'Signed out successfully.' });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: 'Please provide a valid registered email.' });
    return;
  }

  res.json({
    success: true,
    message: 'If an account exists with this email, password recovery instructions have been dispatched.',
  });
}
