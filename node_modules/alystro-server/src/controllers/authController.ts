import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { School } from '../models/School.js';
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

  if (user.status !== 'ACTIVE') {
    res.status(403).json({ success: false, message: 'This account is inactive or suspended. Contact administration.' });
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
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    success: true,
    message: 'Welcome back to ALYSTRO.',
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        school: schoolData,
        avatar: user.avatar,
        phone: user.phone,
      },
      dashboardPath:
        user.role === 'SUPER_ADMIN' || user.role === 'ADMIN'
          ? '/admin'
          : user.role === 'SCHOOL_ADMIN'
          ? '/school'
          : user.role === 'TEACHER'
          ? '/teacher'
          : '/student',
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
        school: user.school,
        avatar: user.avatar,
        phone: user.phone,
        status: user.status,
      },
    },
  });
}

export async function logout(req: Request, res: Response): Promise<void> {
  res.clearCookie('alystro_token');
  res.json({ success: true, message: 'Signed out successfully.' });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: 'Please provide a valid registered email.' });
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  // Always return consistent message for security
  res.json({
    success: true,
    message: 'If an account exists with this email, password recovery instructions have been dispatched.',
  });
}
