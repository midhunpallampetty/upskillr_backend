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
const school_model_1 = require("../../src/models/school.model");
const sinon_1 = __importDefault(require("sinon"));
const chai_1 = require("chai");
const school_controller_1 = require("../../src/controllers/school.controller");
describe('Unit: getAllSchools Controller', () => {
    let consoleErrorStub;
    beforeEach(() => {
        // Stub console.error to suppress error logging during tests
        consoleErrorStub = sinon_1.default.stub(console, 'error');
    });
    afterEach(() => {
        // Restore console.error and any other stubs
        consoleErrorStub.restore();
        sinon_1.default.restore();
    });
    it('should return 200 with list of all schools', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = {};
        const res = {
            status: sinon_1.default.stub().returnsThis(),
            json: sinon_1.default.stub(),
        };
        const next = sinon_1.default.stub();
        const fakeSchools = [
            { name: 'School A', email: 'a@school.com' },
            { name: 'School B', email: 'b@school.com' },
        ];
        // Mock .find().select()
        const selectStub = sinon_1.default.stub().resolves(fakeSchools);
        const findStub = sinon_1.default.stub(school_model_1.School, 'find').returns({ select: selectStub });
        yield (0, school_controller_1.getAllSchools)(req, res, next);
        // Assertions
        (0, chai_1.expect)(findStub.calledOnce).to.be.true;
        (0, chai_1.expect)(selectStub.calledWith('-password')).to.be.true;
        (0, chai_1.expect)(res.status.calledWith(200)).to.be.true;
        (0, chai_1.expect)(res.json.calledWith({
            msg: 'All registered schools retrieved successfully',
            count: fakeSchools.length,
            schools: fakeSchools,
        })).to.be.true;
        (0, chai_1.expect)(next.notCalled).to.be.true;
        (0, chai_1.expect)(consoleErrorStub.notCalled).to.be.true;
    }));
    it('should return 500 if an error occurs', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = {};
        const res = {
            status: sinon_1.default.stub().returnsThis(),
            json: sinon_1.default.stub(),
        };
        const next = sinon_1.default.stub();
        const error = new Error('DB error');
        const findStub = sinon_1.default.stub(school_model_1.School, 'find').throws(error);
        yield (0, school_controller_1.getAllSchools)(req, res, next);
        // Assertions
        (0, chai_1.expect)(findStub.calledOnce).to.be.true;
        (0, chai_1.expect)(res.status.calledWith(500)).to.be.true;
        (0, chai_1.expect)(res.json.calledWith({ msg: 'Error fetching schools' })).to.be.true;
        (0, chai_1.expect)(next.notCalled).to.be.true;
        (0, chai_1.expect)(consoleErrorStub.calledWith('Error fetching schools:', error)).to.be.true;
    }));
});
