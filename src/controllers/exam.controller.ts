import { Request, Response } from 'express';
import { ExamService } from '../services/exams.service';
import { ExamRepository } from '../repositories/exams.repository';
import { extractDbNameFromUrl } from '../utils/getSubdomain';


export class ExamQuestionController {
  constructor(private service: ExamService) {}

createExam = async (req: Request, res: Response):Promise<any> => {
  try {
    const { schoolName, title } = req.body;

    if (!schoolName || !title) {
      return res.status(400).json({ message: 'schoolName and title are required' });
    }

    const exam = await this.service.createExam(schoolName, title);
    res.status(201).json({ message: '✅ Exam created', data: exam });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};


getAllExams = async (req: Request, res: Response) => {
  try {
    const { schoolName } = req.query; // ✅ Received in body as per your requirement
    const dbName = schoolName+"";
    const exams = await this.service.getAllExams(dbName);
    res.status(200).json(exams);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};


  getExam = async (req: Request, res: Response) => {
    try {
      const { schoolName, id } = req.params;
      const exam = await this.service.getExamById(schoolName, id);
      res.json(exam);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  updateExam = async (req: Request, res: Response) => {
    try {
      const { schoolName, id } = req.params;
      const updated = await this.service.updateExam(schoolName, id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  deleteExam = async (req: Request, res: Response) => {
    try {
      const { schoolName, examid } = req.params;
      const deleted = await this.service.softDeleteExam(schoolName, examid);
      res.json(deleted);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

// controllers/exam.controller.ts
createQuestion = async (req: Request, res: Response): Promise<any> => {
  try {
    const { schoolName, examId, question, options, answer } = req.body;
console.log(req.body)
    if (!schoolName || !examId || !question || !Array.isArray(options) || options.length === 0 || typeof answer !== 'number') {
      return res.status(400).json({ message: 'Missing or invalid required fields (options must be a non-empty array)' });
    }

    const createdQuestion = await this.service.createQuestion(
      schoolName,
      { question, options, answer, examId }
    );

    res.status(201).json({ message: '✅ Question created', data: createdQuestion });
  } catch (err: any) {
    console.error(err);  // ✅ Add this for server-side logging
    res.status(500).json({ message: err.message });
  }
};


  getAllQuestions = async (req: Request, res: Response) => {
    try {

      const { schoolName } = req.query;
      const dbName =schoolName+"";
      const questions = await this.service.getAllQuestions(dbName);
      res.json(questions);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  getQuestion = async (req: Request, res: Response) => {
    try {
      const { schoolName, id } = req.params;
      const question = await this.service.getQuestionById(schoolName, id);
      res.json(question);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  updateQuestion = async (req: Request, res: Response) => {
    try {
      const { schoolName, id } = req.params;
      const updated = await this.service.updateQuestion(schoolName, id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { schoolName, id } = req.params;
    const deleted = await this.service.deleteQuestion(schoolName, id);
    res.json({ message: '✅ Question soft-deleted', data: deleted });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};


  addQuestionToExam = async (req: Request, res: Response) => {
    try {
      const { schoolName, examId, questionId } = req.body;
      const dbName =schoolName;
      const result = await this.service.addQuestionToExam(dbName, examId, questionId);
      res.json({ message: '✅ Question added to exam', data: result });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };
}
