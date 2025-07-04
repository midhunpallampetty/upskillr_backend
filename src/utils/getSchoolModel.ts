// utils/getSchoolModel.ts
import { Connection } from 'mongoose';
import { connectToSchoolDB } from '../config/connectionManager';
import CourseSchema from '../models/schools/school.course.model';

export const getCourseModel = async (schoolName: string): Promise<any> => {
  const conn: Connection = await connectToSchoolDB(schoolName);

  // Avoid model overwrite in same connection
  return conn.models.Course || conn.model('Course', CourseSchema);
};
