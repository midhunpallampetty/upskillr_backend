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
      console.log(schoolName,'course data')
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
  addVideosToSection = async (req: Request, res: Response):Promise<any> => {
    try {
      const { schoolName, sectionId } = req.params;
      const videos = req.body.videos;
console.log(videos,'hai test')
      if (!Array.isArray(videos) || videos.length === 0) {
        return res.status(400).json({ message: '❌ Videos array is required' });
      }

      const updatedSection = await this.courseService.addVideosToSection(
        schoolName,
        sectionId,
        videos
      );  

      return res.status(200).json({
        message: '✅ Videos added successfully',
        data: updatedSection,
      });
    } catch (err: any) {
      console.error('❌ Error adding videos:', err);
      res.status(500).json({ message: err.message || 'Server error' });
    }
  };
  getCoursesBySchool = async (
    req: Request<CourseRequestParams>,
    res: Response
  ): Promise<any> => {
    try {
      const { schoolName } = req.params;
  
      if (!schoolName) {
        return res.status(400).json({ message: 'Missing schoolName' });
      }
  
      const {
        search = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = '1',
        limit = '10',
      } = req.query as {
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        page?: string;
        limit?: string;
      };
  
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;
  
      const filters = {
        schoolName,
        search,
        sortBy,
        sortOrder,
        skip,
        limit: limitNum,
      };
  
      const { courses, totalCount } = await this.courseService.getAllCourses(filters);
  
      return res.status(200).json({
        courses,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum),
        },
      });
    } catch (error) {
      console.error('❌ Error fetching school courses:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
  
  getSectionsByCourseId = async (req: Request, res: Response):Promise<any> => {
    try {
      const { schoolName, courseId } = req.params;
     console.log(req.params,'params')
      if (!schoolName || !courseId) {
        return res.status(400).json({ message: 'Missing schoolName or courseId' });
      }
  
      const sections = await this.courseService.getSectionsByCourseId(schoolName, courseId);
  
      return res.status(200).json({
        message: '✅ Sections fetched successfully',
        data: sections,
      });
    } catch (error) {
      console.error('❌ Error fetching course sections:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
  
  testApi = (_req: Request, res: Response) => {
    res.status(200).json({ message: '✅ Test API is working fine!' });
  };
}
