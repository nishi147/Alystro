import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT';
  school?: mongoose.Types.ObjectId;
  phone?: string;
  avatar?: string;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED' | 'INACTIVE' | 'SUSPENDED';
  rejectionReason?: string;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  schoolAffiliationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  proposedSchoolName?: string;
  proposedSchoolCity?: string;
  proposedSchoolState?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT'],
      required: true,
      index: true,
    },
    school: { type: Schema.Types.ObjectId, ref: 'School', index: true },
    phone: { type: String, trim: true },
    avatar: { type: String },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING_APPROVAL', 'REJECTED', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
      index: true,
    },
    rejectionReason: { type: String },
    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    schoolAffiliationStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
    },
    proposedSchoolName: { type: String, trim: true },
    proposedSchoolCity: { type: String, trim: true },
    proposedSchoolState: { type: String, trim: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
