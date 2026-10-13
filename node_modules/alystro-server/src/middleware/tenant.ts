import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';

export function enforceTenantIsolation(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  // Super Admin and Platform Admin have global visibility
  if (['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
    if (req.params.schoolId || req.params.id || (req.query.schoolId as string)) {
      req.schoolId = req.params.schoolId || req.params.id || (req.query.schoolId as string);
    }
    return next();
  }

  // Single-tenant users MUST have a schoolId
  if (!req.user.schoolId) {
    res.status(403).json({
      success: false,
      message: 'Access denied: User account is not assigned to an active school tenant.',
    });
    return;
  }

  // Any explicit school specified in route params, query, or body
  const requestedSchoolId =
    req.params.schoolId ||
    req.params.id ||
    (req.query.schoolId as string) ||
    req.body.schoolId ||
    req.body.school;

  // Prevent cross-tenant tampering
  if (requestedSchoolId && requestedSchoolId.toString() !== req.user.schoolId.toString()) {
    res.status(403).json({
      success: false,
      message: 'Security Violation: Cross-tenant data access is strictly forbidden.',
    });
    return;
  }

  // Enforce the user's schoolId on the request
  req.schoolId = req.user.schoolId;
  next();
}
