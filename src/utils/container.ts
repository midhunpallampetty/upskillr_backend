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
import { CommentRepository } from '../repositories/comment.repository';
import { CommentService } from '../services/comment.service';
import { CommentController } from '../controllers/comment.controller';
import { ExamRepository } from '../repositories/exams.repository';
import { ExamService } from '../services/exams.service';
import { ExamQuestionController } from '../controllers/exam.controller';
import { ExamAttemptRepository } from '../repositories/examAttempt.repository';
import { ExamAttemptService } from '../services/examAttempt.service';
import { ExamAttemptController } from '../controllers/examAttempt.controller';


const examRepo = new ExamRepository();
const examService = new ExamService(examRepo);
const examController = new ExamQuestionController(examService);

const commentRepo = new CommentRepository();
const commentService = new CommentService(commentRepo);
const commentController = new CommentController(commentService);

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
const examAttemptRepo = new ExamAttemptRepository();
const examAttemptService = new ExamAttemptService(examAttemptRepo);
const examAttemptController = new ExamAttemptController(examAttemptService);
export const container = {
  adminController,
  studentController,
  schoolController,
  courseController,
  videoController,
  commentController,
  examController,
  examAttemptController
};
