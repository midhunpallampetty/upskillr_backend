import express from 'express';
import vhost from 'vhost';
import dotenv from 'dotenv';
import requestLogger from '../src/middlewares/logger';
import adminApp from './apps/adminApp';
import schoolApp from '../src/apps/schoolApp';
import studentApp from './apps/studentApp';
import courseApp from './apps/courseApp';

dotenv.config()

  
  
const app = express();

app.use(requestLogger);
app.use(vhost('admin.localhost', adminApp));
app.use(vhost('school.localhost', schoolApp));
app.use(vhost('student.localhost', studentApp));
app.use(vhost('course.localhost', courseApp));
export default app;

