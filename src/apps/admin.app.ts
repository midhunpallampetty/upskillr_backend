import express from 'express';
import cors from 'cors';
import adminRoutes from '../routes/admin.routes';

const adminApp = express();
adminApp.use(cors({ origin: '*', credentials: true }));
adminApp.use(express.json());
adminApp.use('/api', adminRoutes);

export default adminApp;
