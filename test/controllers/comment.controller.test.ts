// test/controllers/comment.controller.test.ts
import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import { CommentController } from '../../src/controllers/comment.controller';
import { CommentService } from '../../src/services/comment.service';
import { School } from '../../src/models/school.model';

describe('Unit: CommentController', () => {
  let controller: CommentController;
  let commentServiceMock: sinon.SinonStubbedInstance<CommentService>;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    commentServiceMock = sinon.createStubInstance(CommentService);
    controller = new CommentController(commentServiceMock as unknown as CommentService);

    req = { body: {}, params: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('addComment', () => {
    it('should return 400 if required fields are missing', async () => {
      req.body = { userId: '1' }; // missing fields

      await controller.addComment(req as Request, res as Response);

      expect(res.status?.calledWith(400)).to.be.true;
      expect(res.json?.calledWithMatch({ message: 'Missing required fields' })).to.be.true;
    });

    it('should add comment successfully and return 201', async () => {
      req.body = {
        userId: '1',
        courseId: 'c1',
        schoolName: 'myschool',
        text: 'Nice!',
        parentId: null,
      };

      const fakeSchool = { _id: 's1' };
      const fakeComment = { id: 'comment1', text: 'Nice!' };

      const schoolStub = sinon.stub(School, 'findOne').resolves(fakeSchool as any);
      commentServiceMock.addComment.resolves(fakeComment as any);

      await controller.addComment(req as Request, res as Response);

      expect(schoolStub.calledOnceWith({ subDomain: 'https://myschool.eduvia.space' })).to.be.true;
      expect(commentServiceMock.addComment.calledOnceWith('1', 'c1', 's1', 'Nice!', null)).to.be.true;
      expect(res.status?.calledWith(201)).to.be.true;
      expect(res.json?.calledWith(fakeComment)).to.be.true;
    });

    it('should return 500 if service throws error', async () => {
      req.body = {
        userId: '1',
        courseId: 'c1',
        schoolName: 'myschool',
        text: 'Nice!',
      };
      sinon.stub(School, 'findOne').rejects(new Error('DB error'));

      await controller.addComment(req as Request, res as Response);

      expect(res.status?.calledWith(500)).to.be.true;
      expect(res.json?.calledWithMatch({ message: 'Failed to add comment' })).to.be.true;
    });
  });

  describe('getComments', () => {
    it('should fetch comments successfully', async () => {
      req.params = { courseId: 'c1' };
      const fakeComments = [{ id: '1', text: 'hi' }];

      commentServiceMock.getCourseCommentsWithReplies.resolves(fakeComments as any);

      await controller.getComments(req as Request, res as Response);

      expect(commentServiceMock.getCourseCommentsWithReplies.calledOnceWith('c1')).to.be.true;
      expect(res.json?.calledWith(fakeComments)).to.be.true;
    });

    it('should return 500 if service throws error', async () => {
      req.params = { courseId: 'c1' };
      commentServiceMock.getCourseCommentsWithReplies.rejects(new Error('DB error'));

      await controller.getComments(req as Request, res as Response);

      expect(res.status?.calledWith(500)).to.be.true;
      expect(res.json?.calledWithMatch({ message: 'Failed to fetch comments' })).to.be.true;
    });
  });

  describe('deleteComment', () => {
    it('should delete successfully', async () => {
      req.params = { commentId: 'c1' };
      req.body = { userId: '1' };

      commentServiceMock.deleteComment.resolves(true);

      await controller.deleteComment(req as Request, res as Response);

      expect(commentServiceMock.deleteComment.calledOnceWith('c1', '1')).to.be.true;
      expect(res.json?.calledWith({ message: 'Deleted successfully' })).to.be.true;
    });

    it('should return 404 if not deleted', async () => {
      req.params = { commentId: 'c1' };
      req.body = { userId: '1' };

      commentServiceMock.deleteComment.resolves(false);

      await controller.deleteComment(req as Request, res as Response);

      expect(res.status?.calledWith(404)).to.be.true;
      expect(res.json?.calledWith({ message: 'Comment not found or not owned' })).to.be.true;
    });

    it('should return 500 on error', async () => {
      req.params = { commentId: 'c1' };
      req.body = { userId: '1' };

      commentServiceMock.deleteComment.rejects(new Error('DB error'));

      await controller.deleteComment(req as Request, res as Response);

      expect(res.status?.calledWith(500)).to.be.true;
      expect(res.json?.calledWithMatch({ message: 'Failed to delete comment' })).to.be.true;
    });
  });

  describe('like', () => {
    it('should like successfully', async () => {
      req.params = { commentId: 'c1' };
      req.body = { userId: '1' };

      const updated = { id: 'c1', likes: ['1'] };
      commentServiceMock.likeComment.resolves(updated as any);

      await controller.like(req as Request, res as Response);

      expect(commentServiceMock.likeComment.calledOnceWith('c1', '1')).to.be.true;
      expect(res.json?.calledWith(updated)).to.be.true;
    });

    it('should return 500 on error', async () => {
      req.params = { commentId: 'c1' };
      req.body = { userId: '1' };

      commentServiceMock.likeComment.rejects(new Error('DB error'));

      await controller.like(req as Request, res as Response);

      expect(res.status?.calledWith(500)).to.be.true;
      expect(res.json?.calledWithMatch({ message: 'Failed to like comment' })).to.be.true;
    });
  });

  describe('unlike', () => {
    it('should unlike successfully', async () => {
      req.params = { commentId: 'c1' };
      req.body = { userId: '1' };

      const updated = { id: 'c1', likes: [] };
      commentServiceMock.unlikeComment.resolves(updated as any);

      await controller.unlike(req as Request, res as Response);

      expect(commentServiceMock.unlikeComment.calledOnceWith('c1', '1')).to.be.true;
      expect(res.json?.calledWith(updated)).to.be.true;
    });

    it('should return 500 on error', async () => {
      req.params = { commentId: 'c1' };
      req.body = { userId: '1' };

      commentServiceMock.unlikeComment.rejects(new Error('DB error'));

      await controller.unlike(req as Request, res as Response);

      expect(res.status?.calledWith(500)).to.be.true;
      expect(res.json?.calledWithMatch({ message: 'Failed to unlike comment' })).to.be.true;
    });
  });

  describe('testApi', () => {
    it('should return 200 with success message', async () => {
      await controller.testApi(req as Request, res as Response);

      expect(res.status?.calledWith(200)).to.be.true;
      expect(res.json?.calledWith({ message: '✅ Test API is working fine!' })).to.be.true;
    });
  });
});
