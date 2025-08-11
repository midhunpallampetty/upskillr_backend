import mongoose, { Schema, Document } from "mongoose";

export interface IAnswer extends Document {
  doubtId: mongoose.Types.ObjectId;
  content: string;
  images?: string[];
  author: mongoose.Types.ObjectId;
  authorModel: "Student" | "School";
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<IAnswer>(
  {
    doubtId: { type: Schema.Types.ObjectId, ref: "Doubt", required: true },
    content: { type: String, required: true },
    images: [{ type: String }],
    author: { type: Schema.Types.ObjectId, required: true, refPath: "authorModel" },
    authorModel: { type: String, required: true, enum: ["Student", "School"] },
  },
  { timestamps: true }
);

export const Answer = mongoose.model<IAnswer>("Answer", answerSchema);
