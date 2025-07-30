import express from 'express';
import {VideoController} from '../controllers/video.controller'
import {verifyToken} from '../middlewares/auth.middleware'
import {container} from "../utils/container"
import { PaymentController } from '../controllers/payment.controller';
const router = express.Router();

const controller=container.courseController;
const videoController=container.videoController;
const paymentController=new PaymentController()
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
router.patch('/:schoolName/sections/:sectionId/soft-delete', controller.softDeleteSection);
router.patch('/:schoolName/videos/:videoId/soft-delete', videoController.softDeleteVideo);
router.get('/:schoolName/course/:courseId', controller.getCourseById);
router.post('/payment/checkout/:schoolName/:courseId', paymentController.createStripeCheckout);
router.post('/payment/save', paymentController.saveStripePaymentDetails);
router.get('/payment/session/:sessionId', paymentController.getStripeSessionDetails);
router.get('/course/school-info/:studentId', controller.getSchoolInfoByStudentId);
router.get('/courses/:schoolName/:courseId/complete', controller.getCompleteCourseDetails);
export default router;  
