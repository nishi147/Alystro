import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  school: mongoose.Types.ObjectId;
  batch: mongoose.Types.ObjectId;
  date: Date;
  teacher: mongoose.Types.ObjectId;
  topicCovered?: string;
  records: {
    student: mongoose.Types.ObjectId;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    remark?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
    date: { type: Date, required: true, index: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    topicCovered: { type: String, trim: true },
    records: [
      {
        student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
        status: {
          type: String,
          enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
          default: 'PRESENT',
        },
        remark: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
);

AttendanceSchema.index({ batch: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
