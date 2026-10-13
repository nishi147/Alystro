import mongoose, { Schema, Document } from 'mongoose';

export interface IBatch extends Document {
  name: string;
  school: mongoose.Types.ObjectId;
  program: mongoose.Types.ObjectId;
  teacher?: mongoose.Types.ObjectId;
  grade: string;
  section: string;
  schedule: {
    dayOfWeek: string; // e.g. "Monday", "Wednesday", "Friday"
    startTime: string; // "16:00"
    endTime: string;   // "16:45"
  }[];
  meetingLink?: string;
  classroomNumber?: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startDate: Date;
  endDate?: Date;
  maxStudents: number;
  currentStudentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema = new Schema<IBatch>(
  {
    name: { type: String, required: true, trim: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    program: { type: Schema.Types.ObjectId, ref: 'Program', required: true, index: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    grade: { type: String, required: true },
    section: { type: String, default: 'A' },
    schedule: [
      {
        dayOfWeek: { type: String, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
      },
    ],
    meetingLink: { type: String, default: 'https://meet.google.com/aly-live-demo' },
    classroomNumber: { type: String },
    status: {
      type: String,
      enum: ['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'ACTIVE',
      index: true,
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    maxStudents: { type: Number, default: 40 },
    currentStudentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Batch = mongoose.model<IBatch>('Batch', BatchSchema);
