import { Request, Response } from 'express';
import { CourseService } from '../services/course.service';
import { CourseRequestBody } from '../types/course.request.body';
import { CourseRequestParams } from '../types/course.request.params';
import { extractDbNameFromUrl } from '../utils/getSubdomain';

export class CourseController {
  constructor(private courseService: CourseService) {}

  addCourseToSchoolDB = async (
    req: Request<CourseRequestParams, {}, CourseRequestBody>,
    res: Response
  ) => {
    try {
      const { schoolName } = req.params;
      console.log(schoolName, 'course data');
      const newCourse = await this.courseService.addCourse(schoolName, req.body);

      res.status(201).json({
        message: '✅ Course created successfully',
        data: newCourse,
      });
    } catch (err) {
      console.error('❌ Error creating course:', err);
      res.status(500200).json({ error: 'Failed to add course' });
    }
  };

  addVideosToSection = async (req: Request, res: Response): Promise<any> => {
    try {
      const { schoolName, sectionId } = req.params;
      const videos = req.body.videos;
      console.log(videos, 'hai test');

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

  getCoursesBySubdomain = async (req: Request, res: Response): Promise<any> => {
    try {
      const {
        schoolName, // this is actually a full URL like "http://gamersclub.localhost:5173"
        search = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = '1',
        limit = '10',
      } = req.body as {
        schoolName?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        page?: string;
        limit?: string;
      };

      if (!schoolName) {
        return res.status(400).json({ message: 'Missing schoolName URL in request body' });
      }

      const dbName = extractDbNameFromUrl(schoolName);

      if (!dbName) {
        return res.status(400).json({ message: 'Unable to extract DB name from provided URL' });
      }

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      const result = await this.courseService.fetchCourses({
        schoolName: dbName,
        search,
        sortBy,
        sortOrder,
        page: pageNum,
        limit: limitNum,
      });

      return res.status(200).json({
        courses: result.courses,
        pagination: {
          total: result.totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(result.totalCount / limitNum),
        },
      });
    } catch (error) {
      console.error('❌ Error in getCoursesBySubdomain:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

  updateCourseData = async (req: Request, res: Response): Promise<any> => {
    try {
      const { schoolName, courseId } = req.params;
      const updateData = req.body;

      if (!schoolName || !courseId) {
        return res.status(400).json({ message: 'Missing schoolName or courseId' });
      }

      const updatedCourse = await this.courseService.updateCourse(schoolName, courseId, updateData);

      if (!updatedCourse) {
        return res.status(404).json({ message: 'Course not found or update failed' });
      }

      return res.status(200).json({
        message: '✅ Course updated successfully',
        data: updatedCourse,
      });
    } catch (error) {
      console.error('❌ Error updating course:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

  softDeleteSection = async (req: Request, res: Response): Promise<any> => {
    try {
      const { schoolName, sectionId } = req.params;

      if (!schoolName || !sectionId) {
        return res.status(400).json({ message: 'Missing schoolName or sectionId' });
      }

      const deletedSection = await this.courseService.softDeleteSection(schoolName, sectionId);

      if (!deletedSection) {
        return res.status(404).json({ message: 'Section not found or already deleted' });
      }

      return res.status(200).json({
        message: '✅ Section soft-deleted successfully',
        data: deletedSection,
      });
    } catch (error) {
      console.error('❌ Error soft-deleting section:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

  getSectionsByCourseId = async (req: Request, res: Response): Promise<any> => {
    try {
      const { schoolName, courseId } = req.params;
      console.log( 'parahhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhms');

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

  softDeleteCourse = async (req: Request, res: Response): Promise<any> => {
    try {
      const { schoolName, courseId } = req.params;

      if (!schoolName || !courseId) {
        return res.status(400).json({ message: 'Missing schoolName or courseId' });
      }

      const deletedCourse = await this.courseService.softDeleteCourse(schoolName, courseId);

      if (!deletedCourse) {
        return res.status(404).json({ message: 'Course not found or already deleted' });
      }

      return res.status(200).json({
        message: '✅ Course soft-deleted successfully',
        data: deletedCourse,
      });
    } catch (error) {
      console.error('❌ Error soft-deleting course:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

  testApi = (_req: Request, res: Response) => {
    res.status(200).json({ message: '✅ Test API is working fine!' });
  };

  getCourseById = async (req: Request, res: Response): Promise<any> => {
    try {
      const { schoolName, courseId } = req.params;

      if (!schoolName || !courseId) {
        return res.status(400).json({ message: 'Missing schoolName or courseId' });
      }

      const course = await this.courseService.getCourseById(schoolName, courseId);

      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      return res.status(200).json({
        message: '✅ Course fetched successfully',
        data: course,
      });
    } catch (error) {
      console.error('❌ Error fetching course:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

  getSchoolInfoByStudentId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params;

      if (!studentId) {
        res.status(400).json({ message: 'Student ID is required' });
        return;
      }

      const data = await this.courseService.getSchoolInfoByStudentId(studentId);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getCompleteCourseDetails = async (req: Request, res: Response): Promise<any> => {
    try {
      const { schoolName, courseId } = req.params;

      if (!schoolName || !courseId) {
        return res.status(400).json({ message: 'Missing schoolName or courseId' });
      }

      const courseDetails = await this.courseService.getCompleteCourseDetails(schoolName, courseId);

      if (!courseDetails) {
        return res.status(404).json({ message: 'Course not found or deleted' });
      }

      return res.status(200).json({
        message: '✅ Complete course details fetched successfully',
        data: courseDetails,
      });
    } catch (error: any) {
      console.error('❌ Error fetching complete course details:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

  addOrUpdateCourseExam = async (req: Request, res: Response): Promise<any> => {
    try {
      const { schoolName, courseId } = req.params;
      const { examId, examType } = req.body;

      if (!examId || !examType) {
        return res.status(400).json({ message: 'examId and examType are required' });
      }

      const result = await this.courseService.addOrUpdateCourseExam(schoolName, courseId, examType, examId);
      res.status(200).json({ message: 'Exam updated successfully', course: result });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getCourseQuestions = async (req: Request, res: Response): Promise<any> => {
    try {
      const { courseId, examType, schoolName } = req.query as { courseId: string; examType: string; schoolName: string };

      if (!courseId || !examType || !schoolName) {
        return res.status(400).json({ message: 'Missing required parameters: courseId, examType, schoolName' });
      }

      const questions = await this.courseService.getCourseQuestions(schoolName, courseId, examType);
      res.status(200).json(questions);
    } catch (error: any) {
      console.error('Error in getCourseQuestions controller:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  // UPDATED: Get student progress for a course (now includes passedSections)
  getStudentProgress = async (req: Request, res: Response): Promise<any> => {
    try {
      const { schoolName, courseId } = req.params;
      const { studentId } = req.query; // Assuming studentId from query; adjust if from auth

      if (!schoolName || !courseId || !studentId) {
        return res.status(400).json({ message: 'Missing schoolName, courseId, or studentId' });
      }

      const progress = await this.courseService.fetchStudentProgress(schoolName, studentId as string, courseId);

      return res.status(200).json({
        message: '✅ Progress fetched successfully',
        ...progress, // Returns { videos, passedSections }
      });
    } catch (error: any) {
      console.error('❌ Error fetching progress:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

  // EXISTING: Save/update video progress for a student in a course
  saveStudentProgress = async (req: Request, res: Response): Promise<any> => {
    try {
      const { schoolName, courseId, videoId } = req.params;
      const { studentId, completed, lastPosition } = req.body;

      if (!schoolName || !courseId || !videoId || !studentId) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }

      const data: { completed?: boolean; lastPosition?: number } = {};
      if (completed !== undefined) data.completed = completed;
      if (lastPosition !== undefined) data.lastPosition = lastPosition;

      if (Object.keys(data).length === 0) {
        return res.status(400).json({ message: 'No progress data provided' });
      }

      await this.courseService.saveProgress(schoolName, studentId, courseId, videoId, data);

      return res.status(200).json({
        message: '✅ Progress saved successfully',
      });
    } catch (error: any) {
      console.error('❌ Error saving progress:', error);
      return res.status(500).json({ message: 'Server error', details: error.message });
    }
  };

  // NEW: Save/update section (exam) progress for a student in a course
  saveSectionProgress = async (req: Request, res: Response): Promise<any> => {
    try {
      const { schoolName, courseId, sectionId } = req.params;
      const { studentId } = req.body; // Score removed
      console.log(sectionId,courseId,schoolName,studentId,'body')
      if (!schoolName || !courseId || !sectionId || !studentId) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }

      console.log(`Saving section progress for student ${studentId}, section ${sectionId}`); // Debug log
      await this.courseService.saveSectionProgress(schoolName, studentId, courseId, sectionId);

      return res.status(200).json({
        message: '✅ Section progress saved successfully',
      });
    } catch (error: any) {
      console.error('❌ Error saving section progress:', error);
      return res.status(500).json({ message: 'Server error', details: error.message });
    }
  };

  // NEW: Save/update final exam progress for a student in a course
  saveFinalExamProgress = async (req: Request, res: Response): Promise<any> => {
    try {
      const { schoolName, courseId } = req.params;
      const { studentId, score } = req.body; // Expect score in body; passed can be derived or set in service

      if (!schoolName || !courseId || !studentId || score === undefined) {
        return res.status(400).json({ message: 'Missing required parameters: schoolName, courseId, studentId, or score' });
      }

      // Validate score (optional: ensure it's a number between 0-100 or as per your rules)
      if (typeof score !== 'number' || score < 0) {
        return res.status(400).json({ message: 'Invalid score: must be a non-negative number' });
      }

      console.log(`Saving final exam progress for student ${studentId}, course ${courseId}, score: ${score}`); // Debug log
      await this.courseService.saveFinalExamProgress(schoolName, studentId, courseId, score);

      return res.status(200).json({
        message: '✅ Final exam progress saved successfully',
      });
    } catch (error: any) {
      console.error('❌ Error saving final exam progress:', error);
      return res.status(500).json({ message: 'Server error', details: error.message });
    }
  };

  // NEW: Check final exam completion status
  checkFinalExamCompletion = async (req: Request, res: Response): Promise<any> => {
    try {
      const { schoolName, courseId, studentId } = req.params;

      if (!schoolName || !courseId || !studentId) {
        return res.status(400).json({ message: 'Missing required parameters: schoolName, courseId, or studentId' });
      }

      const finalExamStatus = await this.courseService.checkFinalExamCompletion(
        schoolName,
        studentId,
        courseId
      );

      return res.status(200).json({
        message: '✅ Final exam completion check complete',
        ...finalExamStatus, // e.g., { isPassed: boolean, score: number, passedAt: Date }
      });
    } catch (error: any) {
      console.error('❌ Error checking final exam completion:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

  // NEW: Check if course is completed
  // controllers/course.controller.ts
  checkSectionCompletion = async (req: Request, res: Response): Promise<any> => {
    try {
      const { schoolName, courseId, studentId ,sectionId} = req.params;
      console.log(req.params)
      if (!schoolName || !courseId || !studentId || !sectionId) {
        return res.status(400).json({ message: 'Missing required parameters (schoolName, courseId, studentId, sectionId).' });
      }

      const isCompleted = await this.courseService.checkSectionCompletion(
        schoolName,
        studentId as string,
        courseId,
        sectionId as string
      );

      return res.status(200).json({
        message: '✅ Section completion check complete',
        isCompleted,
      });
    } catch (error: any) {
      console.error('❌ Error checking section completion:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

  // EXISTING: Issue certificate if course is completed
  issueCertificate = async (req: Request, res: Response): Promise<any> => {
    try {
      const { schoolName, courseId } = req.params;
      const { studentId } = req.query;
      console.log('Controller: issueCertificate called with:', { schoolName, courseId, studentId }); // Debug: Confirm params

      if (!schoolName || !courseId || !studentId) {
        return res.status(400).json({ message: 'Missing schoolName, courseId, or studentId' });
      }

      const certificateUrl = await this.courseService.issueCertificate(schoolName, studentId as string, courseId);

      if (!certificateUrl) {
        return res.status(403).json({ message: 'Course not completed yet' });
      }

      return res.status(200).json({
        message: '✅ Certificate issued successfully',
        certificateUrl,
      });
    } catch (error: any) {
      console.error('❌ Controller Error issuing certificate:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

  addExamToSection = async (req: Request, res: Response): Promise<any> => {
    try {
      const { schoolName, sectionId } = req.params;
      const { examId } = req.body;

      if (!schoolName || !sectionId || !examId) {
        return res.status(400).json({ message: 'Missing schoolName, sectionId, or examId' });
      }

      const updatedSection = await this.courseService.addExamToSection(schoolName, sectionId, examId);

      return res.status(200).json({
        message: '✅ Exam added to section successfully',
        data: updatedSection,
      });
    } catch (err: any) {
      console.error('❌ Error adding exam to section:', err);
      return res.status(500).json({ message: err.message || 'Server error' });
    }
  };

  // NEW: Add a new certificate
  addCertificate = async (req: Request, res: Response): Promise<any> => {
    try {
      const { schoolName, courseId } = req.params;
      const { studentId } = req.body; // Assuming studentId in body; adjust if needed
console.log('Controller: addCertificate called with:', { schoolName, courseId, studentId }); // Debug: Confirm params
      if (!schoolName || !courseId || !studentId) {
        return res.status(400).json({ message: 'Missing schoolName, courseId, or studentId' });
      }

      const certificateUrl = await this.courseService.addCertificate(schoolName, studentId, courseId);

      if (!certificateUrl) {
        return res.status(403).json({ message: 'Course not completed yet' });
      }

      return res.status(201).json({
        message: '✅ Certificate added successfully',
        certificateUrl,
      });
    } catch (error: any) {
      console.error('❌ Error adding certificate:', error);
      return res.status(500).json({ message: 'Server error', details: error.message });
    }
  };

  // NEW: Update an existing certificate
  updateCertificate = async (req: Request, res: Response): Promise<any> => {
    try {
      const { schoolName, courseId } = req.params;
      const { studentId, dateIssued } = req.body; // Assuming updateData like dateIssued in body

      if (!schoolName || !courseId || !studentId) {
        return res.status(400).json({ message: 'Missing schoolName, courseId, or studentId' });
      }

      const updateData = { dateIssued }; // Pass any update fields

      const certificateUrl = await this.courseService.updateCertificate(schoolName, studentId, courseId, updateData);

      if (!certificateUrl) {
        return res.status(403).json({ message: 'Course not completed yet' });
      }

      return res.status(200).json({
        message: '✅ Certificate updated successfully',
        certificateUrl,
      });
    } catch (error: any) {
      console.error('❌ Error updating certificate:', error);
      return res.status(500).json({ message: 'Server error', details: error.message });
    }
  };
}
