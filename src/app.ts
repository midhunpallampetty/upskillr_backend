import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import vhost from 'vhost';
import dotenv from 'dotenv';
import adminRoutes from './routes/admin.routes';
import schoolRoutes from './routes/school.routes';
import studentRoutes from './routes/student.routes';
import CourseRoutes from './routes/school.course.routes';
import logger from './utils/logger';
const app = express();
dotenv.config();
// Connect to MongoDB
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});
mongoose.connect('mongodb://127.0.0.1:27017/upskillr')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('DB error:', err));

// Create sub-apps
const adminApp = express();
const schoolApp = express();
const studentApp = express();
const courseApp = express();

// Middleware
[adminApp, schoolApp, studentApp, courseApp].forEach(subApp => {
    subApp.use(cors({ origin: '*', credentials: true }));
    subApp.use(express.json());
});

// Routes
adminApp.use('/api', adminRoutes);
schoolApp.use('/api', schoolRoutes);
studentApp.use('/api', studentRoutes);
courseApp.use('/api', CourseRoutes);

// vhost mappings
app.use(vhost('admin.localhost', adminApp));
app.use(vhost('school.localhost', schoolApp));
app.use(vhost('student.localhost', studentApp));
app.use(vhost('course.localhost', courseApp));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Optional: export only if needed for testing
export default app;
