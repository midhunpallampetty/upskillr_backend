import { Answer, IAnswer } from "../models/answer.model";

export class AnswerRepository {
  async create(a: Partial<IAnswer>) {
    return await Answer.create(a);
  }

  async findByDoubtId(doubtId: string) {
    return await Answer.find({ doubtId })
      .populate("author")
      .sort({ createdAt: 1 });
  }
}
