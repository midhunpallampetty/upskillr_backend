// services/course.service.ts
import mongoose from 'mongoose';
import { CourseRequestBody } from '../types/course.request.body';
import { CourseRepository } from '../repositories/course.repository';
import { CourseSchema } from '../models/schools/school.course.model';
import { SectionSchema } from '../models/schools/section.model';
import { VideoSchema } from '../models/schools/video.model';
import { ExamSchema } from '../models/schools/school.exam';
import { School } from '../models/school.model';
import CoursePayment from '../models/course.payment.model';
import { extractDbNameFromUrl } from '../utils/getSubdomain';

export class CourseService {
  constructor(private courseRepository: CourseRepository) {}

  async addCourse(schoolName: string, courseData: CourseRequestBody) {
    const session = await mongoose.startSession();
    let committed = false;

    try {
      session.startTransaction();

      const db = mongoose.connection.useDb(schoolName);

      const CourseModel = db.model('Course', CourseSchema);
      const SectionModel = db.model('Section', SectionSchema);
      const VideoModel = db.model('Video', VideoSchema);
      const ExamModel = db.model('Exam', ExamSchema);

      const course = await CourseModel.create([{
        courseName: courseData.courseName,
        fee: courseData.fee,
        noOfLessons: courseData.noOfLessons,
        courseThumbnail: courseData.courseThumbnail,
        isPreliminaryRequired: courseData.isPreliminaryRequired,
        school: courseData.schoolId,
        sections: []
      }], { session });

      const courseId = course[0]._id;
      const sectionIds: mongoose.Types.ObjectId[] = [];

      for (const section of courseData.sections || []) {
        let examId: mongoose.Types.ObjectId | null = null;

        if (section.exam) {
          const [createdExam] = await ExamModel.create([{
            ...section.exam,
            section: null
          }], { session });
          examId = createdExam._id;
        }

        const videoDocs = await VideoModel.insertMany(
          (section.videos || []).map(video => ({
            ...video,
            section: null
          })),
          { session }
        );

        const [sectionDoc] = await SectionModel.create([{
          sectionName: section.sectionName,
          examRequired: section.examRequired,
          exam: examId,
          videos: videoDocs.map(v => v._id),
          course: courseId
        }], { session });

        const sectionId = sectionDoc._id;
        sectionIds.push(sectionId);

        if (examId) {
          await ExamModel.updateOne({ _id: examId }, { section: sectionId }, { session });
        }

        if (videoDocs.length) {
          await VideoModel.updateMany(
            { _id: { $in: videoDocs.map(v => v._id) } },
            { section: sectionId },
            { session }
          );
        }
      }

      await CourseModel.updateOne(
        { _id: courseId },
        { $set: { sections: sectionIds } },
        { session }
      );

      await session.commitTransaction();
      committed = true;

      return await CourseModel.findById(courseId).populate({
        path: 'sections',
        populate: [{ path: 'videos' }, { path: 'exam' }]
      });

    } catch (err) {
      if (!committed) await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async getSectionsByCourseId(schoolName: string, courseId: string) {
    return await this.courseRepository.getSectionsByCourseId(schoolName, courseId);
  }

  // 🔄 Updated version with filters
  async getAllCourses({
    schoolName,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  }: {
    schoolName: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const skip = (page - 1) * limit;

    return await this.courseRepository.getFilteredCourses({
      schoolName,
      search,
      sortBy,
      sortOrder,
      skip,
      limit
    });
  }

  async fetchCourses({
    schoolName,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  }: {
    schoolName: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const skip = (page - 1) * limit;

    return await this.courseRepository.getCoursesBySubdomain({
      schoolName,
      search,
      sortBy,
      sortOrder,
      skip,
      limit,
    });
  }

  async addVideosToSection(
    schoolName: string,
    sectionId: string,
    videos: {
      videoName: string;
      url: string;
      description?: string;
    }[]
  ) {
    const db = mongoose.connection.useDb(schoolName);
  
    const Section = db.model('Section', SectionSchema);
    const Video = db.model('Video', VideoSchema);
  
    // 🔁 Convert 'title' to 'videoName'
    const videoDocs = await Video.insertMany(
      videos.map(video => ({
        videoName: video.videoName,
        url: video.url,
        description: video.description || '', // or keep it optional
        section: sectionId,
      }))
    );
  
    const videoIds = videoDocs.map(v => v._id);
  
    await Section.updateOne(
      { _id: sectionId },
      { $push: { videos: { $each: videoIds } } }
    );
  
    return videoDocs;
  }

  // services/course.service.ts

  async updateCourse(schoolName: string, courseId: string, updateData: Partial<CourseRequestBody>) {
    return await this.courseRepository.updateCourse(schoolName, courseId, updateData);
  }

  async softDeleteCourse(schoolName: string, courseId: string) {
    return await this.courseRepository.softDeleteCourse(schoolName, courseId);
  }

  async softDeleteSection(schoolName: string, sectionId: string) {
    return await this.courseRepository.softDeleteSection(schoolName, sectionId);
  }

  async getCourseById(schoolName: string, courseId: string) {
    return await this.courseRepository.getCourseById(schoolName, courseId);
  }

  async getSchoolInfoByStudentId(studentId: string) {
    return await this.courseRepository.getSchoolNameAndCourseIdByStudentId(studentId);
  }

  async getCompleteCourseDetails(schoolName: string, courseId: string) {
    const db = mongoose.connection.useDb(schoolName);

    const Course = db.model('Course', CourseSchema);
    const Section = db.model('Section', SectionSchema);
    const Video = db.model('Video', VideoSchema);

    // Fetch course with populated sections and videos, excluding deleted records
    const course = await this.courseRepository.getCompleteCourseDetails(schoolName, courseId);

    if (!course) {
      throw new Error('Course not found or deleted');
    }

    return course;
  }

  async addOrUpdateCourseExam(
    schoolName: string,
    courseId: string,
    examType: 'preliminary' | 'final',
    examId: string
  ) {
    const db = mongoose.connection.useDb(schoolName);
    const Course = db.model('Course', CourseSchema);
    const Exam = db.model('Exam', ExamSchema);

    // ✅ Check if examId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      throw new Error('Invalid exam ID');
    }

    // ✅ Check if exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      throw new Error('Exam not found');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // ✅ Validate if preliminary is allowed
    if (examType === 'preliminary') {
      if (!course.isPreliminaryRequired) {
        throw new Error('This course does not require a preliminary exam');
      }
      course.preliminaryExam = exam._id;
    } else if (examType === 'final') {
      course.finalExam = exam._id;
    } else {
      throw new Error('Invalid exam type');
    }

    return await course.save();
  }

// services/course.service.ts
async getCourseQuestions(schoolName: string, courseId: string, examType: string) {
  try {
    // Validate inputs
    if (!schoolName || !courseId || !examType) {
      throw new Error('Missing required parameters: schoolName, courseId, or examType');
    }

    // Use the specified school database
    const db = mongoose.connection.useDb(schoolName);
    const Course = db.model('Course', CourseSchema);
    const Exam = db.model('Exam', ExamSchema);

    // Fetch the course
    const course = await this.courseRepository.getCourseByIdForQuestions(schoolName, courseId);
    console.log(course,'course')
    if (!course) {
      throw new Error('Course not found or deleted');
    }

    // Determine the exam ID based on examType
    let examId: mongoose.Types.ObjectId | null = null;
    if (examType.toLowerCase() === 'preliminary') {
      if (!course.isPreliminaryRequired) {
        throw new Error('Preliminary exam is not required for this course');
      }
      examId = course.preliminaryExam;
      if (!examId) {
        throw new Error('No preliminary exam assigned to this course');
      }
    } else if (examType.toLowerCase() === 'final') {
      examId = course.finalExam;
      if (!examId) {
        throw new Error('No final exam assigned to this course');
      }
    } else {
      throw new Error(`Invalid exam type: ${examType}. Must be 'preliminary' or 'final'`);
    }

    // Fetch the exam
    const exam = await this.courseRepository.getExamById(schoolName, examId.toString());

    if (!exam) {
      throw new Error('Exam not found');
    }

    // Check if exam has questions
                  const examObj=exam.toObject();

    const questionIds = examObj.questions || [];
              console.log("prelims",questionIds)

    if (questionIds.length === 0) {
      return []; // Return empty array if no questions are associated
    }

    // Fetch questions using questionIds
    const questions = await this.courseRepository.getQuestionsByIds(schoolName, questionIds);
    return questions;
  } catch (error: any) {
    console.error(`Error fetching questions for course ${courseId} in ${schoolName}:`, error);
    throw error; // Let the controller handle the error response
  }
}
}
