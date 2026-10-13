import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  user: mongoose.Types.ObjectId;
  school: mongoose.Types.ObjectId;
  batch?: mongoose.Types.ObjectId;
  program?: mongoose.Types.ObjectId;
  rollNumber: string;
  grade: string;
  section: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  enrolledAt: Date;
  attendanceRate: number;
  completedAssignments: number;
  totalScore: number;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', index: true },
    program: { type: Schema.Types.ObjectId, ref: 'Program', index: true },
    rollNumber: { type: String, required: true },
    grade: { type: String, required: true },
    section: { type: String, default: 'A' },
    parentName: { type: String },
    parentPhone: { type: String },
    parentEmail: { type: String },
    enrolledAt: { type: Date, default: Date.now },
    attendanceRate: { type: Number, default: 0 },
    completedAssignments: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'GRADUATED'],
      default: 'ACTIVE',
      index: true,
    },
  },
  { timestamps: true }
);

StudentSchema.index({ school: 1, rollNumber: 1 });

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
