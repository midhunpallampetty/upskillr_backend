import mongoose, { Schema } from "mongoose";

export interface IForumResponseReply extends Document {
  forum_answer_id: mongoose.Types.ObjectId;         // Which answer this is a reply to
  parent_reply_id?: mongoose.Types.ObjectId;        // For nested/threaded replies
  text: string;
  author: mongoose.Types.ObjectId;
  authorType: "Student" | "School";
  isDeleted:boolean;
  createdAt: Date;
  updatedAt: Date;
}

const forumResponseReplySchema = new Schema<IForumResponseReply>(
  {
    forum_answer_id: { type: Schema.Types.ObjectId, ref: "ForumAnswer", required: true },
    parent_reply_id: { type: Schema.Types.ObjectId, ref: "ForumResponseReply" },
    text: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, required: true, refPath: "authorType" },
    authorType: { type: String, required: true, enum: ["Student", "School"] },
    isDeleted:{type:Boolean,default:false}
  },
  { timestamps: true }
);

export const ForumResponseReply = mongoose.model<IForumResponseReply>("ForumResponseReply", forumResponseReplySchema);
