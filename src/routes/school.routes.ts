import express from 'express';
import { SchoolDbController } from '../controllers/schoolDb.controller';
import {container} from '../utils/container';
import { verifyToken } from '../middlewares/auth.middleware';

const router = express.Router();

const schoolController = container.schoolController;
const schoolDbController = new SchoolDbController();

router.post('/register', schoolController.register);
router.post('/login', schoolController.login);
router.post('/forgot-password', schoolController.forgotPassword);
router.post('/reset-password', schoolController.resetPassword);
router.get('/getSchools', schoolController.getAll);
router.post('/updateSchoolData', schoolController.update);
router.get('/getSchoolBySubDomain', schoolController.getBySubDomain);
router.post('/create-database', schoolController.createDatabase);
router.get('/initSchoolDb', schoolDbController.initSchoolDb);
router.get('/school/:id/check-status', schoolController.checkSchoolStatusController);
export default router;
