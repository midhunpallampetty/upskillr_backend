import mongoose, { Schema } from "mongoose";

    export interface IForumAnswer extends Document {
  forum_question_id: mongoose.Types.ObjectId;
  text: string;
  author: mongoose.Types.ObjectId;
  authorType: "Student" | "School";
  isDeleted:boolean;
  createdAt: Date;
  updatedAt: Date;
}

const forumAnswerSchema = new Schema<IForumAnswer>(
  {
    forum_question_id: { type: Schema.Types.ObjectId, ref: "ForumQuestion", required: true },
    text: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, required: true, refPath: "authorType" },
    authorType: { type: String, required: true, enum: ["Student", "School"] },
    isDeleted:{type:Boolean,default:false},
  },
  { timestamps: true }
);

export const ForumAnswer = mongoose.model<IForumAnswer>("ForumAnswer", forumAnswerSchema);
