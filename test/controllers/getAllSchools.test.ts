import { School } from '../../src/models/school.model';
import sinon from 'sinon';
import { expect } from 'chai';
import mongoose from 'mongoose';
import { getAllSchools } from '../../src/controllers/school.controller';
import { Request, Response, NextFunction } from 'express';

describe('Unit: getAllSchools Controller', () => {
  let consoleErrorStub: sinon.SinonStub;

  beforeEach(() => {
    // Stub console.error to suppress error logging during tests
    consoleErrorStub = sinon.stub(console, 'error');
  });

  afterEach(() => {
    // Restore console.error and any other stubs
    consoleErrorStub.restore();
    sinon.restore();
  });

  it('should return 200 with list of all schools', async () => {
    const req: any = {};
    const res: any = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    const next: any = sinon.stub();

    const fakeSchools = [
      { name: 'School A', email: 'a@school.com' },
      { name: 'School B', email: 'b@school.com' },
    ];

    // Mock .find().select()
    const selectStub = sinon.stub().resolves(fakeSchools);
    const findStub = sinon.stub(School, 'find').returns({ select: selectStub } as any);

    await getAllSchools(req as Request, res as Response, next as NextFunction);

    // Assertions
    expect(findStub.calledOnce).to.be.true;
    expect(selectStub.calledWith('-password')).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({
      msg: 'All registered schools retrieved successfully',
      count: fakeSchools.length,
      schools: fakeSchools,
    })).to.be.true;
    expect(next.notCalled).to.be.true;
    expect(consoleErrorStub.notCalled).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    const req: any = {};
    const res: any = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    const next: any = sinon.stub();

    const error = new Error('DB error');
    const findStub = sinon.stub(School, 'find').throws(error);

    await getAllSchools(req as Request, res as Response, next as NextFunction);

    // Assertions
    expect(findStub.calledOnce).to.be.true;
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWith({ msg: 'Error fetching schools' })).to.be.true;
    expect(next.notCalled).to.be.true;
    expect(consoleErrorStub.calledWith('Error fetching schools:', error)).to.be.true;
  });
});