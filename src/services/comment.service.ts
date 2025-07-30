import { CommentRepository } from '../repositories/comment.repository';
import { Comment } from '../models/comment.model';
import { Types } from 'mongoose';

export const CommentService = {
  addComment: async (
    userId: string,
    courseId: string,
    schoolId: string,
    content: string,
    parentCommentId?: string
  ) => {
    const newComment = {
      user: new Types.ObjectId(userId),
      course: new Types.ObjectId(courseId),
      school: new Types.ObjectId(schoolId),
      content,
      parentComment: parentCommentId ? new Types.ObjectId(parentCommentId) : null,
      likes: []
    };
    console.log(newComment,'test fine');

    return await CommentRepository.create(newComment);
  },

getCourseCommentsWithReplies: async (courseId: string) => {
  const comments = await CommentRepository.findByCourseId(courseId);

  const commentMap: Record<string, any> = {};
  const topLevel: any[] = [];

  // Convert to map with replies array
  comments.forEach((comment: any) => {
    comment.replies = [];
    commentMap[comment._id.toString()] = comment;
  });

  // Link replies to their parent comments
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
},


  deleteComment: async (commentId: string, userId: string): Promise<boolean> => {
    const comment = await CommentRepository.findById(commentId);
    if (!comment || comment.user.toString() !== userId) return false;

    await CommentRepository.delete(commentId);
    return true;
  },

  likeComment: async (commentId: string, userId: string) => {
    const comment = await CommentRepository.findById(commentId);
    if (!comment) throw new Error('Comment not found');

    if (!comment.likes.map(String).includes(userId)) {
      comment.likes.push(new Types.ObjectId(userId));
      return await CommentRepository.updateLikes(commentId, comment.likes);
    }

    return comment;
  },

  unlikeComment: async (commentId: string, userId: string) => {
    const comment = await CommentRepository.findById(commentId);
    if (!comment) throw new Error('Comment not found');

    comment.likes = comment.likes.filter(
      (id) => id.toString() !== userId
    );

    return await CommentRepository.updateLikes(commentId, comment.likes);
  }
};
