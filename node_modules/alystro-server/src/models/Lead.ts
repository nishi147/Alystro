import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  schoolName: string;
  contactPerson: string;
  designation?: string;
  email: string;
  phone: string;
  city: string;
  state?: string;
  estimatedStudents?: number;
  interestedProgram?: string;
  classes?: string[];
  preferredDemoDate?: Date;
  message?: string;
  leadSource: 'WEBSITE_DEMO' | 'REFERRAL' | 'INBOUND' | 'WORKSHOP' | 'OUTREACH';
  status: 'NEW' | 'CONTACTED' | 'DEMO_SCHEDULED' | 'DEMO_DONE' | 'CONVERTED' | 'CLOSED';
  assignedTo?: mongoose.Types.ObjectId;
  demoScheduledAt?: Date;
  convertedSchool?: mongoose.Types.ObjectId;
  notes: {
    author: string;
    text: string;
    createdAt: Date;
  }[];
  timeline: {
    action: string;
    details?: string;
    performedBy?: string;
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    schoolName: { type: String, required: true, trim: true, index: true },
    contactPerson: { type: String, required: true, trim: true },
    designation: { type: String },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String },
    estimatedStudents: { type: Number, default: 200 },
    interestedProgram: { type: String },
    classes: [{ type: String }],
    preferredDemoDate: { type: Date },
    message: { type: String },
    leadSource: {
      type: String,
      enum: ['WEBSITE_DEMO', 'REFERRAL', 'INBOUND', 'WORKSHOP', 'OUTREACH'],
      default: 'WEBSITE_DEMO',
    },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'DEMO_SCHEDULED', 'DEMO_DONE', 'CONVERTED', 'CLOSED'],
      default: 'NEW',
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    demoScheduledAt: { type: Date },
    convertedSchool: { type: Schema.Types.ObjectId, ref: 'School' },
    notes: [
      {
        author: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    timeline: [
      {
        action: { type: String, required: true },
        details: { type: String },
        performedBy: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);
