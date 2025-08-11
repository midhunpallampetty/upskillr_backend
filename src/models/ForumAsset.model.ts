import mongoose, { Schema, Document } from "mongoose";

export interface IForumAsset extends Document {
  forum_question_id?: mongoose.Types.ObjectId; // Associated question (optional)
  forum_answer_id?: mongoose.Types.ObjectId;   // Associated answer (optional)
  forum_response_reply_id?: mongoose.Types.ObjectId; // Associated reply (optional)
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const forumAssetSchema = new Schema<IForumAsset>(
  {
    forum_question_id: { type: Schema.Types.ObjectId, ref: "ForumQuestion" },
    forum_answer_id: { type: Schema.Types.ObjectId, ref: "ForumAnswer" },
    forum_response_reply_id: { type: Schema.Types.ObjectId, ref: "ForumResponseReply" },
    imageUrl: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ForumAsset = mongoose.model<IForumAsset>("ForumAsset", forumAssetSchema);
