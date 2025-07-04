// routes/courseRoutes.ts
import express from 'express';
import { addCourseToSchoolDB,testApi,getCoursesBySchool } from '../controllers/school.course.controller';

const router = express.Router();

router.post('/school/:schoolName/add-course', addCourseToSchoolDB);
router.get('/test', testApi); 
router.get('/:schoolName/courses', getCoursesBySchool);
export default router;
