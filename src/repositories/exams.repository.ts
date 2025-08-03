import mongoose from 'mongoose';
import { ExamSchema } from '../models/exam.model';
import { QuestionSchema } from '../models/question.model';

export class ExamRepository {
  private getModels(schoolName: string) {
    const db = mongoose.connection.useDb(schoolName);
    const Exam = db.models.Exam || db.model('Exam', ExamSchema);
    const Question = db.models.Question || db.model('Question', QuestionSchema);
    return { Exam, Question };
  }

  async createExam(schoolName: string, title: string) {
    const { Exam } = this.getModels(schoolName);
    const initialData = {
      title,
      totalMarks: 0,
      questions: [],
      isDeleted: false,
    };
    return Exam.create(initialData);
  }

  async getAllExams(schoolName: string) {
    const { Exam } = this.getModels(schoolName);
    return Exam.find({ isDeleted: false }).populate('questions');
  }

  async getExamById(schoolName: string, id: string) {
    const { Exam } = this.getModels(schoolName);
    return Exam.findById(id).populate('questions');
  }

  async updateExam(schoolName: string, id: string, data: any) {
    const { Exam } = this.getModels(schoolName);
    return Exam.findByIdAndUpdate(id, data, { new: true });
  }

  async softDeleteExam(schoolName: string, examid: string) {
    const { Exam } = this.getModels(schoolName);
    console.log(examid,'ids')
    return Exam.findByIdAndUpdate(examid, { isDeleted: true }, { new: true });
  }

// repositories/exam.repository.ts
// repositories/exam.repository.ts
async createQuestion(schoolName: string, data: {
  question: string;  // Note: We'll map this to questionText
  options: string[];
  answer: number;    // Note: We'll map this to correctAnswer
  examId: string;
}) {
  const { Question, Exam } = this.getModels(schoolName);

  const newQuestion = await Question.create({
    questionText: data.question,  // ✅ Map to schema's required field
    options: data.options,
    correctAnswer: data.options[data.answer],  // ✅ Map to schema's required field (assumes it stores the actual correct option string; adjust if it's an index)
    marks: 1,  // ✅ Set default marks (required by schema; adjust if variable)
  });

  const updatedExam = await Exam.findByIdAndUpdate(
    data.examId,
    {
      $push: { questions: newQuestion._id },
      $inc: { totalMarks: newQuestion.marks || 1 },  // ✅ Use question's marks for increment (more flexible)
    },
    { new: true }
  );

  if (!updatedExam) {
    throw new Error(`Exam with ID ${data.examId} not found`);
  }

  return newQuestion;
}



  async getAllQuestions(schoolName: string) {
    const { Question } = this.getModels(schoolName);
    return Question.find({isDeleted:{$ne:true}});
  }

  async getQuestionById(schoolName: string, id: string) {
    const { Question } = this.getModels(schoolName);
    return Question.findById(id);
  }

  async updateQuestion(schoolName: string, id: string, data: any) {
    const { Question } = this.getModels(schoolName);
    return Question.findByIdAndUpdate(id, data, { new: true });
  }

async deleteQuestion(schoolName: string, questionId: string) {
  const { Question, Exam } = this.getModels(schoolName);

  const question = await Question.findById(questionId);
  if (!question) {
    throw new Error("❌ Question not found");
  }

  // Soft delete
  question.isDeleted = true;
  await question.save();

  // Remove question ID from any exams containing it
  await Exam.updateMany(
    { questions: question._id },
    {
      $pull: { questions: question._id },
      $inc: { totalMarks: -question.marks }
    }
  );

  return question;
}


  async addQuestionToExam(schoolName: string, examId: string, questionId: string) {
    const { Exam } = this.getModels(schoolName);
    return Exam.findByIdAndUpdate(
      examId,
      {
        $push: { questions: questionId },
        $inc: { totalMarks: 1 }, // increment score if needed
      },
      { new: true }
    );
  }
}
