import express from 'express';
import adminController from '../controllers/admin.controller';

const router = express.Router();

router.post('/register',adminController.registerAdmin);
router.post('/login', adminController.loginAdmin);

export default router;
