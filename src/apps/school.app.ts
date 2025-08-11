import express from 'express';
import cors from 'cors';
import schoolRoutes from '../routes/school.routes';

const schoolApp = express();


schoolApp.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));
schoolApp.use(express.json());

// Routes
schoolApp.use('/api', schoolRoutes);

export default schoolApp;
