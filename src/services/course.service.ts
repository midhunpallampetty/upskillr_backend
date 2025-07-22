import mongoose from 'mongoose';
import { CourseRequestBody } from '../types/course.request.body';
import { CourseRepository } from '../repositories/course.repository';
import { CourseSchema } from '../models/schools/school.course.model';
import { SectionSchema } from '../models/schools/section.model';
import { VideoSchema } from '../models/schools/video.model';
import { ExamSchema } from '../models/schools/school.exam';

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
}
