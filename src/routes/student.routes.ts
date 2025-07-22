import express from 'express';
import { container } from '../utils/container';
const router = express.Router();

const controller = container.studentController;

router.post('/register', controller.registerStudent);
router.post('/login', controller.loginStudent);
router.get('/students', controller.listStudents); 
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);

export default router;
