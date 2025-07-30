import mongoose from "mongoose";
import { Comment } from "../models/comment.model";

export const CommentRepository = {
  create: async (data: any) => await Comment.create(data),

findByCourseId: async (courseId: string) => {
  return await Comment.aggregate([
    {
      $match: {
        course: new mongoose.Types.ObjectId(courseId)
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $lookup: {
        from: 'students', // 👈 correct collection name
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        parentComment: 1,
        course: 1,
        school: 1,
        likes: 1,
        'user._id': 1,
        'user.fullName': 1,
        'user.email': 1,
        'user.image': 1,
        'user.isVerified': 1
      }
    }
  ]);
},
findById: async (id: string) => await Comment.findById(id),

  delete: async (id: string) => await Comment.findByIdAndDelete(id),

  updateLikes: async (id: string, likes: string[]) =>
    await Comment.findByIdAndUpdate(id, { likes }, { new: true }),
};
