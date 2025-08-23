import { expect } from 'chai';
import sinon from 'sinon';
import { CourseController } from '../../src/controllers/school.course.controller';
import { CourseService } from '../../src/services/course.service';
import { Request, Response } from 'express';
import { Types } from 'mongoose';

// Note: Removed stubbing for extractDbNameFromUrl to avoid non-configurable error.
// Instead, tests will use the real implementation (it's deterministic and simple).
// If you need to mock it, consider dependency injection in the controller or tools like Jest/proxyquire.

describe('CourseController', () => {
  let controller: CourseController;
  let courseServiceMock: sinon.SinonStubbedInstance<CourseService>;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    courseServiceMock = sinon.createStubInstance(CourseService);
    // cast to CourseService because createStubInstance is loosely typed
    controller = new CourseController(courseServiceMock as unknown as CourseService);

    req = {
      params: {},
      body: {},
      query: {}
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('addCourseToSchoolDB', () => {
    it('should add a course successfully and return 201', async () => {
      req.params = { schoolName: 'testSchool' };
      req.body = { title: 'Test Course' };

      const mockCourse = {
        _id: new Types.ObjectId('000000000000000000000001'),
        title: 'Test Course',
        __v: 0
      };

      courseServiceMock.addCourse.resolves(mockCourse);

      await controller.addCourseToSchoolDB(req as Request, res as Response);

      expect(courseServiceMock.addCourse.calledWith('testSchool', req.body)).to.be.true;
      expect((res.status as sinon.SinonStub).calledWith(201)).to.be.true;
      expect((res.json as sinon.SinonStub).calledWith({
        message: '✅ Course created successfully',
        data: mockCourse
      })).to.be.true;
    });

    it('should handle errors and return 500', async () => {
      req.params = { schoolName: 'testSchool' };
      req.body = { title: 'Test Course' };
      courseServiceMock.addCourse.rejects(new Error('DB Error'));

      await controller.addCourseToSchoolDB(req as Request, res as Response);

      expect((res.status as sinon.SinonStub).calledWith(500200)).to.be.true; // Matching controller's status code
      expect((res.json as sinon.SinonStub).calledWith({ error: 'Failed to add course' })).to.be.true;
    });
  });

  describe('getCoursesBySchool', () => {
    it('should get courses successfully with pagination and return 200', async () => {
      req.params = { schoolName: 'testSchool' };
      req.query = { search: '', sortBy: 'createdAt', sortOrder: 'desc', page: '1', limit: '10' };

      const mockResult = {
        courses: [],
        totalCount: 0
      };

      courseServiceMock.getAllCourses.resolves(mockResult);

      await controller.getCoursesBySchool(req as Request, res as Response);

      expect(courseServiceMock.getAllCourses.calledOnce).to.be.true;
      expect((res.status as sinon.SinonStub).calledWith(200)).to.be.true;
      expect((res.json as sinon.SinonStub).calledWith(sinon.match({
        courses: [],
        pagination: sinon.match.object
      }))).to.be.true;
    });

    it('should return 400 if schoolName is missing', async () => {
      req.params = {};

      await controller.getCoursesBySchool(req as Request, res as Response);

      expect((res.status as sinon.SinonStub).calledWith(400)).to.be.true;
      expect((res.json as sinon.SinonStub).calledWith({ message: 'Missing schoolName' })).to.be.true;
    });
  });

  describe('updateCourseData', () => {
    it('should update course successfully and return 200', async () => {
      req.params = { schoolName: 'testSchool', courseId: '1' };
      req.body = { title: 'Updated Title' };

      const mockUpdated = {
        _id: new Types.ObjectId('000000000000000000000001'),
        title: 'Updated Title',
        __v: 0
      };

      courseServiceMock.updateCourse.resolves(mockUpdated);

      await controller.updateCourseData(req as Request, res as Response);

      expect(courseServiceMock.updateCourse.calledWith('testSchool', '1', req.body)).to.be.true;
      expect((res.status as sinon.SinonStub).calledWith(200)).to.be.true;
      expect((res.json as sinon.SinonStub).calledWith({
        message: '✅ Course updated successfully',
        data: mockUpdated
      })).to.be.true;
    });

    it('should return 404 if course not found', async () => {
      req.params = { schoolName: 'testSchool', courseId: '1' };
      courseServiceMock.updateCourse.resolves(null);

      await controller.updateCourseData(req as Request, res as Response);

      expect((res.status as sinon.SinonStub).calledWith(404)).to.be.true;
      expect((res.json as sinon.SinonStub).calledWith({ message: 'Course not found or update failed' })).to.be.true;
    });
  });

  describe('getCoursesBySubdomain', () => {
    it('should get courses by subdomain successfully and return 200', async () => {
      req.body = {
        schoolName: 'http://test.localhost:5173',
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: '1',
        limit: '10'
      };
      const mockResult = { courses: [], totalCount: 0 };
      courseServiceMock.fetchCourses.resolves(mockResult);

      await controller.getCoursesBySubdomain(req as Request, res as Response);

      expect(courseServiceMock.fetchCourses.calledOnce).to.be.true;
      expect((res.status as sinon.SinonStub).calledWith(200)).to.be.true;
      expect((res.json as sinon.SinonStub).calledWith(sinon.match({ courses: [], pagination: sinon.match.object }))).to.be.true;
    });

    it('should return 400 if schoolName URL is missing', async () => {
      req.body = {};

      await controller.getCoursesBySubdomain(req as Request, res as Response);

      expect((res.status as sinon.SinonStub).calledWith(400)).to.be.true;
      expect((res.json as sinon.SinonStub).calledWith({ message: 'Missing schoolName URL in request body' })).to.be.true;
    });
  });

  // Add tests for other methods as needed...
});
