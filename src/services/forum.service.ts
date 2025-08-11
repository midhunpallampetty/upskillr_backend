import { ForumAssetRepository } from '../repositories/forum.asset.repository';
import { ForumResponseReplyRepository } from '../repositories/forum.responseReply.repository';
import { ForumAnswerRepository } from '../repositories/forum.answer';
import { ForumQuestionRepository } from '../repositories/forum.question';

export class ForumService {
  constructor(
    private questionRepo = new ForumQuestionRepository(),
    private answerRepo = new ForumAnswerRepository(),
    private replyRepo = new ForumResponseReplyRepository(),
    private assetRepo = new ForumAssetRepository()
  ) {}

  // --- CREATE Methods ---
  async createQuestion({ question, category, author, authorType, imageUrls = [] }: any) {
    const qDoc = await this.questionRepo.create({ question, category, author, authorType });
    for (const url of imageUrls) {
      await this.assetRepo.create({ forum_question_id: qDoc._id, imageUrl: url });
    }
    return qDoc;
  }

  async createAnswer({ forum_question_id, text, author, authorType, imageUrls = [] }: any) {
    const aDoc = await this.answerRepo.create({ forum_question_id, text, author, authorType });
    for (const url of imageUrls) {
      await this.assetRepo.create({ forum_answer_id: aDoc._id, imageUrl: url });
    }
    return aDoc;
  }

  async createReply({ forum_answer_id, parent_reply_id, text, author, authorType, imageUrls = [] }: any) {
    const rDoc = await this.replyRepo.create({ forum_answer_id, parent_reply_id, text, author, authorType });
    for (const url of imageUrls) {
      await this.assetRepo.create({ forum_response_reply_id: rDoc._id, imageUrl: url });
    }
    return rDoc;
  }

  // --- QUERY Methods ---

  // Get all questions, with authors (no answers or images yet)
  async getAllQuestions() {
    return this.questionRepo.findAllWithAuthor();
  }

  // Get question detail, with its answers and respective images
async getQuestionWithAnswers(questionId: string) {
  const normalizeDoc = (doc: any) =>
    typeof doc?.toObject === "function" ? doc.toObject() : doc;

  const question = await this.questionRepo.findByIdWithAuthor(questionId);
  if (!question) return null;

  // Get question assets
  const questionAssets = await this.assetRepo.findByQuestionId(questionId);

  // Get answers
  const answers = await this.answerRepo.findByQuestionIdWithAuthor(questionId);

  // For each answer, fetch its assets and replies
  const answersWithAssetsAndReplies = await Promise.all(
    answers.map(async (answer: any) => {
      const answerAssets = await this.assetRepo.findByAnswerId(answer._id);

      // Get replies for this answer
      const replies = await this.replyRepo.findByAnswerIdWithAuthor(answer._id);

      // For each reply, fetch assets
      const repliesWithAssets = await Promise.all(
        replies.map(async (reply: any) => {
          const replyAssets = await this.assetRepo.findByReplyId(reply._id);
          return {
            ...normalizeDoc(reply),
            assets: replyAssets,
          };
        })
      );

      return {
        ...normalizeDoc(answer),
        assets: answerAssets,
        replies: repliesWithAssets,
      };
    })
  );

  return {
    ...normalizeDoc(question),
    assets: questionAssets,
    answers: answersWithAssetsAndReplies,
  };
}

  // Get all answers for a specific question (with author and images)
  async getAnswersForQuestion(questionId: string) {
    const answers = await this.answerRepo.findByQuestionIdWithAuthor(questionId);
    return Promise.all(answers.map(async (answer: any) => {
      const assets = await this.assetRepo.findByAnswerId(answer._id);
      return {
        ...answer.toObject(),
        assets,
      };
    }));
  }

  // Get all replies for a specific answer (threaded), with images
  async getRepliesForAnswer(answerId: string) {
    const replies = await this.replyRepo.findByAnswerIdWithAuthor(answerId);
    return Promise.all(replies.map(async (reply: any) => {
      const assets = await this.assetRepo.findByReplyId(reply._id);
      return {
        ...reply.toObject(),
        assets,
      };
    }));
  }

  // ASSET QUERIES
  async getAssetsForQuestion(questionId: string) {
    return this.assetRepo.findByQuestionId(questionId);
  }
  async getAssetsForAnswer(answerId: string) {
    return this.assetRepo.findByAnswerId(answerId);
  }
  async getAssetsForReply(replyId: string) {
    return this.assetRepo.findByReplyId(replyId);
  }



  async deleteQuestion(questionId: string) {
  return this.questionRepo.softDeleteQuestion(questionId);
}

async deleteAnswer(answerId: string) {
  return this.answerRepo.softDeleteAnswer(answerId);
}

async deleteReply(replyId: string) {
  return this.replyRepo.softDeleteReply(replyId);
}

}
