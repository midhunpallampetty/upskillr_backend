import mongoose, { Model, SortOrder } from 'mongoose';
import { CourseSchema } from '../models/schools/school.course.model';
import { getCourseModel } from '../utils/getSchoolModel';
import { CourseRequestBody } from '../types/course.request.body';
import { ICourse } from '../models/schools/types/ICourse';
import { SectionSchema } from '../models/schools/school.sections.model';
import { VideoSchema } from '../models/schools/video.model';
import { ExamSchema } from '../models/schools/school.exam';

export class CourseRepository {
  async createCourse(schoolName: string, data: CourseRequestBody) {
    const Course: Model<ICourse> = await getCourseModel(schoolName);
    return Course.create(data);
  }
  // repositories/course.repository.ts

async updateCourse(
  schoolName: string,
  courseId: string,
  updateData: Partial<CourseRequestBody>
) {
  const db = mongoose.connection.useDb(schoolName);
  const Course = db.model<ICourse>('Course', CourseSchema);

  const updated = await Course.findByIdAndUpdate(courseId, updateData, {
    new: true,
    runValidators: true,
  });

  return updated;
}


  async getCoursesBySchoolName(schoolName: string) {
    const db = mongoose.connection.useDb(schoolName);
    const Course: Model<ICourse> = db.model<ICourse>('Course', CourseSchema);
    return Course.find().sort({ createdAt: -1 });
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

    const section = await Section.findById(sectionId);
    if (!section) throw new Error('❌ Section not found');

    if (section.videos.length + videos.length > 3) {
      throw new Error('❌ Each section can have up to 3 videos only');
    }

    const newVideos = await Video.insertMany(
      videos.map(video => ({
        ...video,
        section: section._id,
      }))
    );

    section.videos.push(...newVideos.map(v => v._id));
    await section.save();

    return await Section.findById(sectionId).populate('videos');
  }
  async getFilteredCourses({
    schoolName,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    skip = 0,
    limit = 10,
  }: {
    schoolName: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    skip?: number;
    limit?: number;
  }) {
    const db = mongoose.connection.useDb(schoolName);
    const Course: Model<ICourse> = db.model<ICourse>('Course', CourseSchema);

    const query: any = {isDeleted: { $ne: true }};
    if (search) {
      query.$or = [
        { courseName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }, // if you have description
      ];
    }

    const sortOptions: Record<string, SortOrder> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const courses = await Course.find(query).sort(sortOptions).skip(skip).limit(limit);
    const totalCount = await Course.countDocuments(query);

    return {
      courses,
      totalCount,
    };
  }
async getCoursesBySubdomain({
    schoolName,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    skip = 0,
    limit = 10,
  }: {
    schoolName: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    skip?: number;
    limit?: number;
  }) {
    const db = mongoose.connection.useDb(schoolName);
    const Course: Model<ICourse> = db.model<ICourse>('Course', CourseSchema);

    const query: any ={isDeleted: { $ne: true }};
    if (search) {
      query.$or = [
        { courseName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions: Record<string, SortOrder> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const courses = await Course.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    const totalCount = await Course.countDocuments(query);

    return { courses, totalCount };
  }
async getSectionsByCourseId(schoolName: string, courseId: string) {
  const db = mongoose.connection.useDb(schoolName);

  const Course: Model<ICourse> = db.model<ICourse>('Course', CourseSchema);
  const Section = db.model('Section', SectionSchema);
  const Video = db.model('Video', VideoSchema);
  const Exam = db.model('Exam', ExamSchema);

  const course = await Course.findById(courseId).select('sections');

  if (!course || !course.sections.length) return [];

  const sections = await Section.find({
    _id: { $in: course.sections },
    isDeleted: { $ne: true } // 🔥 Exclude soft-deleted sections
  });

  console.log(sections, 'sections');
  return sections;
}


async softDeleteCourse(schoolName: string, courseId: string) {
  const db = mongoose.connection.useDb(schoolName);
  const Course = db.model<ICourse>('Course', CourseSchema);

  return await Course.findByIdAndUpdate(
    courseId,
    { isDeleted: true },
    { new: true }
  );
}
async softDeleteSection(schoolName: string, sectionId: string) {
  const db = mongoose.connection.useDb(schoolName);
  const Section = db.model('Section', SectionSchema);

  return await Section.findByIdAndUpdate(
    sectionId,
    { isDeleted: true },
    { new: true }
  );
}


  
  
}
