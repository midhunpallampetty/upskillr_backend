// routes/auth.routes.ts
import express from 'express';
import { refreshTokenController,testApi } from '../controllers/auth.controller';

const router = express.Router();

router.post('/refresh-token', refreshTokenController);
router.get('/test',testApi );

export default router;
