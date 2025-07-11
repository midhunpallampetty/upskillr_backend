// utils/getSchoolModel.ts
import mongoose from 'mongoose';
import { CourseSchema } from '../models/schools/school.course.model';
import { SectionSchema } from '../models/schools/school.sections.model';
import { VideoSchema } from '../models/schools/video.model';
import { ExamSchema } from '../models/schools/school.exam'; // or whatever yours is

export const getCourseModel = (schoolName: string) => {
  const db = mongoose.connection.useDb(schoolName);
  return db.models.Course || db.model('Course', CourseSchema);
};

export const getSectionModel = (schoolName: string) => {
  const db = mongoose.connection.useDb(schoolName);
  return db.models.Section || db.model('Section', SectionSchema);
};

export const getVideoModel = (schoolName: string) => {
  const db = mongoose.connection.useDb(schoolName);
  return db.models.Video || db.model('Video', VideoSchema);
};

export const getExamModel = (schoolName: string) => {
  const db = mongoose.connection.useDb(schoolName);
  return db.models.Exam || db.model('Exam', ExamSchema);
};
