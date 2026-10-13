import mongoose, { Schema, Document } from 'mongoose';

export interface INotice extends Document {
  school: mongoose.Types.ObjectId;
  title: string;
  content: string;
  category: 'ANNOUNCEMENT' | 'EXAM' | 'HOLIDAY' | 'EVENT' | 'WORKSHOP';
  targetRole: 'ALL' | 'TEACHER' | 'STUDENT';
  postedBy: mongoose.Types.ObjectId;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ['ANNOUNCEMENT', 'EXAM', 'HOLIDAY', 'EVENT', 'WORKSHOP'],
      default: 'ANNOUNCEMENT',
    },
    targetRole: { type: String, enum: ['ALL', 'TEACHER', 'STUDENT'], default: 'ALL' },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notice = mongoose.model<INotice>('Notice', NoticeSchema);
