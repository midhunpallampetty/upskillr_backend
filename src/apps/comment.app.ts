import express from 'express';
import cors from 'cors';
import commentRoutes from '../routes/comment.routes';

const commentApp = express();
commentApp.use(cors({ origin: '*', credentials: true }));
commentApp.use(express.json());
commentApp.use('/api', commentRoutes);

export default commentApp;
