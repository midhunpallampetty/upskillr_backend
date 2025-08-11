import { Router, Request, Response } from 'express';
import { ForumController } from '../controllers/forum.controller';

const router = Router();
const forumController = new ForumController();

// POST a new question (with images)
// Body: { question, category, author, authorType, imageUrls[] }
router.post('/forum/questions', async (req: Request, res: Response):Promise<any> => {
  const { question, category, author, authorType, imageUrls = [] } = req.body;
  if (!question || !author || !authorType || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  return forumController.postQuestion(req, res);
});

// GET all questions
router.get('/forum/questions', (req: Request, res: Response) => forumController.getAllQuestions(req, res));

// GET question by id (with answers and images)
router.get('/forum/questions/:id', (req: Request, res: Response) => forumController.getQuestionWithAnswers(req, res));

// POST a new answer to a question (with images)
// Body: { forum_question_id, text, author, authorType, imageUrls[] }
router.post('/forum/answers', async (req: Request, res: Response):Promise<any> => {
  const { forum_question_id, text, author, authorType, imageUrls = [] } = req.body;
  if (!forum_question_id || !text || !author || !authorType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  return forumController.postAnswer(req, res);
});

// GET all answers for a question
router.get('/forum/answers/:questionId', (req: Request, res: Response):Promise<any> => forumController.getAnswersForQuestion(req, res));

// POST a reply to an answer (with images)
// Body: { forum_answer_id, parent_reply_id?, text, author, authorType, imageUrls[] }
router.post('/forum/replies', async (req: Request, res: Response):Promise<any> => {
    console.log(req.body,'testthjnk')
  const { forum_answer_id, parent_reply_id, text, author, authorType, imageUrls = [] } = req.body;
  if (!forum_answer_id || !text || !author || !authorType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  return forumController.postReply(req, res);
});

// GET all replies for an answer
router.get('/forum/replies/:answerId', (req: Request, res: Response) => forumController.getRepliesForAnswer(req, res));

// GET assets for a question, answer, reply
router.get('/forum/assets/question/:questionId', (req: Request, res: Response) => forumController.getAssetsForQuestion(req, res));
router.get('/forum/assets/answer/:answerId', (req: Request, res: Response) => forumController.getAssetsForAnswer(req, res));
router.get('/forum/assets/reply/:replyId', (req: Request, res: Response) => forumController.getAssetsForReply(req, res));



router.delete('/forum/questions/:id', (req, res) => forumController.deleteQuestion(req, res));
router.delete('/forum/answers/:id', (req, res) => forumController.deleteAnswer(req, res));
router.delete('/forum/replies/:id', (req, res) => forumController.deleteReply(req, res));

export default router;