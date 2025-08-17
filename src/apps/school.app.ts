import express from 'express';
import cors from 'cors';
import schoolRoutes from '../routes/school.routes';

const schoolApp = express();


schoolApp.use(cors({
  origin: process.env.FRONTEND_URL, // Use the environment variable for the frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));
schoolApp.use(express.json());

// Routes
schoolApp.use('/api', schoolRoutes);

export default schoolApp;
