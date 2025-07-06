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
const school_course_controller_1 = require("../../src/controllers/school.course.controller");
const sinon_1 = __importDefault(require("sinon"));
const chai_1 = require("chai");
const mongoose_1 = __importDefault(require("mongoose"));
describe('Unit: getCoursesBySchool Controller', () => {
    it('should return 200 with course data if schoolName is valid', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = {
            params: { schoolName: 'savaipublicschool' },
        };
        const res = {
            status: sinon_1.default.stub().returnsThis(),
            json: sinon_1.default.stub(),
        };
        const fakeCourses = [
            { name: 'React Basics' },
            { name: 'Node.js Bootcamp' },
        ];
        // 🧪 Properly mock chained .find().sort().exec()
        const sortStub = sinon_1.default.stub().resolves(fakeCourses); // resolves courses
        const findStub = sinon_1.default.stub().returns({ sort: sortStub }); // returns an object with .sort()
        const courseModelStub = { find: findStub };
        const fakeDb = {
            model: sinon_1.default.stub().returns(courseModelStub),
        };
        const useDbStub = sinon_1.default.stub(mongoose_1.default.connection, 'useDb').returns(fakeDb);
        yield (0, school_course_controller_1.getCoursesBySchool)(req, res);
        // ✅ Assertions
        (0, chai_1.expect)(useDbStub.calledWith('savaipublicschool')).to.be.true;
        (0, chai_1.expect)(fakeDb.model.calledWith('Course')).to.be.true;
        (0, chai_1.expect)(findStub.calledOnce).to.be.true;
        (0, chai_1.expect)(sortStub.calledWith({ createdAt: -1 })).to.be.true;
        (0, chai_1.expect)(res.status.calledWith(200)).to.be.true;
        (0, chai_1.expect)(res.json.calledWith({ courses: fakeCourses })).to.be.true;
        // 🧹 Cleanup
        useDbStub.restore();
    }));
});
describe('Unit: getCoursesBySchool Controller', () => {
    it('should return 200 with course data if schoolName is valid', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = {
            params: { schoolName: 'gamersclub' },
        };
        const res = {
            status: sinon_1.default.stub().returnsThis(),
            json: sinon_1.default.stub(),
        };
        const fakeCourses = [
            { name: 'React Basics' },
            { name: 'Node.js Bootcamp' },
        ];
        // 🧪 Properly mock chained .find().sort().exec()
        const sortStub = sinon_1.default.stub().resolves(fakeCourses); // resolves courses
        const findStub = sinon_1.default.stub().returns({ sort: sortStub }); // returns an object with .sort()
        const courseModelStub = { find: findStub };
        const fakeDb = {
            model: sinon_1.default.stub().returns(courseModelStub),
        };
        const useDbStub = sinon_1.default.stub(mongoose_1.default.connection, 'useDb').returns(fakeDb);
        yield (0, school_course_controller_1.getCoursesBySchool)(req, res);
        // ✅ Assertions
        (0, chai_1.expect)(useDbStub.calledWith('gamersclub')).to.be.true;
        (0, chai_1.expect)(fakeDb.model.calledWith('Course')).to.be.true;
        (0, chai_1.expect)(findStub.calledOnce).to.be.true;
        (0, chai_1.expect)(sortStub.calledWith({ createdAt: -1 })).to.be.true;
        (0, chai_1.expect)(res.status.calledWith(200)).to.be.true;
        (0, chai_1.expect)(res.json.calledWith({ courses: fakeCourses })).to.be.true;
        // 🧹 Cleanup
        useDbStub.restore();
    }));
});
