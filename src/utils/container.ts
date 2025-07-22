import { AdminRepository } from '../repositories/admin.repository';
import { AdminService } from '../services/admin.service';
import { AdminController } from '../controllers/admin.controller';
import { StudentRepository } from '../repositories/student.repository';
import { StudentService } from '../services/student.service';
import { StudentController } from '../controllers/student.controller';
import { SchoolRepository } from '../repositories/school.repository';
import { SchoolService } from '../services/school.service';
import { SchoolController } from '../controllers/school.controller';
import { CourseRepository } from '../repositories/course.repository';
import { CourseService } from '../services/course.service';
import { CourseController } from '../controllers/school.course.controller';
import { VideoRepository } from '../repositories/video.repository';
import { VideoController } from '../controllers/video.controller';
import { VideoService } from '../services/video.service';



const studentRepo = new StudentRepository();
const studentService = new StudentService(studentRepo);
const studentController = new StudentController(studentService);

const videoRepo=new VideoRepository()
const videoService=new VideoService(videoRepo)
const videoController=new VideoController(videoService)

const courseRepo = new CourseRepository();
const courseService = new CourseService(courseRepo);
const courseController = new CourseController(courseService);

const adminRepo = new AdminRepository();
const adminService = new AdminService(adminRepo);
const adminController = new AdminController(adminService);
const schoolRepo = new SchoolRepository();
const schoolService = new SchoolService(schoolRepo);
const schoolController = new SchoolController(schoolService);

export const container = {
  adminController,
  studentController,
  schoolController,
  courseController,
  videoController
};
