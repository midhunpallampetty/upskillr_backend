import { Doubt, IDoubt } from "../models/doubt.model";

export class DoubtRepository {
  async create(d: Partial<IDoubt>) {
    return await Doubt.create(d);
  }

  async findAll(limit = 50, skip = 0) {
    return await Doubt.find()
      .populate("author")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async findById(id: string) {
    return await Doubt.findById(id).populate("author");
  }
}
