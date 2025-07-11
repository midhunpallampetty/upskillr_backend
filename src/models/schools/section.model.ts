// models/schools/section.model.ts

import mongoose from 'mongoose';

const SectionSchema = new mongoose.Schema({
  sectionName: { type: String, required: true },
  examRequired: { type: Boolean, default: false },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
}, { timestamps: true });

// ✅ Named export
export { SectionSchema };

// ✅ Default export (optional, if you're using it somewhere else)
export default mongoose.model('Section', SectionSchema);
