import express from 'express';
import { CourseController } from '../controllers/school.course.controller';

const router = express.Router();
const controller=new CourseController()
router.post('/school/:schoolName/add-course', controller.addCourseToSchoolDB);
router.get('/test', controller.testApi); 
router.get('/:schoolName/courses', controller.getCoursesBySchool);
router.get('/:schoolName/courses/:courseId/sections', controller.getSectionsByCourseId);
router.post('/:schoolName/sections/:sectionId/videos',controller.addVideosToSection);
  
export default router;
