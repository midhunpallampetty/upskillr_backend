import { ForumAsset, IForumAsset } from '../models/ForumAsset.model';

export class ForumAssetRepository {
  async create(data: Partial<IForumAsset>) {
    return ForumAsset.create(data);
  }

  async findByQuestionId(questionId: string) {
    return ForumAsset.find({ forum_question_id: questionId, isDeleted: false }).sort({ createdAt: 1 }).lean();
  }

  async findByAnswerId(answerId: string) {
    return ForumAsset.find({ forum_answer_id: answerId, isDeleted: false }).sort({ createdAt: 1 }).lean();
  }

  async findByReplyId(replyId: string) {
    return ForumAsset.find({ forum_response_reply_id: replyId, isDeleted: false }).sort({ createdAt: 1 }).lean();
  }
}
