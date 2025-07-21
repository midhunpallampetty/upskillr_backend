import express from 'express';
import { CourseController } from '../controllers/school.course.controller';
import {VideoController} from '../controllers/video.controller'
import {verifyToken} from '../middlewares/auth.middleware'
const router = express.Router();
const controller=new CourseController()
const videoController=new VideoController() 
router.post('/school/:schoolName/add-course', controller.addCourseToSchoolDB);
router.get('/test', verifyToken, controller.testApi);
router.get('/:schoolName/courses', controller.getCoursesBySchool);
router.get('/:schoolName/courses/:courseId/sections', controller.getSectionsByCourseId);
router.post('/:schoolName/sections/:sectionId/videos',controller.addVideosToSection);
router.post('/courses', controller.getCoursesBySubdomain);
router.get('/getvideo/:schoolName/:videoId', videoController.getVideoById);
router.get('/getvideos/:schoolName', videoController.getVideosByIds);
router.put('/:schoolName/course/:courseId', controller.updateCourseData);
router.patch('/:schoolName/course/:courseId/soft-delete', controller.softDeleteCourse);


export default router;
    