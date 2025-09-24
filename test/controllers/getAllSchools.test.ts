import { School } from '../../src/models/school.model';
import sinon from 'sinon';
import { expect } from 'chai';
import { Request, Response, NextFunction } from 'express';
import { SchoolController } from '../../src/controllers/school.controller';
import { SchoolService } from '../../src/services/school.service';

describe('Unit: getAllSchools Controller', () => {
  let consoleErrorStub: sinon.SinonStub;
  let schoolServiceMock: sinon.SinonStubbedInstance<SchoolService>;
  let controller: SchoolController;

  beforeEach(() => {
    // Stub console.error to suppress error logging during tests
    consoleErrorStub = sinon.stub(console, 'error');

    // Mock SchoolService
    schoolServiceMock = sinon.createStubInstance(SchoolService);
    controller = new SchoolController(schoolServiceMock as unknown as SchoolService);
  });

  afterEach(() => {
    consoleErrorStub.restore();
    sinon.restore();
  });

  it('should return 200 with list of all schools', async () => {
    const req: any = { query: {} };
    const res: any = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    const fakeSchools = [
      { name: 'School A', email: 'a@school.com' },
      { name: 'School B', email: 'b@school.com' },
    ];

    // Mock service
    schoolServiceMock.getAllSchools.resolves({
      schools: fakeSchools,
      total: 2,
      totalPages: 1,
    });

    await controller.getAll(req as Request, res as Response);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWithMatch({
      msg: 'Schools retrieved successfully',
      count: fakeSchools.length,
      schools: fakeSchools,
    })).to.be.true;
    expect(consoleErrorStub.notCalled).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    const req: any = { query: {} };
    const res: any = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    const error = new Error('DB error');
    schoolServiceMock.getAllSchools.rejects(error);

    await controller.getAll(req as Request, res as Response);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWith({ msg: 'Error fetching schools' })).to.be.true;
    expect(consoleErrorStub.calledWith('Error in getAll:', error)).to.be.true;
  });
});
