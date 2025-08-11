// routes/examQuestion.routes.ts
import { Router } from 'express';
import { ExamQuestionController } from '../controllers/exam.controller';
import { ExamAttemptController } from '../controllers/examAttempt.controller';
import { container } from '../utils/container';
const router = Router();
const controller =container.examController;
const attemptController=container.examAttemptController;
// ----- Exam Routes -----
router.post('/exam', controller.createExam);
router.get('/exam/all-exams', controller.getAllExams);
router.get('/exam/:id', controller.getExam);
router.put('/exam/:id/:schoolName', controller.updateExam);
router.delete('/exam/:examid/:schoolName', controller.deleteExam);
router.post('/exam/add-question', controller.addQuestionToExam);
router.post("/check-eligibility", container.examAttemptController.checkEligibility);
router.post("/submit-exam", container.examAttemptController.submitExam);
// ----- Question Routes -----
router.post('/question', controller.createQuestion);
router.get('/question/get-all', controller.getAllQuestions);
router.get('/question/:id', controller.getQuestion);
router.put('/question/:id/:schoolName', controller.updateQuestion);
router.delete('/question/:id/:schoolName', controller.deleteQuestion);

export default router;
