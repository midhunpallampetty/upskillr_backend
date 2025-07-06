import express from 'express';
import cors from 'cors';
import schoolRoutes from '../routes/school.routes';

const schoolApp = express();

// Middleware
schoolApp.use(cors({ origin: '*', credentials: true }));
schoolApp.use(express.json());

// Routes
schoolApp.use('/api', schoolRoutes);

export default schoolApp;
