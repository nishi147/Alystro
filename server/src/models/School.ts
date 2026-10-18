import mongoose, { Schema, Document } from 'mongoose';

export interface ISchool extends Document {
  name: string;
  slug: string;
  code: string;
  logo?: string;
  coverImage?: string;
  tagline?: string;
  description?: string;
  address: {
    street?: string;
    city: string;
    state: string;
    pincode?: string;
    country?: string;
  };
  contactPerson: {
    name: string;
    designation?: string;
    phone: string;
    email: string;
  };
  classesServed: string[];
  studentCapacity: number;
  activeStudentCount: number;
  programsEnrolled: mongoose.Types.ObjectId[];
  startDate: Date;
  endDate?: Date;
  paymentStatus: 'PAID' | 'PENDING' | 'PARTIAL' | 'OVERDUE';
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'ARCHIVED' | 'REJECTED' | 'SUSPENDED';
  rejectionReason?: string;
  features: {
    enableLMS: boolean;
    enableCertificates: boolean;
    enableCRM: boolean;
  };
  commercialTerms?: {
    planName: string;
    enrollmentMilestone: number;
    agreedProgramFees: {
      programId: mongoose.Types.ObjectId;
      programName: string;
      gradeLevel: string;
      standardFee: number;
      negotiatedFee: number;
      gstRate: number;
    }[];
    technologyBenefits: {
      id: string;
      title: string;
      valuation: number;
      status: 'ACTIVE' | 'PENDING_MILESTONE' | 'UNLOCKED';
    }[];
    totalValuation: number;
    billing: {
      totalBilledAmount: number;
      paidAmount: number;
      outstandingBalance: number;
      paymentStatus: 'PAID' | 'PENDING' | 'PARTIAL' | 'OVERDUE';
      invoices: {
        invoiceNumber: string;
        invoiceDate: Date;
        amount: number;
        gstAmount: number;
        totalAmount: number;
        status: 'PAID' | 'PENDING' | 'PARTIAL' | 'OVERDUE';
        description: string;
      }[];
      paymentHistory: {
        transactionId: string;
        date: Date;
        amount: number;
        mode: string;
        status: 'SUCCESS' | 'PENDING' | 'FAILED';
        receiptUrl?: string;
      }[];
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const SchoolSchema = new Schema<ISchool>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    logo: { type: String },
    coverImage: { type: String },
    tagline: { type: String, trim: true },
    description: { type: String, trim: true },
    address: {
      street: { type: String },
      city: { type: String, required: true, index: true },
      state: { type: String, required: true },
      pincode: { type: String },
      country: { type: String, default: 'India' },
    },
    contactPerson: {
      name: { type: String, required: true },
      designation: { type: String },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    classesServed: [{ type: String }],
    studentCapacity: { type: Number, default: 500 },
    activeStudentCount: { type: Number, default: 0 },
    programsEnrolled: [{ type: Schema.Types.ObjectId, ref: 'Program' }],
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PENDING', 'PARTIAL', 'OVERDUE'],
      default: 'PENDING',
    },
    status: {
      type: String,
      enum: ['PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'INACTIVE', 'TRIAL', 'ARCHIVED', 'REJECTED', 'SUSPENDED'],
      default: 'ACTIVE',
      index: true,
    },
    rejectionReason: { type: String },
    features: {
      enableLMS: { type: Boolean, default: true },
      enableCertificates: { type: Boolean, default: true },
      enableCRM: { type: Boolean, default: true },
    },
    commercialTerms: {
      planName: { type: String, default: 'ALYSTRO School Partnership Agreement' },
      enrollmentMilestone: { type: Number, default: 300 },
      agreedProgramFees: [
        {
          programId: { type: Schema.Types.ObjectId, ref: 'Program' },
          programName: { type: String, required: true },
          gradeLevel: { type: String, required: true },
          standardFee: { type: Number, required: true },
          negotiatedFee: { type: Number, required: true },
          gstRate: { type: Number, default: 18 },
        },
      ],
      technologyBenefits: [
        {
          id: { type: String, required: true },
          title: { type: String, required: true },
          valuation: { type: Number, required: true },
          status: {
            type: String,
            enum: ['ACTIVE', 'PENDING_MILESTONE', 'UNLOCKED'],
            default: 'ACTIVE',
          },
        },
      ],
      totalValuation: { type: Number, default: 200000 },
      billing: {
        totalBilledAmount: { type: Number, default: 0 },
        paidAmount: { type: Number, default: 0 },
        outstandingBalance: { type: Number, default: 0 },
        paymentStatus: {
          type: String,
          enum: ['PAID', 'PENDING', 'PARTIAL', 'OVERDUE'],
          default: 'PENDING',
        },
        invoices: [
          {
            invoiceNumber: { type: String, required: true },
            invoiceDate: { type: Date, default: Date.now },
            amount: { type: Number, required: true },
            gstAmount: { type: Number, default: 0 },
            totalAmount: { type: Number, required: true },
            status: {
              type: String,
              enum: ['PAID', 'PENDING', 'PARTIAL', 'OVERDUE'],
              default: 'PENDING',
            },
            description: { type: String, default: '' },
          },
        ],
        paymentHistory: [
          {
            transactionId: { type: String, required: true },
            date: { type: Date, default: Date.now },
            amount: { type: Number, required: true },
            mode: { type: String, default: 'NEFT' },
            status: {
              type: String,
              enum: ['SUCCESS', 'PENDING', 'FAILED'],
              default: 'SUCCESS',
            },
            receiptUrl: { type: String },
          },
        ],
      },
    },
  },
  { timestamps: true }
);

export const School = mongoose.model<ISchool>('School', SchoolSchema);
