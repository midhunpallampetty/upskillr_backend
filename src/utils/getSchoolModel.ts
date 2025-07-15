// utils/getSchoolModel.ts
import mongoose from 'mongoose';
import { CourseSchema } from '../models/schools/school.course.model';
import { SectionSchema } from '../models/schools/school.sections.model';
import { VideoSchema } from '../models/schools/video.model';
import { ExamSchema } from '../models/schools/school.exam';

const getModel = (schoolName: string, modelName: string, schema: any) => {
  const db = mongoose.connection.useDb(schoolName, { useCache: true });
  return db.models[modelName] || db.model(modelName, schema);
};

export const getCourseModel = (schoolName: string) =>
  getModel(schoolName, 'Course', CourseSchema);

export const getSectionModel = (schoolName: string) =>
  getModel(schoolName, 'Section', SectionSchema);

export const getVideoModel = (schoolName: string) =>
  getModel(schoolName, 'Video', VideoSchema);

export const getExamModel = (schoolName: string) =>
  getModel(schoolName, 'Exam', ExamSchema);
