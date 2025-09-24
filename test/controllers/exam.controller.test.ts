import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import { ExamQuestionController } from '../../src/controllers/exam.controller';
import { ExamService } from '../../src/services/exams.service';

describe('Unit: ExamQuestionController', () => {
  let controller: ExamQuestionController;
  let serviceMock: sinon.SinonStubbedInstance<ExamService>;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    serviceMock = sinon.createStubInstance(ExamService);
    controller = new ExamQuestionController(serviceMock as unknown as ExamService);

    req = { body: {}, params: {}, query: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => sinon.restore());

  // ---------- EXAM TESTS ----------
  describe('createExam', () => {
    it('should return 400 if missing fields', async () => {
      req.body = { title: 'Math Exam' }; // missing schoolName

      await controller.createExam(req as Request, res as Response);

      expect(res.status?.calledWith(400)).to.be.true;
      expect(res.json?.calledWithMatch({ message: 'schoolName and title are required' })).to.be.true;
    });

    it('should create exam and return 201', async () => {
      req.body = { schoolName: 'myschool', title: 'Math Exam' };
      const fakeExam = { id: 'e1', title: 'Math Exam' };

      serviceMock.createExam.resolves(fakeExam as any);

      await controller.createExam(req as Request, res as Response);

      expect(serviceMock.createExam.calledOnceWith('myschool', 'Math Exam')).to.be.true;
      expect(res.status?.calledWith(201)).to.be.true;
      expect(res.json?.calledWithMatch({ message: '✅ Exam created', data: fakeExam })).to.be.true;
    });

    it('should handle error', async () => {
      req.body = { schoolName: 'myschool', title: 'Math Exam' };
      serviceMock.createExam.rejects(new Error('DB error'));

      await controller.createExam(req as Request, res as Response);

      expect(res.status?.calledWith(500)).to.be.true;
      expect(res.json?.calledWithMatch({ message: 'DB error' })).to.be.true;
    });
  });

  describe('getAllExams', () => {
    it('should return all exams', async () => {
      req.query = { schoolName: 'myschool' };
      const fakeExams = [{ id: 'e1' }];

      serviceMock.getAllExams.resolves(fakeExams as any);

      await controller.getAllExams(req as Request, res as Response);

      expect(serviceMock.getAllExams.calledOnceWith('myschool')).to.be.true;
      expect(res.json?.calledWith(fakeExams)).to.be.true;
    });

    it('should return 500 on error', async () => {
      req.query = { schoolName: 'myschool' };
      serviceMock.getAllExams.rejects(new Error('DB error'));

      await controller.getAllExams(req as Request, res as Response);

      expect(res.status?.calledWith(500)).to.be.true;
      expect(res.json?.calledWithMatch({ message: 'DB error' })).to.be.true;
    });
  });

  describe('getExam', () => {
    it('should return exam by id', async () => {
      req.params = { schoolName: 'myschool', id: 'e1' };
      const fakeExam = { id: 'e1', title: 'Math' };

      serviceMock.getExamById.resolves(fakeExam as any);

      await controller.getExam(req as Request, res as Response);

      expect(serviceMock.getExamById.calledOnceWith('myschool', 'e1')).to.be.true;
      expect(res.json?.calledWith(fakeExam)).to.be.true;
    });
  });

  describe('updateExam', () => {
    it('should update exam', async () => {
      req.params = { schoolName: 'myschool', id: 'e1' };
      req.body = { title: 'Updated' };

      const updated = { id: 'e1', title: 'Updated' };
      serviceMock.updateExam.resolves(updated as any);

      await controller.updateExam(req as Request, res as Response);

      expect(serviceMock.updateExam.calledOnceWith('myschool', 'e1', { title: 'Updated' })).to.be.true;
      expect(res.json?.calledWith(updated)).to.be.true;
    });
  });

  describe('deleteExam', () => {
    it('should delete exam', async () => {
      req.params = { schoolName: 'myschool', examid: 'e1' };
      serviceMock.softDeleteExam.resolves({ success: true } as any);

      await controller.deleteExam(req as Request, res as Response);

      expect(serviceMock.softDeleteExam.calledOnceWith('myschool', 'e1')).to.be.true;
      expect(res.json?.calledWith({ success: true })).to.be.true;
    });
  });

  // ---------- QUESTION TESTS ----------
  describe('createQuestion', () => {
    it('should return 400 if missing fields', async () => {
      req.body = { schoolName: 'myschool', examId: 'e1' }; // missing question, options, answer

      await controller.createQuestion(req as Request, res as Response);

      expect(res.status?.calledWith(400)).to.be.true;
    });

    it('should create question and return 201', async () => {
      req.body = {
        schoolName: 'myschool',
        examId: 'e1',
        question: '2+2=?',
        options: ['3', '4'],
        answer: 1,
      };
      const fakeQ = { id: 'q1', question: '2+2=?' };

      serviceMock.createQuestion.resolves(fakeQ as any);

      await controller.createQuestion(req as Request, res as Response);

      expect(serviceMock.createQuestion.calledOnce).to.be.true;
      expect(res.status?.calledWith(201)).to.be.true;
      expect(res.json?.calledWithMatch({ message: '✅ Question created', data: fakeQ })).to.be.true;
    });
  });

  describe('getAllQuestions', () => {
    it('should return all questions', async () => {
      req.query = { schoolName: 'myschool' };
      const fakeQ = [{ id: 'q1' }];
      serviceMock.getAllQuestions.resolves(fakeQ as any);

      await controller.getAllQuestions(req as Request, res as Response);

      expect(serviceMock.getAllQuestions.calledOnceWith('myschool')).to.be.true;
      expect(res.json?.calledWith(fakeQ)).to.be.true;
    });
  });

  describe('getQuestion', () => {
    it('should return a question by id', async () => {
      req.params = { schoolName: 'myschool', id: 'q1' };
      const fakeQ = { id: 'q1', question: '2+2=?' };
      serviceMock.getQuestionById.resolves(fakeQ as any);

      await controller.getQuestion(req as Request, res as Response);

      expect(serviceMock.getQuestionById.calledOnceWith('myschool', 'q1')).to.be.true;
      expect(res.json?.calledWith(fakeQ)).to.be.true;
    });
  });

  describe('updateQuestion', () => {
    it('should update a question', async () => {
      req.params = { schoolName: 'myschool', id: 'q1' };
      req.body = { question: 'Updated Q' };

      const updatedQ = { id: 'q1', question: 'Updated Q' };
      serviceMock.updateQuestion.resolves(updatedQ as any);

      await controller.updateQuestion(req as Request, res as Response);

      expect(serviceMock.updateQuestion.calledOnceWith('myschool', 'q1', { question: 'Updated Q' })).to.be.true;
      expect(res.json?.calledWith(updatedQ)).to.be.true;
    });
  });

  describe('deleteQuestion', () => {
    it('should soft delete a question', async () => {
      req.params = { schoolName: 'myschool', id: 'q1' };
      serviceMock.deleteQuestion.resolves({ success: true } as any);

      await controller.deleteQuestion(req as Request, res as Response);

      expect(serviceMock.deleteQuestion.calledOnceWith('myschool', 'q1')).to.be.true;
      expect(res.json?.calledWithMatch({ message: '✅ Question soft-deleted' })).to.be.true;
    });
  });

  describe('addQuestionToExam', () => {
    it('should add a question to exam', async () => {
      req.body = { schoolName: 'myschool', examId: 'e1', questionId: 'q1' };
      const fakeResult = { success: true };

      serviceMock.addQuestionToExam.resolves(fakeResult as any);

      await controller.addQuestionToExam(req as Request, res as Response);

      expect(serviceMock.addQuestionToExam.calledOnceWith('myschool', 'e1', 'q1')).to.be.true;
      expect(res.json?.calledWithMatch({ message: '✅ Question added to exam', data: fakeResult })).to.be.true;
    });
  });
});
