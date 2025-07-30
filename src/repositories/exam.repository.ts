import ExamModel, { ExamDocument } from "../models/exam.model";
import { FilterQuery, UpdateQuery, Types } from "mongoose";

export class ExamRepository {
  async create(data: Partial<ExamDocument>) {
    const exam = new ExamModel(data);
    return exam.save();
  }

  async findById(id: string) {
    const [exam] = await ExamModel.aggregate([
      { $match: { _id: new Types.ObjectId(id) } },
      {
        $lookup: {
          from: "questions", // name of the collection, not the model
          localField: "questions", // field in Exam
          foreignField: "_id",     // field in Question
          as: "questions"
        }
      }
    ]);
    return exam;
  }

  async findAll(filter: FilterQuery<ExamDocument> = {}) {
    return ExamModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "questions",
          localField: "questions",
          foreignField: "_id",
          as: "questions"
        }
      }
    ]);
  }

  async updateById(id: string, updates: UpdateQuery<ExamDocument>) {
    return ExamModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  async deleteById(id: string) {
    return ExamModel.findByIdAndDelete(id).exec();
  }
}
