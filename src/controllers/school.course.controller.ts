import { Request, Response } from 'express';
import { getCourseModel } from '../utils/getSchoolModel';
import CourseSchema from '../models/schools/school.course.model';
import mongoose from 'mongoose';
interface CourseRequestParams {
  schoolName: string;
}
interface SchoolRequestParams {
  schoolName: string;
}
interface Section {
  title: string;
}

interface CourseRequestBody {
  courseName: string;
  isPreliminaryRequired: boolean;
  courseThumbnail: string; // URL or filename
  noOfLessons: number;
  fee: number;
  sections: Section[];
  forum: string | null;
  school: string;
}

export const addCourseToSchoolDB = async (
  req: Request<CourseRequestParams, {}, CourseRequestBody>,
  res: Response
) => {
  console.log(req.body,'hai')

  const { schoolName } = req.params;
  const {
    courseName,
    isPreliminaryRequired,
    courseThumbnail,
    noOfLessons,
    fee,
    sections,
    forum,
    school,
  } = req.body;
  try {
    const Course = await getCourseModel(schoolName);

    const newCourse = await Course.create({
      courseName,
      isPreliminaryRequired,
      courseThumbnail,
      noOfLessons,
      fee,
      sections,
      forum,
      school,
    });

    res.status(201).json({
      message: '✅ Course created successfully',
      data: newCourse,
    });
  } catch (err) {
    console.error('❌ Error creating course:', err);
    res.status(500).json({ error: 'Failed to add course' });
  }
};
export const testApi = (_req: Request, res: Response) => {
    res.status(200).json({ message: '✅ Test API is working fine!' });
  };
  export const getCoursesBySchool = async (
    req: Request<SchoolRequestParams>,
    res: Response
  ): Promise<any> => {
    try {
      const { schoolName } = req.params;
  
      if (!schoolName) {
        return res.status(400).json({ message: 'Missing schoolName' });
      }
  
      const db = mongoose.connection.useDb(schoolName);
      const Course = db.model('Course', CourseSchema);
      const courses = await Course.find().sort({ createdAt: -1 });
  
      return res.status(200).json({ courses });
    } catch (error) {
      console.error('❌ Error fetching school courses:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };