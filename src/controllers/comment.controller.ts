import { Request, Response } from 'express';
import { CommentService } from '../services/comment.service';
import { School } from '../models/school.model';

export class CommentController {
  constructor(private commentService: CommentService) {}

  addComment = async (req: Request, res: Response): Promise<any> => {
    try {
      const { userId, courseId, schoolName, text, parentId } = req.body;

      if (!userId || !courseId || !schoolName || !text) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const subdomain = `http://${schoolName}.localhost:5173`;
      const school = await School.findOne({ subDomain: subdomain });
      const schoolId = school?._id?.toString();

      const comment = await this.commentService.addComment(userId, courseId, schoolId as string, text, parentId);
      res.status(201).json(comment);
    } catch (err) {
      console.error('Add Comment Error:', err);
      res.status(500).json({ message: 'Failed to add comment', error: err });
    }
  };

  getComments = async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;
      const data = await this.commentService.getCourseCommentsWithReplies(courseId);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch comments', error: err });
    }
  };

  deleteComment = async (req: Request, res: Response): Promise<any> => {
    try {
      const { userId } = req.body;
      const { commentId } = req.params;

      const deleted = await this.commentService.deleteComment(commentId, userId);
      if (!deleted) return res.status(404).json({ message: 'Comment not found or not owned' });

      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete comment', error: err });
    }
  };

  like = async (req: Request, res: Response) => {
    try {
      const { commentId } = req.params;
      const { userId } = req.body;

      const updated = await this.commentService.likeComment(commentId, userId);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: 'Failed to like comment', error: err });
    }
  };

  unlike = async (req: Request, res: Response) => {
    try {
      const { commentId } = req.params;
      const { userId } = req.body;

      const updated = await this.commentService.unlikeComment(commentId, userId);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: 'Failed to unlike comment', error: err });
    }
  };

  testApi = async (_req: Request, res: Response) => {
    res.status(200).json({ message: '✅ Test API is working fine!' });
  };
}
