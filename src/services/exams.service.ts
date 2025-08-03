import { ExamRepository } from '../repositories/exams.repository';

export class ExamService {
  constructor(private examRepo: ExamRepository) {}

async createExam(schoolName: string, title: string) {
  return this.examRepo.createExam(schoolName, title);
}


async getAllExams(schoolName: string) {
  return this.examRepo.getAllExams(schoolName);
}


  async getExamById(schoolName: string, id: string) {
    return this.examRepo.getExamById(schoolName, id);
  }

  async updateExam(schoolName: string, id: string, data: any) {
    return this.examRepo.updateExam(schoolName, id, data);
  }

  async softDeleteExam(schoolName: string, examid: string) {
    return this.examRepo.softDeleteExam(schoolName, examid);
  }

// services/exam.service.ts
async createQuestion(schoolName: string, data: {
  question: string;
  options: string[];
  answer: number;
  examId: string;
}) {
  return this.examRepo.createQuestion(schoolName, data);
}



  async getAllQuestions(schoolName: string) {
    return this.examRepo.getAllQuestions(schoolName);
  }

  async getQuestionById(schoolName: string, id: string) {
    return this.examRepo.getQuestionById(schoolName, id);
  }

  async updateQuestion(schoolName: string, id: string, data: any) {
    return this.examRepo.updateQuestion(schoolName, id, data);
  }

async deleteQuestion(schoolName: string, questionId: string) {
  return this.examRepo.deleteQuestion(schoolName, questionId);
}


  async addQuestionToExam(schoolName: string, examId: string, questionId: string) {
    return this.examRepo.addQuestionToExam(schoolName, examId, questionId);
  }
}
