// controllers/course.controller.ts
import { Request, Response } from 'express';
import { CourseService } from '../services/course.service';
import { CourseRequestBody } from '../types/course.request.body';
import { CourseRequestParams } from '../types/course.request.params';

export class CourseController {
  private courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  addCourseToSchoolDB = async (
    req: Request<CourseRequestParams, {}, CourseRequestBody>,
    res: Response
  ) => {
    try {
      const { schoolName } = req.params;
      const newCourse = await this.courseService.addCourse(schoolName, req.body);

      res.status(201).json({
        message: '✅ Course created successfully',
        data: newCourse,
      });
    } catch (err) {
      console.error('❌ Error creating course:', err);
      res.status(500).json({ error: 'Failed to add course' });
    }
  };

  getCoursesBySchool = async (
    req: Request<CourseRequestParams>,
    res: Response
  ):Promise<any> => {
    try {
      const { schoolName } = req.params;

      if (!schoolName) {
        return res.status(400).json({ message: 'Missing schoolName' });
      }

      const courses = await this.courseService.getAllCourses(schoolName);
      return res.status(200).json({ courses });
    } catch (error) {
      console.error('❌ Error fetching school courses:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

  testApi = (_req: Request, res: Response) => {
    res.status(200).json({ message: '✅ Test API is working fine!' });
  };
}
