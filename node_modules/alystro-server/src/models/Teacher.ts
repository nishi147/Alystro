import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacher extends Document {
  user: mongoose.Types.ObjectId;
  school: mongoose.Types.ObjectId;
  specialization: string[];
  qualification?: string;
  assignedBatches: mongoose.Types.ObjectId[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    specialization: [{ type: String }],
    qualification: { type: String },
    assignedBatches: [{ type: Schema.Types.ObjectId, ref: 'Batch' }],
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
  },
  { timestamps: true }
);

export const Teacher = mongoose.model<ITeacher>('Teacher', TeacherSchema);
