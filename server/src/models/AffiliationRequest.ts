import mongoose, { Schema, Document } from 'mongoose';

export type AffiliationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AffiliationRole = 'TEACHER' | 'STUDENT';

export interface IAffiliationRequest extends Document {
  user: mongoose.Types.ObjectId;
  role: AffiliationRole;
  school?: mongoose.Types.ObjectId;
  proposedSchool?: {
    name: string;
    city: string;
    state: string;
  };
  details: {
    qualification?: string;
    experienceYears?: number;
    grade?: string;
    programInterest?: string;
    parentName?: string;
    parentPhone?: string;
    enrollmentCode?: string;
  };
  status: AffiliationStatus;
  rejectionReason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AffiliationRequestSchema = new Schema<IAffiliationRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['TEACHER', 'STUDENT'], required: true, index: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', index: true },
    proposedSchool: {
      name: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
    },
    details: {
      qualification: { type: String },
      experienceYears: { type: Number },
      grade: { type: String },
      programInterest: { type: String },
      parentName: { type: String },
      parentPhone: { type: String },
      enrollmentCode: { type: String },
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    rejectionReason: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export const AffiliationRequest = mongoose.model<IAffiliationRequest>(
  'AffiliationRequest',
  AffiliationRequestSchema
);
