import mongoose, { Schema, Document, Types } from "mongoose";

export interface ExamDocument extends Document {
  title: string;
  totalMarks: number;
  questions: Types.ObjectId[];
  minToPass: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const examSchema = new Schema<ExamDocument>(
  {
    title: { type: String, required: true, trim: true },
    totalMarks: { type: Number, required: true },
    questions: [
      { type: Schema.Types.ObjectId, ref: "Question", required: true }
    ],
    minToPass: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Exam
  ? mongoose.model<ExamDocument>("Exam")
  : mongoose.model<ExamDocument>("Exam", examSchema);
