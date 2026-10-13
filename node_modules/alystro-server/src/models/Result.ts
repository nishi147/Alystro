import mongoose, { Schema, Document } from 'mongoose';

export interface IResult extends Document {
  quiz: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  school: mongoose.Types.ObjectId;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  selectedAnswers: number[];
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ResultSchema = new Schema<IResult>(
  {
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    score: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    selectedAnswers: [{ type: Number }],
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ResultSchema.index({ quiz: 1, student: 1 }, { unique: true });

export const Result = mongoose.model<IResult>('Result', ResultSchema);
