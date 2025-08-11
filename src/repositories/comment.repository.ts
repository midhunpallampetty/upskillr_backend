import mongoose from "mongoose";
import { Comment } from "../models/comment.model";

export class CommentRepository {
  async create(data: any) {
    return await Comment.create(data);
  }

  async findByCourseId(courseId: string) {
    return await Comment.aggregate([
      { $match: { course: new mongoose.Types.ObjectId(courseId) } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'students',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
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
          'user.isVerified': 1,
        },
      },
    ]);
  }

  async findById(id: string) {
    return await Comment.findById(id);
  }

  async delete(id: string) {
    return await Comment.findByIdAndDelete(id);
  }

  async updateLikes(id: string, likes: string[]) {
    return await Comment.findByIdAndUpdate(id, { likes }, { new: true });
  }
}
