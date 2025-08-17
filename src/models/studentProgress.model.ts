import mongoose from 'mongoose';

export const StudentProgressSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    index: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  progress: {
    type: Map,
    of: {
      completed: { type: Boolean, default: false },
      lastPosition: { type: Number, default: 0 } // in seconds
    },
    default: () => new Map()
  },
  passedSections: [{
    sectionId: { type: String, required: true },
    score: { type: Number, default: null }, // Optional: e.g., 75 (percentage or raw score)
    passedAt: { type: Date, default: Date.now } // Optional: Timestamp of when passed
  }],
  // NEW: Field for final exam progress
  finalExam: {
    passed: { type: Boolean, default: false },
    score: { type: Number, default: null }, // e.g., percentage or raw score
    passedAt: { type: Date, default: null } // Timestamp when passed
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for faster queries
StudentProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// Optional: Pre-save hook to update lastUpdated
StudentProgressSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});
