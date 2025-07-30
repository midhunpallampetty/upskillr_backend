import { Router } from "express";
import { ExamController } from "../controllers/exam.controller";

const router = Router();

// Base route: /api/exams (prefix this in your main app.ts or index.ts)

router.post("/exams", ExamController.createExam);            // POST    /api/exams        - Create exam
router.get("/exams", ExamController.listExams);              // GET     /api/exams        - List exams
router.get("/:id", ExamController.getExam);             // GET     /api/exams/:id    - Get one
router.put("/:id", ExamController.updateExam);          // PUT     /api/exams/:id    - Update
router.delete("/:id", ExamController.deleteExam);       // DELETE  /api/exams/:id    - Delete

export default router;
