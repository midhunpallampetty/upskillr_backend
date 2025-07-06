import { School } from '../models/school.model';
import SchoolSession from '../models/school.SchoolSession';
import { Types } from 'mongoose';

export class SchoolRepository {
  async findByEmail(email: string) {
    return await School.findOne({ email });
  }

  async findBySubdomain(subDomain: string) {
    return await School.findOne({ subDomain });
  }

  async findAll() {
    return await School.find().select('-password');
  }

  async findByIdAndUpdate(_id: string, updateFields: any) {
    return await School.findByIdAndUpdate(_id, { $set: updateFields }, { new: true });
  }

  async create(schoolData: any) {
    return await School.create(schoolData);
  }

  async createSession(sessionData: any) {
    return await SchoolSession.create(sessionData);
  }
}
