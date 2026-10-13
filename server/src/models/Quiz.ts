import mongoose, { Schema, Document } from 'mongoose';

export interface IQuiz extends Document {
  school: mongoose.Types.ObjectId;
  batch: mongoose.Types.ObjectId;
  program: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  durationMinutes: number;
  passingScore: number;
  questions: {
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    explanation?: string;
    marks: number;
  }[];
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema = new Schema<IQuiz>(
  {
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
    program: { type: Schema.Types.ObjectId, ref: 'Program', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    durationMinutes: { type: Number, default: 20 },
    passingScore: { type: Number, default: 60 },
    questions: [
      {
        questionText: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctOptionIndex: { type: Number, required: true },
        explanation: { type: String },
        marks: { type: Number, default: 10 },
      },
    ],
    status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'CLOSED'], default: 'PUBLISHED' },
  },
  { timestamps: true }
);

export const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema);
