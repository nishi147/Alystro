import mongoose, { Schema, Document } from 'mongoose';

export interface ISchool extends Document {
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
  programsEnrolled: mongoose.Types.ObjectId[];
  startDate: Date;
  endDate?: Date;
  paymentStatus: 'PAID' | 'PENDING' | 'PARTIAL' | 'OVERDUE';
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'ARCHIVED' | 'REJECTED' | 'SUSPENDED';
  rejectionReason?: string;
  features: {
    enableLMS: boolean;
    enableCertificates: boolean;
    enableCRM: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SchoolSchema = new Schema<ISchool>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    logo: { type: String },
    coverImage: { type: String },
    tagline: { type: String, trim: true },
    description: { type: String, trim: true },
    address: {
      street: { type: String },
      city: { type: String, required: true, index: true },
      state: { type: String, required: true },
      pincode: { type: String },
      country: { type: String, default: 'India' },
    },
    contactPerson: {
      name: { type: String, required: true },
      designation: { type: String },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    classesServed: [{ type: String }],
    studentCapacity: { type: Number, default: 500 },
    activeStudentCount: { type: Number, default: 0 },
    programsEnrolled: [{ type: Schema.Types.ObjectId, ref: 'Program' }],
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PENDING', 'PARTIAL', 'OVERDUE'],
      default: 'PENDING',
    },
    status: {
      type: String,
      enum: ['PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'INACTIVE', 'TRIAL', 'ARCHIVED', 'REJECTED', 'SUSPENDED'],
      default: 'ACTIVE',
      index: true,
    },
    rejectionReason: { type: String },
    features: {
      enableLMS: { type: Boolean, default: true },
      enableCertificates: { type: Boolean, default: true },
      enableCRM: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const School = mongoose.model<ISchool>('School', SchoolSchema);
