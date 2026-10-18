import mongoose, { Schema, Document } from 'mongoose';

export interface IPartnershipBenefit {
  id: string;
  title: string;
  valuation: number;
  description: string;
  milestoneStudents: number;
  isUnlocked: boolean;
}

export interface IPartnershipConfig extends Document {
  key: string;
  title: string;
  milestoneStudents: number;
  combinedValuation: number;
  currency: string;
  benefits: IPartnershipBenefit[];
  additionalSupport: string[];
  gstRate: number;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PartnershipBenefitSchema = new Schema<IPartnershipBenefit>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    valuation: { type: Number, required: true },
    description: { type: String, default: '' },
    milestoneStudents: { type: Number, default: 300 },
    isUnlocked: { type: Boolean, default: true },
  },
  { _id: false }
);

const PartnershipConfigSchema = new Schema<IPartnershipConfig>(
  {
    key: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    milestoneStudents: { type: Number, default: 300 },
    combinedValuation: { type: Number, default: 200000 },
    currency: { type: String, default: 'INR' },
    benefits: [PartnershipBenefitSchema],
    additionalSupport: [{ type: String }],
    gstRate: { type: Number, default: 18 },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const PartnershipConfig = mongoose.model<IPartnershipConfig>(
  'PartnershipConfig',
  PartnershipConfigSchema
);
