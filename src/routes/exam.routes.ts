// routes/examQuestion.routes.ts
import { Router } from 'express';
import { ExamQuestionController } from '../controllers/exam.controller';

const router = Router();
const controller = new ExamQuestionController();

// ----- Exam Routes -----
router.post('/exam', controller.createExam);
router.get('/exam/all-exams', controller.getAllExams);
router.get('/exam/:id', controller.getExam);
router.put('/exam/:id/:schoolName', controller.updateExam);
router.delete('/exam/:examid/:schoolName', controller.deleteExam);
router.post('/exam/add-question', controller.addQuestionToExam);

// ----- Question Routes -----
router.post('/question', controller.createQuestion);
router.get('/question/get-all', controller.getAllQuestions);
router.get('/question/:id', controller.getQuestion);
router.put('/question/:id/:schoolName', controller.updateQuestion);
router.delete('/question/:id/:schoolName', controller.deleteQuestion);

export default router;
