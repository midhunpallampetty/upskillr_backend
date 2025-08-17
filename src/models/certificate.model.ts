import mongoose from 'mongoose';

export const CertificateSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
  certificateUrl: {
    type: String,
    required: true,
  },
});