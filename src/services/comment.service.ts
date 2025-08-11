import { Types } from 'mongoose';
import { CommentRepository } from '../repositories/comment.repository';

export class CommentService {
  constructor(private commentRepository: CommentRepository) {}

  async addComment(userId: string, courseId: string, schoolId: string, content: string, parentCommentId?: string) {
    const newComment = {
      user: new Types.ObjectId(userId),
      course: new Types.ObjectId(courseId),
      school: new Types.ObjectId(schoolId),
      content,
      parentComment: parentCommentId ? new Types.ObjectId(parentCommentId) : null,
      likes: [],
    };

    return await this.commentRepository.create(newComment);
  }

  async getCourseCommentsWithReplies(courseId: string) {
    const comments = await this.commentRepository.findByCourseId(courseId);
    const commentMap: Record<string, any> = {};
    const topLevel: any[] = [];

    comments.forEach((comment: any) => {
      comment.replies = [];
      commentMap[comment._id.toString()] = comment;
    });

    comments.forEach((comment: any) => {
      if (comment.parentComment) {
        const parentId = comment.parentComment.toString();
        if (commentMap[parentId]) {
          commentMap[parentId].replies.push(comment);
        }
      } else {
        topLevel.push(comment);
      }
    });

    return topLevel;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment || comment.user.toString() !== userId) return false;
    await this.commentRepository.delete(commentId);
    return true;
  }

  async likeComment(commentId: string, userId: string) {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) throw new Error('Comment not found');

    if (!comment.likes.map(String).includes(userId)) {
      comment.likes.push(new Types.ObjectId(userId));
      return await this.commentRepository.updateLikes(commentId, comment.likes);
    }

    return comment;
  }

  async unlikeComment(commentId: string, userId: string) {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) throw new Error('Comment not found');

    comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    return await this.commentRepository.updateLikes(commentId, comment.likes);
  }
}
