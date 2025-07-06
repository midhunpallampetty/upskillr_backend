import { Connection } from 'mongoose';
import { connectToSchoolDB } from '../config/connectionManager';
import CourseSchema from '../models/schools/school.course.model';

export const getCourseModel = async (schoolName: string): Promise<any> => {
  const conn: Connection = await connectToSchoolDB(schoolName);

  return conn.models.Course || conn.model('Course', CourseSchema);
};
