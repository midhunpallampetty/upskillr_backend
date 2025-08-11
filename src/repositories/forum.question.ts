import { ForumAsset } from '../models/ForumAsset.model';
import { ForumQuestion, IForumQuestion } from '../models/ForumQuestion.model';

export class ForumQuestionRepository {
  async create(data: Partial<IForumQuestion>) {
    return ForumQuestion.create(data);
  }

  async findById(id: string) {
    return ForumQuestion.findById(id);
  }

  async findByIdWithAuthor(id: string) {
    return ForumQuestion.findById(id)
      .populate('author')
      .select('+isDeleted') // Explicitly include isDeleted if hidden
      .lean();
  }

  async softDeleteQuestion(id: string) {
    return ForumQuestion.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  }

  async findAll() {
    return ForumQuestion.find()
      .select('+isDeleted') // Ensure isDeleted is included
      .sort({ createdAt: -1 });
  }

  async findAllWithAuthor() {
    // Get all questions with author populated, including isDeleted
    const questions = await ForumQuestion.find()
      .populate('author') // already works for Student/School
      .select('+isDeleted') // Explicitly include isDeleted
      .sort({ createdAt: -1 })
      .lean();

    // Collect question IDs
    const questionIds = questions.map(q => q._id);

    // Get all assets for these questions (no change needed, as assets don't have isDeleted)
    const assets = await ForumAsset.find({
      forum_question_id: { $in: questionIds }
    })
      .select('_id forum_question_id imageUrl') // only what’s needed
      .lean();

    // Group assets by question ID
    const assetMap = assets.reduce((acc, asset) => {
      const key = asset.forum_question_id.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(asset);
      return acc;
    }, {} as Record<string, typeof assets>);

    // Attach assets to each question (isDeleted is already in questions)
    return questions.map(q => ({
      ...q,
      assets: assetMap[q._id.toString()] || []
    }));
  }
}
