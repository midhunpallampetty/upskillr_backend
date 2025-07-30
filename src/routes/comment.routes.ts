import express from 'express';
import { CommentController } from '../controllers/comment.controller';

const router = express.Router();

// Public
router.get('/:courseId', CommentController.getComments);
router.get('/test', CommentController.testApi);
router.post('/add-comment', CommentController.addComment);
router.delete('/:commentId', CommentController.deleteComment);
router.patch('/:commentId/like', CommentController.like);
router.patch('/:commentId/unlike', CommentController.unlike);

export default router;
