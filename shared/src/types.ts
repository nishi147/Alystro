export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type SchoolStatus = 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'ARCHIVED';

export type PaymentStatus = 'PAID' | 'PENDING' | 'PARTIAL' | 'OVERDUE' | 'REFUNDED';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'DEMO_SCHEDULED' | 'DEMO_DONE' | 'CONVERTED' | 'CLOSED';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type GradeLevel = 'CLASS_6_8' | 'CLASS_9_10' | 'CLASS_11_12';

export interface UserSummary {
  _id: string;
  name: string;
  email: string;
  role: Role;
  school?: string | { _id: string; name: string; slug: string; logo?: string };
  phone?: string;
  avatar?: string;
  status: UserStatus;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field?: string; message: string }>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
