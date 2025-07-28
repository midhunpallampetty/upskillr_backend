// models/CoursePayment.ts

import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICoursePayment extends Document {
  schoolId: Types.ObjectId;
  courseId: Types.ObjectId;
  studentId: Types.ObjectId;
  paymentStatus: 'succeeded' | 'failed' | 'pending';
  stripe: {
    paymentIntentId: string;
    amount: number;
    currency: string;
    status: string;
    receiptUrl: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CoursePaymentSchema = new Schema<ICoursePayment>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    paymentStatus: {
      type: String,
      enum: ['paid', 'failed', 'pending'],
      required: true,
    },
    stripe: {
      paymentIntentId: { type: String, required: true },
      amount: { type: Number, required: true },
      currency: { type: String, required: true, default: 'INR' },
      status: { type: String, required: true },
      receiptUrl: { type: String },
    },
  },
  { timestamps: true }
);

const CoursePayment = mongoose.model<ICoursePayment>('CoursePayment', CoursePaymentSchema);
export default CoursePayment;
