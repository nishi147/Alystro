import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  certificateId: string;
  student: mongoose.Types.ObjectId;
  studentName: string;
  school: mongoose.Types.ObjectId;
  schoolName: string;
  program: mongoose.Types.ObjectId;
  programName: string;
  grade: string;
  issueDate: Date;
  completionDate: Date;
  verificationQrCode?: string;
  pdfUrl?: string;
  status: 'VALID' | 'REVOKED' | 'EXPIRED';
  issuedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    certificateId: { type: String, required: true, unique: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    studentName: { type: String, required: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    schoolName: { type: String, required: true },
    program: { type: Schema.Types.ObjectId, ref: 'Program', required: true },
    programName: { type: String, required: true },
    grade: { type: String, default: 'Distinction' },
    issueDate: { type: Date, default: Date.now },
    completionDate: { type: Date, required: true },
    verificationQrCode: { type: String },
    pdfUrl: { type: String },
    status: {
      type: String,
      enum: ['VALID', 'REVOKED', 'EXPIRED'],
      default: 'VALID',
      index: true,
    },
    issuedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Certificate = mongoose.model<ICertificate>('Certificate', CertificateSchema);
