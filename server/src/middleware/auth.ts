import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.js';
import { User } from '../models/User.js';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { _id?: string; status?: string };
  schoolId?: string;
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.alystro_token) {
      token = req.cookies.alystro_token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to continue.',
      });
      return;
    }

    const decoded = verifyToken(token);

    // Verify user exists and account is not suspended or inactive
    const user = await User.findById(decoded.userId);
    if (!user || user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      res.status(401).json({
        success: false,
        message: 'User session is invalid or account is suspended.',
      });
      return;
    }

    req.user = {
      ...decoded,
      _id: decoded.userId,
      schoolId: user.school?.toString(),
      status: user.status,
    };

    if (req.user.schoolId) {
      req.schoolId = req.user.schoolId;
    }

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please sign in again.',
    });
  }
}

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    // Critical access control: Pending or rejected users CANNOT access protected role endpoints!
    if (req.user.status !== 'ACTIVE') {
      res.status(403).json({
        success: false,
        status: req.user.status,
        message:
          req.user.status === 'PENDING_APPROVAL'
            ? 'Access restricted: Your application is awaiting administrator verification and approval.'
            : 'Access restricted: Your registration was rejected or restricted. Please contact support.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${allowedRoles.join(', ')}] permissions.`,
      });
      return;
    }

    next();
  };
}

export function requireActiveUser(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }
  if (req.user.status !== 'ACTIVE') {
    res.status(403).json({
      success: false,
      status: req.user.status,
      message: 'Access restricted: Account is awaiting approval or inactive.',
    });
    return;
  }
  next();
}
