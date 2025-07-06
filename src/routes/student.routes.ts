import express from 'express';
import { StudentController } from '../controllers/student.controller';

const router = express.Router();
const controller=new StudentController()
router.post('/register', controller.registerStudent);
router.post('/login', controller.loginStudent);

export default router;
