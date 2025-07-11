import mongoose from 'mongoose';

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  totalMarks: { type: Number, required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
}, { timestamps: true });

export { ExamSchema };
export default mongoose.model('Exam', ExamSchema);
