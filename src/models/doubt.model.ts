import mongoose, { Schema, Document } from "mongoose";

export interface IDoubt extends Document {
  title: string;
  description: string;
  images?: string[];
  author: mongoose.Types.ObjectId;
  authorModel: "Student" | "School";
  createdAt: Date;
  updatedAt: Date;
}

const doubtSchema = new Schema<IDoubt>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    author: { type: Schema.Types.ObjectId, required: true, refPath: "authorModel" },
    authorModel: { type: String, required: true, enum: ["Student", "School"] },
  },
  { timestamps: true }
);

export const Doubt = mongoose.model<IDoubt>("Doubt", doubtSchema);
