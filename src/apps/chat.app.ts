import express from 'express';
import cors from 'cors';
import forumRoutes from '../routes/forum.routes';

const chatApp = express();
chatApp.use(cors({
  origin: process.env.FRONTEND_URL ,
  credentials: true,
}));
chatApp.use(express.json());

// REST API for doubts/answers
chatApp.use('/api', forumRoutes);

export default chatApp;
