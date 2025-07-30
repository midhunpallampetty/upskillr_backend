// models/comment.model.ts

import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  course: Types.ObjectId;
  school: Types.ObjectId;
  user: Types.ObjectId;
  content: string;
  parentComment?: Types.ObjectId | null;
  likes: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    course: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Course'
    },
    school: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'School'
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: []
      }
    ]
  },
  {
    timestamps: true
  }
);

export const Comment = model<IComment>('Comment', commentSchema);
