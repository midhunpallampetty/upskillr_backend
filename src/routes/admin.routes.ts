import express from 'express';
import {AdminController} from '../controllers/admin.controller';

const router = express.Router();
const controller=new AdminController()
router.post('/register',controller.registerAdmin);
router.post('/login', controller.loginAdmin);

export default router;
