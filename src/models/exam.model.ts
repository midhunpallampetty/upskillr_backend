import mongoose from 'mongoose';

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  totalMarks: { type: Number, required: false,default:0 },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export { ExamSchema };
