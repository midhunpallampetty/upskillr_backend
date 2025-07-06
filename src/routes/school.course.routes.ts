import express from 'express';
import { CourseController } from '../controllers/school.course.controller';

const router = express.Router();
const controller=new CourseController()
router.post('/school/:schoolName/add-course', controller.addCourseToSchoolDB);
router.get('/test', controller.testApi); 
router.get('/:schoolName/courses', controller.getCoursesBySchool);
export default router;
