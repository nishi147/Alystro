import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  assignment: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  school: mongoose.Types.ObjectId;
  fileUrl?: string;
  notes?: string;
  submittedAt: Date;
  marksObtained?: number;
  feedback?: string;
  gradedBy?: mongoose.Types.ObjectId;
  gradedAt?: Date;
  status: 'SUBMITTED' | 'GRADED' | 'RESUBMIT';
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    fileUrl: { type: String },
    notes: { type: String },
    submittedAt: { type: Date, default: Date.now },
    marksObtained: { type: Number },
    feedback: { type: String },
    gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    gradedAt: { type: Date },
    status: {
      type: String,
      enum: ['SUBMITTED', 'GRADED', 'RESUBMIT'],
      default: 'SUBMITTED',
      index: true,
    },
  },
  { timestamps: true }
);

SubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
