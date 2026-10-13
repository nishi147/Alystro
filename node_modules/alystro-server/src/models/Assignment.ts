import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  school: mongoose.Types.ObjectId;
  batch: mongoose.Types.ObjectId;
  program: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  title: string;
  description: string;
  dueDate: Date;
  totalMarks: number;
  attachments: { name: string; url: string }[];
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
    program: { type: Schema.Types.ObjectId, ref: 'Program', required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    totalMarks: { type: Number, default: 100 },
    attachments: [{ name: { type: String }, url: { type: String } }],
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema as any);
