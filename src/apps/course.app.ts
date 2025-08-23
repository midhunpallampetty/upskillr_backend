import express from 'express';
import cors from 'cors';
import CourseRoutes from '../routes/school.course.routes';

const courseApp = express();

// Middleware
courseApp.use(cors({ origin: 'http://localhost:5173', credentials: true }));
courseApp.use(express.json());

// Routes
courseApp.use('/api', CourseRoutes);

export default courseApp;
