import express from 'express';
import cors from 'cors';
import studentRoutes from '../routes/student.routes';

const studentApp = express();

// Middleware
studentApp.use(cors({ origin: '*', credentials: true }));
studentApp.use(express.json());

// Routes
studentApp.use('/api', studentRoutes);

export default studentApp;
