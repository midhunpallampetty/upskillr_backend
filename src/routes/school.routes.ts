import express from 'express';
import { registerSchool, loginSchool,getAllSchools,updateSchool,getSchoolBySubdomain ,createSchoolDatabase} from '../controllers/school.controller';
import {initSchoolDb} from '../controllers/schoolDb.controller'
const router = express.Router();

router.post('/register', registerSchool);
router.post('/login', loginSchool);
router.get('/getSchools',getAllSchools);
router.post('/updateSchoolData',updateSchool);
router.get('/getSchoolBySubDomain',getSchoolBySubdomain);
router.get('/initSchoolDb', initSchoolDb);
router.post('/create-database', createSchoolDatabase);
export default router;
