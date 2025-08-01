import express from 'express';
import vhost from 'vhost';
import dotenv from 'dotenv';
import requestLogger from '../src/middlewares/logger';
import adminApp from './apps/admin.app';
import schoolApp from './apps/school.app';
import studentApp from './apps/student.app';
import courseApp from './apps/course.app';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import commentRoutes from '../src/routes/comment.routes'
import commentApp from './apps/comment.app';
import examApp from './apps/exam.app';
dotenv.config()


  
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, 
}));
app.use(vhost('admin.localhost', adminApp));
app.use(vhost('school.localhost', schoolApp));
app.use(vhost('student.localhost', studentApp));
app.use(vhost('course.localhost', courseApp));
app.use(vhost('comment.localhost', commentApp));
app.use(vhost('exam.localhost',examApp));
app.use(errorHandler);

export default app;

