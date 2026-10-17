export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  school?: {
    _id: string;
    name: string;
    slug: string;
    code: string;
    logo?: string;
  } | null;
  avatar?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface School {
  _id: string;
  name: string;
  slug: string;
  code: string;
  logo?: string;
  coverImage?: string;
  tagline?: string;
  description?: string;
  address: {
    street?: string;
    city: string;
    state: string;
    pincode?: string;
    country?: string;
  };
  contactPerson: {
    name: string;
    designation?: string;
    phone: string;
    email: string;
  };
  classesServed: string[];
  studentCapacity: number;
  activeStudentCount: number;
  programsEnrolled?: Program[];
  paymentStatus: 'PAID' | 'PENDING' | 'PARTIAL' | 'OVERDUE';
  status: 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'ARCHIVED';
  createdAt: string;
}

export interface Program {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  gradeLevel: 'CLASS_6_8' | 'CLASS_9_10' | 'CLASS_11_12' | string;
  category?: string;
  tagline: string;
  description: string;
  durationMonths: number;
  sessionDurationMinutes: number;
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID' | string;
  schedule?: string;
  status?: string;
  features: string[];
  learningOutcomes: string[];
  syllabus: {
    month: number;
    title: string;
    description?: string;
    topics: string[];
  }[];
  banner?: string;
  badge?: string;
  featured?: boolean;
  published?: boolean;
}

export interface Batch {
  _id: string;
  name: string;
  school: School | string;
  program: Program | string;
  teacher?: User | string;
  grade: string;
  section: string;
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[];
  meetingLink?: string;
  classroomNumber?: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  maxStudents: number;
  currentStudentCount: number;
}

export interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  rollNumber: string;
  grade: string;
  section: string;
  school?: School;
  batch?: Batch;
  program?: Program;
  parentName?: string;
  parentPhone?: string;
  attendanceRate: number;
  completedAssignments: number;
  totalScore: number;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
}

export interface Teacher {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  specialization: string[];
  qualification?: string;
  assignedBatches?: Batch[];
  school?: School;
  status: string;
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  batch?: Batch;
  program?: Program;
  teacher?: User;
  dueDate: string;
  totalMarks: number;
  attachments?: { name: string; url: string }[];
  userSubmission?: any;
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  passingScore: number;
  questions: {
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    marks: number;
    explanation?: string;
  }[];
  userResult?: any;
}

export interface Certificate {
  _id: string;
  certificateId: string;
  studentName: string;
  schoolName: string;
  programName: string;
  grade: string;
  issueDate: string;
  completionDate: string;
  verificationQrCode?: string;
  status: 'VALID' | 'REVOKED' | 'EXPIRED';
}

export interface Lead {
  _id: string;
  schoolName: string;
  contactPerson: string;
  designation?: string;
  email: string;
  phone: string;
  city: string;
  state?: string;
  estimatedStudents?: number;
  interestedProgram?: string;
  classes?: string[];
  status: 'NEW' | 'CONTACTED' | 'DEMO_SCHEDULED' | 'DEMO_DONE' | 'CONVERTED' | 'CLOSED';
  demoScheduledAt?: string;
  convertedSchool?: string;
  notes?: { author: string; text: string; createdAt: string }[];
  timeline?: { action: string; details?: string; performedBy?: string; timestamp: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface SuperAdminStats {
  summary: {
    totalSchools: number;
    activeSchools: number;
    totalStudents: number;
    activeStudents: number;
    totalTeachers: number;
    activeBatches: number;
    totalPrograms: number;
    certificatesIssued: number;
    revenue: number;
    pendingPayments: number;
    totalLeads: number;
    newLeads: number;
    scheduledDemos: number;
    convertedSchools: number;
  };
  charts: {
    schoolBreakdown: { name: string; students: number }[];
    monthlyEnrollment: { month: string; students: number }[];
    crmFunnel: { stage: string; count: number }[];
  };
}
