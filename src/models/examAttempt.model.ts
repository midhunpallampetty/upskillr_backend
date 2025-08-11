// models/examAttempt.model.ts
import { Schema, model, Document, Types } from "mongoose";

export type ExamType = "prelims" | "final" | "section";

export interface IExamAttempt extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId; // could be Exam._id
  examType: ExamType;
  attempts: number;
  status: "passed" | "failed" | "ineligible";
  lastAttemptDate: Date | null;
  ineligibleUntil: Date | null;
}

const examAttemptSchema = new Schema<IExamAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    courseId: { type: Schema.Types.ObjectId, required: true },
    examType: { type: String, enum: ["prelims", "final", "section"], required: true },
    attempts: { type: Number, default: 0 },
    status: { type: String, enum: ["passed", "failed", "ineligible"], default: "failed" },
    lastAttemptDate: { type: Date, default: null },
    ineligibleUntil: { type: Date, default: null }
  },
  { timestamps: true }
);

export const ExamAttempt = model<IExamAttempt>("ExamAttempt", examAttemptSchema);
