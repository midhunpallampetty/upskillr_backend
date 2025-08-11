import express from 'express';
import { CommentController } from '../controllers/comment.controller';
import { container } from '../utils/container';
const router = express.Router();

// Public
const controller=container.commentController

router.get('/:courseId', controller.getComments);
router.get('/test', controller.testApi);
router.post('/add-comment', controller.addComment);
router.delete('/:commentId', controller.deleteComment);
router.patch('/:commentId/like', controller.like);
router.patch('/:commentId/unlike', controller.unlike);

export default router;
