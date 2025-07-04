import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  sectionName: { type: String, required: true },
  examRequired: { type: Boolean, default: false },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', default: null },
}, { timestamps: true });

export default mongoose.model('Section', sectionSchema);
