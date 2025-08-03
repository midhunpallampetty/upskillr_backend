// repositories/course.repository.ts
import mongoose, { Model, SortOrder } from 'mongoose';
import { CourseSchema } from '../models/schools/school.course.model';
import { getCourseModel } from '../utils/getSchoolModel';
import { CourseRequestBody } from '../types/course.request.body';
import { ICourse } from '../models/schools/types/ICourse';
import { SectionSchema } from '../models/schools/school.sections.model';
import { VideoSchema } from '../models/schools/video.model';
import { ExamSchema } from '../models/schools/school.exam';
import { School } from '../models/school.model';
import CoursePayment from '../models/course.payment.model';
import { QuestionSchema } from '../models/question.model';
import { extractDbNameFromUrl } from '../utils/getSubdomain';

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

    const query: any = { isDeleted: { $ne: true } };
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

    const query: any = { isDeleted: { $ne: true } };
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

  async getCourseById(schoolName: string, courseId: string) {
    const db = mongoose.connection.useDb(schoolName);
    const Course: Model<ICourse> = db.model<ICourse>('Course', CourseSchema);

    const course = await Course.findOne({
      _id: courseId,
      isDeleted: { $ne: true },
    }).populate({
      path: 'sections',
      populate: [{ path: 'videos' }, { path: 'exam' }],
    });

    return course;
  }

  async findById(schoolName: string, courseId: string) {
    const db = mongoose.connection.useDb(schoolName);
    const Course: Model<ICourse> = db.model<ICourse>('Course', CourseSchema);
    return await Course.findById(courseId);
  }

  async getSchoolNameAndCourseIdByStudentId(studentId: string) {
    const trimmedStudentId = studentId.trim();

    const payments = await CoursePayment.find({ studentId: trimmedStudentId });

    if (!payments || payments.length === 0) {
      throw new Error('No course payments found for the given student ID');
    }

    const courseList: { schoolName: string; course: ICourse }[] = [];
    const uniqueCourseKeys = new Set<string>();

    for (const payment of payments) {
      const { schoolId, courseId } = payment;

      const key = `${schoolId}_${courseId}`;
      if (uniqueCourseKeys.has(key)) {
        continue; // Skip duplicate
      }

      const school = await School.findById(schoolId);
      if (!school || !school.subDomain) {
        console.warn(`School or subdomain not found for schoolId: ${schoolId}`);
        continue;
      }

      const schoolName = extractDbNameFromUrl(school.subDomain);
      if (!schoolName) {
        console.warn(`Unable to extract school name from subdomain: ${school.subDomain}`);
        continue;
      }

      const db = mongoose.connection.useDb(schoolName || 'guest');

      try {
        const Course: Model<ICourse> = db.model<ICourse>('Course', CourseSchema);
        const course = await Course.findById(courseId);
        if (course) {
          courseList.push({ schoolName, course });
          uniqueCourseKeys.add(key); // Mark as seen
        } else {
          console.warn(`Course not found in ${schoolName} for courseId: ${courseId}`);
        }
      } catch (err) {
        console.error(`Error fetching course from ${schoolName}:`, err.message);
      }
    }

    return courseList;
  }

  async getCompleteCourseDetails(schoolName: string, courseId: string) {
    const db = mongoose.connection.useDb(schoolName);
    const Course: Model<ICourse> = db.model<ICourse>('Course', CourseSchema);
    const Section = db.model('Section', SectionSchema);
    const Video = db.model('Video', VideoSchema);

    // Fetch course with populated sections and videos
    const course = await Course.findOne({
      _id: courseId,
      isDeleted: { $ne: true },
    });

    if (!course) throw new Error('Course not found');

    const populatedSections = await Promise.all(
      course.sections.map(async (sectionId: any) => {
        const section = await Section.findOne({ _id: sectionId, isDeleted: { $ne: true } });

        if (!section) return null;

        const populatedVideos = await Promise.all(
          section.videos.map(async (videoId: any) => {
            const video = await Video.findOne({ _id: videoId, isDeleted: { $ne: true } });
            return video;
          })
        );

        // Filter out nulls in case any video wasn't found
        return {
          ...section.toObject(),
          videos: populatedVideos.filter(Boolean),
        };
      })
    );

    // Remove any nulls in case a section wasn't found
    const finalCourse = {
      ...course.toObject(),
      sections: populatedSections.filter(Boolean),
    };

    return finalCourse;
  }

  async addOrUpdateCourseExam(
    schoolName: string,
    courseId: string,
    examType: 'preliminary' | 'final',
    examId: string
  ): Promise<any> {
    throw new Error('Not implemented');
  }

// repositories/course.repository.ts
async getCourseByIdForQuestions(schoolName: string, courseId: string) {
  const db = mongoose.connection.useDb(schoolName);
  const Course: Model<ICourse> = db.model<ICourse>('Course', CourseSchema);
  return await Course.findOne({
    _id: courseId,
    isDeleted: { $ne: true },
  }).select('preliminaryExam finalExam isPreliminaryRequired');
}

// repositories/course.repository.ts
async getExamById(schoolName: string, examId: string) {
  const db = mongoose.connection.useDb(schoolName);
  const Exam = db.model('Exam', ExamSchema);
  
  const examData = await Exam.findOne({
    _id: examId,
    isDeleted: { $ne: true },
  })
  
  console.log('Exam Data:', examData); // Debug log
  return examData;
}

async getQuestionsByIds(schoolName: string, questionIds: string[]) {
  const db = mongoose.connection.useDb(schoolName);
  const Question = db.model('Question', QuestionSchema);
  const ids = questionIds.map(id => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid question ID: ${id}`);
    }
    return new mongoose.Types.ObjectId(id);
  });
  const questions = await Question.find({
    _id: { $in: ids },
    isDeleted: { $ne: true },
  }).exec();
  console.log('Questions Fetched:', questions); // Debug log
  return questions;
}
  
}

