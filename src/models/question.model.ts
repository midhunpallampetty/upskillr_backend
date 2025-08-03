import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  marks: { type: Number, required: true },
  isDeleted:{type:Boolean,default:false}
}, { timestamps: true });

export { QuestionSchema };
