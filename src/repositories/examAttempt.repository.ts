import { ExamAttempt, IExamAttempt, ExamType } from "../models/examAttempt.model";
import { Types } from "mongoose";

export class ExamAttemptRepository {
  async findAttempt(userId: Types.ObjectId, courseId: Types.ObjectId, examType: ExamType): Promise<IExamAttempt | null> {
    try {
      return await ExamAttempt.findOne({ userId, courseId, examType }).exec();
    } catch (error) {
      throw new Error(`Failed to find exam attempt: ${(error as Error).message}`);
    }
  }

  async createAttempt(data: Partial<IExamAttempt>): Promise<IExamAttempt> {
    try {
      return await ExamAttempt.create(data);
    } catch (error) {
      throw new Error(`Failed to create exam attempt: ${(error as Error).message}`);
    }
  }

  async updateAttempt(attempt: IExamAttempt): Promise<IExamAttempt> {
    try {
      return await attempt.save();
    } catch (error) {
      throw new Error(`Failed to update exam attempt: ${(error as Error).message}`);
    }
  }
}