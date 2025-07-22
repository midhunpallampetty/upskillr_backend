import express from 'express';
import {container} from '../utils/container'

const router = express.Router();

const controller=container.adminController

router.post('/register',controller.registerAdmin);
router.post('/login', controller.loginAdmin);

export default router;
