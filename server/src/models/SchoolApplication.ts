import mongoose, { Schema, Document } from 'mongoose';

export type SchoolApplicationStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface ISchoolApplication extends Document {
  schoolName: string;
  schoolEmail: string;
  schoolPhone: string;
  city: string;
  state: string;
  address: string;
  contactPersonName: string;
  contactPersonDesignation?: string;
  studentCount?: number;
  classesOffered: string[];
  interestedPrograms: string[];
  website?: string;
  adminUser: mongoose.Types.ObjectId;
  status: SchoolApplicationStatus;
  rejectionReason?: string;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  rejectedBy?: mongoose.Types.ObjectId;
  createdSchool?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SchoolApplicationSchema = new Schema<ISchoolApplication>(
  {
    schoolName: { type: String, required: true, trim: true },
    schoolEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    schoolPhone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    contactPersonName: { type: String, required: true, trim: true },
    contactPersonDesignation: { type: String, default: 'Principal', trim: true },
    studentCount: { type: Number, default: 0 },
    classesOffered: [{ type: String }],
    interestedPrograms: [{ type: String }],
    website: { type: String, trim: true },
    adminUser: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED'],
      default: 'PENDING_APPROVAL',
      index: true,
    },
    rejectionReason: { type: String },
    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: { type: Date },
    rejectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdSchool: { type: Schema.Types.ObjectId, ref: 'School' },
    notes: { type: String },
  },
  { timestamps: true }
);

export const SchoolApplication = mongoose.model<ISchoolApplication>(
  'SchoolApplication',
  SchoolApplicationSchema
);
