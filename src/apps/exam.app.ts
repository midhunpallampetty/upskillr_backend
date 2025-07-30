import express from 'express';
import cors from 'cors';
import ExamRoutes from '../routes/exam.routes';

const examApp = express();

// Middleware
examApp.use(cors({ origin: '*', credentials: true }));
examApp.use(express.json());

// Routes
examApp.use('/api', ExamRoutes);

export default examApp;
