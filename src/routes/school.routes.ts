import express from 'express';
import { SchoolRepository } from '../repositories/school.repository';
import { SchoolService } from '../services/school.service';
import { SchoolController } from '../controllers/school.controller';
import { SchoolDbController } from '../controllers/schoolDb.controller';

const router = express.Router();

const schoolRepository = new SchoolRepository();
const schoolService = new SchoolService(schoolRepository);
const schoolController = new SchoolController(schoolService);
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

export default router;
