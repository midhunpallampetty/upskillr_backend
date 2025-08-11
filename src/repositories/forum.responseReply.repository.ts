import { ForumResponseReply, IForumResponseReply } from '../models/ForumResponseReply.model';

export class ForumResponseReplyRepository {
  async create(data: Partial<IForumResponseReply>) {
    return ForumResponseReply.create(data);
  }

  async findById(id: string) {
    return ForumResponseReply.findById(id);
  }

  async findByIdWithAuthor(id: string) {
    return ForumResponseReply.findById(id)
      .populate('author')
      .select('+isDeleted') // Explicitly include isDeleted if hidden
      .lean();
  }

  async softDeleteReply(id: string) {
    return ForumResponseReply.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  }

  async findByAnswerId(answerId: string) {
    return ForumResponseReply.find({ forum_answer_id: answerId })
      .select('+isDeleted') // Ensure isDeleted is included
      .sort({ createdAt: 1 });
  }

  async findByAnswerIdWithAuthor(answerId: string) {
    return ForumResponseReply.find({ forum_answer_id: answerId })
      .populate('author')
      .select('+isDeleted') // Ensure isDeleted is included
      .sort({ createdAt: 1 })
      .lean();
  }

  // For threaded replies (optional, adding select for consistency)
  async findByParentReplyId(parentReplyId: string) {
    return ForumResponseReply.find({ parent_reply_id: parentReplyId })
      .select('+isDeleted') // Ensure isDeleted is included
      .sort({ createdAt: 1 });
  }
}
