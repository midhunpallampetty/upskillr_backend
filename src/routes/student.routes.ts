import express from 'express';
import { container } from '../utils/container';
const router = express.Router();

const controller = container.studentController;

router.post('/register', controller.registerStudent);
router.post('/verify-otp',controller.verifyStudentOtp)
router.post('/login', controller.loginStudent);
router.get('/students', controller.listStudents); 
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);
router.get('/student/:id', controller.getStudentById);
router.put('/students/:id', controller.updateStudentProfile);
export default router;
