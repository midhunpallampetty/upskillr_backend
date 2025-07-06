// repositories/course.repository.ts
import mongoose from 'mongoose';
import CourseSchema from '../models/schools/school.course.model';
import { getCourseModel } from '../utils/getSchoolModel';
import { CourseRequestBody } from '../types/CourseRequestBody';

export class CourseRepository {
  async createCourse(schoolName: string, data: CourseRequestBody) {
    const Course = await getCourseModel(schoolName);
    return Course.create(data);
  }

  async getCoursesBySchoolName(schoolName: string) {
    const db = mongoose.connection.useDb(schoolName);
    const Course = db.model('Course', CourseSchema);
    return Course.find().sort({ createdAt: -1 });
  }
}
