import mongoose, { Schema } from "mongoose";

export interface IForumQuestion extends Document {
  question: string;
  category: string;
  author: mongoose.Types.ObjectId;
  authorType: "Student" | "School";
  isDeleted:boolean;
  createdAt: Date;
  updatedAt: Date;
}

const forumQuestionSchema = new Schema<IForumQuestion>(
  {
    question: { type: String, required: true },
    category: { type: String },
    author: { type: Schema.Types.ObjectId, required: true, refPath: "authorType" },
    authorType: { type: String, required: true, enum: ["Student", "School"] },
    isDeleted:{type:Boolean,default:false}
  },
  { timestamps: true }
);

export const ForumQuestion = mongoose.model<IForumQuestion>("ForumQuestion", forumQuestionSchema);
