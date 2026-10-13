import mongoose, { Schema, Document } from 'mongoose';

export interface IProgram extends Document {
  name: string;
  slug: string;
  gradeLevel: 'CLASS_6_8' | 'CLASS_9_10' | 'CLASS_11_12';
  category: string;
  tagline: string;
  description: string;
  durationMonths: number;
  sessionDurationMinutes: number;
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  features: string[];
  learningOutcomes: string[];
  syllabus: {
    month: number;
    title: string;
    description?: string;
    topics: string[];
  }[];
  banner?: string;
  badge?: string;
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProgramSchema = new Schema<IProgram>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    gradeLevel: {
      type: String,
      enum: ['CLASS_6_8', 'CLASS_9_10', 'CLASS_11_12'],
      required: true,
      index: true,
    },
    category: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    durationMonths: { type: Number, default: 3 },
    sessionDurationMinutes: { type: Number, default: 45 },
    mode: { type: String, enum: ['ONLINE', 'OFFLINE', 'HYBRID'], default: 'HYBRID' },
    features: [{ type: String }],
    learningOutcomes: [{ type: String }],
    syllabus: [
      {
        month: { type: Number, required: true },
        title: { type: String, required: true },
        description: { type: String },
        topics: [{ type: String }],
      },
    ],
    banner: { type: String },
    badge: { type: String },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Program = mongoose.model<IProgram>('Program', ProgramSchema);
