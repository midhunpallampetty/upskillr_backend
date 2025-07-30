import { Request, Response, NextFunction } from "express";
import { ExamService } from "../services/exam.service";

const examService = new ExamService();

export class ExamController {
  static async createExam(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { title, totalMarks, questions, minToPass } = req.body;
      console.log(req.body, "test");

      // Basic validation
      if (!title || !totalMarks || !questions?.length || !minToPass) {
        return res
          .status(400)
          .json({ error: "All fields are required: title, totalMarks, questions, minToPass" });
      }

      const exam = await examService.createExam({
        title,
        totalMarks,
        questions,
        minToPass,
      });

      res.status(201).json(exam);
    } catch (err) {
      next(err);
    }
  }

  static async getExam(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;

      const exam = await examService.getExam(id);
      if (!exam) return res.status(404).json({ error: "Exam not found" });
      res.json(exam);
    } catch (err) {
      next(err);
    }
  }

  static async listExams(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const exams = await examService.listExams();
      res.json(exams);
    } catch (err) {
      next(err);
    }
  }

  static async updateExam(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedExam = await examService.updateExam(id, updates);
      if (!updatedExam) {
        return res.status(404).json({ error: "Exam not found" });
      }
      res.json(updatedExam);
    } catch (err) {
      next(err);
    }
  }

  static async deleteExam(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;

      const deleted = await examService.deleteExam(id);
      if (!deleted) {
        return res.status(404).json({ error: "Exam not found" });
      }

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
