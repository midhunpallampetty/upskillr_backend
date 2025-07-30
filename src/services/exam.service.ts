import { ExamRepository } from "../repositories/exam.repository";
import { ExamDocument } from "../models/exam.model";

export interface CreateExamDTO {
  title: string;
  totalMarks: number;
  questions: string[];
  minToPass: number;
}

export interface UpdateExamDTO {
  title?: string;
  totalMarks?: number;
  questions?: string[];
  minToPass?: number;
}

export class ExamService {
  private examRepo = new ExamRepository();

  createExam(data: CreateExamDTO) {
    return this.examRepo.create(data);
  }

  getExam(id: string) {
    return this.examRepo.findById(id);
  }

  listExams() {
    return this.examRepo.findAll();
  }

  updateExam(id: string, updates: UpdateExamDTO) {
    return this.examRepo.updateById(id, updates);
  }

  deleteExam(id: string) {
    return this.examRepo.deleteById(id);
  }
}
