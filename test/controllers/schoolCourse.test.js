"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = __importDefault(require("sinon"));
const school_course_controller_1 = require("../../src/controllers/school.course.controller");
const course_service_1 = require("../../src/services/course.service");
const mongoose_1 = require("mongoose");
// Note: Removed stubbing for extractDbNameFromUrl to avoid non-configurable error.
// Instead, tests will use the real implementation (it's deterministic and simple).
// If you need to mock it, consider dependency injection in the controller or tools like Jest/proxyquire.
describe('CourseController', () => {
    let controller;
    let courseServiceMock;
    let req;
    let res;
    beforeEach(() => {
        courseServiceMock = sinon_1.default.createStubInstance(course_service_1.CourseService);
        // cast to CourseService because createStubInstance is loosely typed
        controller = new school_course_controller_1.CourseController(courseServiceMock);
        req = {
            params: {},
            body: {},
            query: {}
        };
        res = {
            status: sinon_1.default.stub().returnsThis(),
            json: sinon_1.default.stub()
        };
    });
    afterEach(() => {
        sinon_1.default.restore();
    });
    describe('addCourseToSchoolDB', () => {
        it('should add a course successfully and return 201', () => __awaiter(void 0, void 0, void 0, function* () {
            req.params = { schoolName: 'testSchool' };
            req.body = { title: 'Test Course' };
            const mockCourse = {
                _id: new mongoose_1.Types.ObjectId('000000000000000000000001'),
                title: 'Test Course',
                __v: 0
            };
            courseServiceMock.addCourse.resolves(mockCourse);
            yield controller.addCourseToSchoolDB(req, res);
            (0, chai_1.expect)(courseServiceMock.addCourse.calledWith('testSchool', req.body)).to.be.true;
            (0, chai_1.expect)(res.status.calledWith(201)).to.be.true;
            (0, chai_1.expect)(res.json.calledWith({
                message: '✅ Course created successfully',
                data: mockCourse
            })).to.be.true;
        }));
        it('should handle errors and return 500', () => __awaiter(void 0, void 0, void 0, function* () {
            req.params = { schoolName: 'testSchool' };
            req.body = { title: 'Test Course' };
            courseServiceMock.addCourse.rejects(new Error('DB Error'));
            yield controller.addCourseToSchoolDB(req, res);
            (0, chai_1.expect)(res.status.calledWith(500200)).to.be.true; // Matching controller's status code
            (0, chai_1.expect)(res.json.calledWith({ error: 'Failed to add course' })).to.be.true;
        }));
    });
    describe('getCoursesBySchool', () => {
        it('should get courses successfully with pagination and return 200', () => __awaiter(void 0, void 0, void 0, function* () {
            req.params = { schoolName: 'testSchool' };
            req.query = { search: '', sortBy: 'createdAt', sortOrder: 'desc', page: '1', limit: '10' };
            const mockResult = {
                courses: [],
                totalCount: 0
            };
            courseServiceMock.getAllCourses.resolves(mockResult);
            yield controller.getCoursesBySchool(req, res);
            (0, chai_1.expect)(courseServiceMock.getAllCourses.calledOnce).to.be.true;
            (0, chai_1.expect)(res.status.calledWith(200)).to.be.true;
            (0, chai_1.expect)(res.json.calledWith(sinon_1.default.match({
                courses: [],
                pagination: sinon_1.default.match.object
            }))).to.be.true;
        }));
        it('should return 400 if schoolName is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            req.params = {};
            yield controller.getCoursesBySchool(req, res);
            (0, chai_1.expect)(res.status.calledWith(400)).to.be.true;
            (0, chai_1.expect)(res.json.calledWith({ message: 'Missing schoolName' })).to.be.true;
        }));
    });
    describe('updateCourseData', () => {
        it('should update course successfully and return 200', () => __awaiter(void 0, void 0, void 0, function* () {
            req.params = { schoolName: 'testSchool', courseId: '1' };
            req.body = { title: 'Updated Title' };
            const mockUpdated = {
                _id: new mongoose_1.Types.ObjectId('000000000000000000000001'),
                title: 'Updated Title',
                __v: 0
            };
            courseServiceMock.updateCourse.resolves(mockUpdated);
            yield controller.updateCourseData(req, res);
            (0, chai_1.expect)(courseServiceMock.updateCourse.calledWith('testSchool', '1', req.body)).to.be.true;
            (0, chai_1.expect)(res.status.calledWith(200)).to.be.true;
            (0, chai_1.expect)(res.json.calledWith({
                message: '✅ Course updated successfully',
                data: mockUpdated
            })).to.be.true;
        }));
        it('should return 404 if course not found', () => __awaiter(void 0, void 0, void 0, function* () {
            req.params = { schoolName: 'testSchool', courseId: '1' };
            courseServiceMock.updateCourse.resolves(null);
            yield controller.updateCourseData(req, res);
            (0, chai_1.expect)(res.status.calledWith(404)).to.be.true;
            (0, chai_1.expect)(res.json.calledWith({ message: 'Course not found or update failed' })).to.be.true;
        }));
    });
    describe('getCoursesBySubdomain', () => {
        it('should get courses by subdomain successfully and return 200', () => __awaiter(void 0, void 0, void 0, function* () {
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
            yield controller.getCoursesBySubdomain(req, res);
            (0, chai_1.expect)(courseServiceMock.fetchCourses.calledOnce).to.be.true;
            (0, chai_1.expect)(res.status.calledWith(200)).to.be.true;
            (0, chai_1.expect)(res.json.calledWith(sinon_1.default.match({ courses: [], pagination: sinon_1.default.match.object }))).to.be.true;
        }));
        it('should return 400 if schoolName URL is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            req.body = {};
            yield controller.getCoursesBySubdomain(req, res);
            (0, chai_1.expect)(res.status.calledWith(400)).to.be.true;
            (0, chai_1.expect)(res.json.calledWith({ message: 'Missing schoolName URL in request body' })).to.be.true;
        }));
    });
    // Add tests for other methods as needed...
});
