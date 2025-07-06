import express from 'express';
import { SchoolRepository } from '../repositories/school.repository';
import { SchoolService } from '../services/school.service';
import { SchoolController } from '../controllers/school.controller';
import { SchoolDbController } from '../controllers/schoolDb.controller';

const router = express.Router();

// Instantiate repository → service → controller
const schoolRepository = new SchoolRepository();
const schoolService = new SchoolService(schoolRepository);
const schoolController = new SchoolController(schoolService);
const schoolDbController = new SchoolDbController();

// Routes using class methods
router.post('/register', schoolController.register);
router.post('/login', schoolController.login);
router.get('/getSchools', schoolController.getAll);
router.post('/updateSchoolData', schoolController.update);
router.get('/getSchoolBySubDomain', schoolController.getBySubDomain);
router.post('/create-database', schoolController.createDatabase);

// DB init route (separately controlled)
router.get('/initSchoolDb', schoolDbController.initSchoolDb);

export default router;
