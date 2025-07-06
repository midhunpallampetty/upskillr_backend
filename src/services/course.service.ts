// services/course.service.ts
import { CourseRequestBody } from '../types/CourseRequestBody';
import { CourseRepository } from '../repositories/course.repository';

export class CourseService {
  private courseRepository: CourseRepository;

  constructor() {
    this.courseRepository = new CourseRepository();
  }

  async addCourse(schoolName: string, courseData: CourseRequestBody) {
    return this.courseRepository.createCourse(schoolName, courseData);
  }

  async getAllCourses(schoolName: string) {
    return this.courseRepository.getCoursesBySchoolName(schoolName);
  }
}
