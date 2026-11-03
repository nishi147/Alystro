import mongoose, { Schema, Document } from 'mongoose';

export interface IGoogleClassroom extends Document {
  classroomName: string;
  school: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId; // References Program
  batch: mongoose.Types.ObjectId;  // References Batch
  teacher?: mongoose.Types.ObjectId; // References User (Teacher)
  classroomUrl: string;
  instructions?: string;
  status: 'ACTIVE' | 'INACTIVE';
  updateRequest?: {
    requestedBy: mongoose.Types.ObjectId;
    requestedAt: Date;
    reason: string;
    suggestedUrl?: string;
    resolved: boolean;
  };
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // Aliases/virtuals
  schoolId?: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  batchId?: mongoose.Types.ObjectId;
  teacherId?: mongoose.Types.ObjectId;
}

const GoogleClassroomSchema = new Schema<IGoogleClassroom>(
  {
    classroomName: { type: String, required: true, trim: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Program', required: true, index: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    classroomUrl: { type: String, required: true, trim: true },
    instructions: { type: String, trim: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
    updateRequest: {
      requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      requestedAt: { type: Date },
      reason: { type: String },
      suggestedUrl: { type: String },
      resolved: { type: Boolean, default: false },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual properties for compatibility
GoogleClassroomSchema.virtual('schoolId').get(function () {
  return this.school;
});
GoogleClassroomSchema.virtual('courseId').get(function () {
  return this.course;
});
GoogleClassroomSchema.virtual('batchId').get(function () {
  return this.batch;
});
GoogleClassroomSchema.virtual('teacherId').get(function () {
  return this.teacher;
});

// Compound index to prevent accidental duplicate classroom associations for the same school, course, and batch
GoogleClassroomSchema.index({ school: 1, course: 1, batch: 1 }, { unique: true });

export const GoogleClassroom = mongoose.model<IGoogleClassroom>('GoogleClassroom', GoogleClassroomSchema);

