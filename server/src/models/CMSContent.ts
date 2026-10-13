import mongoose, { Schema, Document } from 'mongoose';

export interface ICMSContent extends Document {
  key: string;
  category: 'HERO' | 'PROGRAMS' | 'TESTIMONIALS' | 'PROJECTS' | 'FAQS' | 'STATS' | 'GALLERY' | 'BLOG';
  title?: string;
  data: any;
  published: boolean;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CMSContentSchema = new Schema<ICMSContent>(
  {
    key: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      enum: ['HERO', 'PROGRAMS', 'TESTIMONIALS', 'PROJECTS', 'FAQS', 'STATS', 'GALLERY', 'BLOG'],
      required: true,
      index: true,
    },
    title: { type: String },
    data: { type: Schema.Types.Mixed, required: true },
    published: { type: Boolean, default: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const CMSContent = mongoose.model<ICMSContent>('CMSContent', CMSContentSchema);
