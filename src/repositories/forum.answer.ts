import { ForumAnswer, IForumAnswer } from '../models/ForumAnswer.model';

export class ForumAnswerRepository {
  async create(data: Partial<IForumAnswer>) {
    return ForumAnswer.create(data);
  }

  async findById(id: string) {
    return ForumAnswer.findById(id);
  }

  async softDeleteAnswer(id: string) {
    return ForumAnswer.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  }

  async findByIdWithAuthor(id: string) {
    return ForumAnswer.findById(id)
      .populate('author')
      .select('+isDeleted') // Explicitly include isDeleted if hidden in schema
      .lean();
  }

  async findByQuestionId(questionId: string) {
    return ForumAnswer.find({ forum_question_id: questionId })
      .select('+isDeleted') // Ensure isDeleted is included
      .sort({ createdAt: 1 });
  }

  async findByQuestionIdWithAuthor(questionId: string) {
    return ForumAnswer.find({ forum_question_id: questionId })
      .populate('author')
      .select('+isDeleted') // Ensure isDeleted is included
      .sort({ createdAt: 1 })
      .lean();
  }
}
