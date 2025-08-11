  import { Request, Response } from 'express';
  import { ForumService } from '../services/forum.service';

  const forumService = new ForumService();

  export class ForumController {
    // --- CREATE Operations ---

    // POST a new question
    async postQuestion(req: Request, res: Response) {
      try {
        console.log(req.body,"request")
        const { question, category, author, authorType, imageUrls } = req.body;
        const qDoc = await forumService.createQuestion({ question, category, author, authorType, imageUrls });

        const io = req.app.get('io');
        if (io) io.emit('new_question', qDoc);

        res.status(201).json(qDoc);
      } catch (err: any) {
        res.status(500).json({ message: err.message });
      }
    }

    // POST a new answer to a question
    async postAnswer(req: Request, res: Response) {
      try {
        const { forum_question_id, text, author, authorType, imageUrls } = req.body;
        const aDoc = await forumService.createAnswer({ forum_question_id, text, author, authorType, imageUrls });

        const io = req.app.get('io');
        if (io) io.emit('new_answer', aDoc);

        res.status(201).json(aDoc);
      } catch (err: any) {
        res.status(500).json({ message: err.message });
      }
    }

    // POST a reply to an answer
    async postReply(req: Request, res: Response) {
      try {
        const { forum_answer_id, parent_reply_id, text, author, authorType, imageUrls } = req.body;
        const rDoc = await forumService.createReply({ forum_answer_id, parent_reply_id, text, author, authorType, imageUrls });

        const io = req.app.get('io');
        if (io) io.emit('new_reply', rDoc);

        res.status(201).json(rDoc);
      } catch (err: any) {
        res.status(500).json({ message: err.message });
      }
    }

    // --- READ Operations ---

    // GET all questions (with basic details)
    async getAllQuestions(req: Request, res: Response) {
      try {
        const questions = await forumService.getAllQuestions();
        res.json(questions);
      } catch (err: any) {
        res.status(500).json({ message: err.message });
      }
    }

    // GET question by ID (with answers and images populated)
    async getQuestionWithAnswers(req: Request, res: Response) {
      try {
        const { id } = req.params;
        const question = await forumService.getQuestionWithAnswers(id);
        res.json(question);
      } catch (err: any) {
        res.status(500).json({ message: err.message });
      }
    }

    // GET all answers for a question
    async getAnswersForQuestion(req: Request, res: Response) {
      try {
        const { questionId } = req.params;
        const answers = await forumService.getAnswersForQuestion(questionId);
        res.json(answers);
      } catch (err: any) {
        res.status(500).json({ message: err.message });
      }
    }

    // GET all replies for an answer (threaded)
    async getRepliesForAnswer(req: Request, res: Response) {
      try {
        const { answerId } = req.params;
        const replies = await forumService.getRepliesForAnswer(answerId);
        res.json(replies);
      } catch (err: any) {
        res.status(500).json({ message: err.message });
      }
    }

    // --- ASSET Queries ---

    async getAssetsForQuestion(req: Request, res: Response) {
      try {
        const { questionId } = req.params;
        const assets = await forumService.getAssetsForQuestion(questionId);
        res.json(assets);
      } catch (err: any) {
        res.status(500).json({ message: err.message });
      }
    }

    async getAssetsForAnswer(req: Request, res: Response) {
      try {
        const { answerId } = req.params;
        const assets = await forumService.getAssetsForAnswer(answerId);
        res.json(assets);
      } catch (err: any) {
        res.status(500).json({ message: err.message });
      }
    }

    async getAssetsForReply(req: Request, res: Response) {
      try {
        const { replyId } = req.params;
        const assets = await forumService.getAssetsForReply(replyId);
        res.json(assets);
      } catch (err: any) {
        res.status(500).json({ message: err.message });
      }
    }
    async deleteQuestion(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await forumService.deleteQuestion(id);
    res.json(deleted);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

async deleteAnswer(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await forumService.deleteAnswer(id);
    res.json(deleted);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

async deleteReply(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await forumService.deleteReply(id);
    res.json(deleted);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
  
  }
