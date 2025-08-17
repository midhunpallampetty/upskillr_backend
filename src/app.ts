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
import cookieParser from 'cookie-parser';
import authRoutes from '../src/routes/auth.routes'
import chatApp from './apps/chat.app';
dotenv.config()

  
const app = express();
app.use(express.json());
    
app.use(cookieParser());
app.use(cors({
  origin:process.env.FRONTEND_URL ,
  credentials: true, 
}));

app.use(vhost('admin.localhost', adminApp));
app.use(vhost('school.localhost', schoolApp));
app.use(vhost('student.localhost', studentApp));
app.use(vhost('course.localhost', courseApp));
app.use(vhost('chat.localhost', chatApp));
app.use(vhost('comment.localhost', commentApp));
app.use(vhost('exam.localhost',examApp));
app.use('/api', authRoutes);
app.use(errorHandler);

export default app;

