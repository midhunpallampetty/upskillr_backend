import { getCoursesBySchool } from '../../src/controllers/school.course.controller';
import sinon from 'sinon';
import { expect } from 'chai';
import mongoose from 'mongoose';

describe('Unit: getCoursesBySchool Controller', () => {
  it('should return 200 with course data if schoolName is valid', async () => {
    const req: any = {
      params: { schoolName: 'savaipublicschool' },
    };

    const res: any = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    const fakeCourses = [
      { name: 'React Basics' },
      { name: 'Node.js Bootcamp' },
    ];

    // 🧪 Properly mock chained .find().sort().exec()
    const sortStub = sinon.stub().resolves(fakeCourses); // resolves courses
    const findStub = sinon.stub().returns({ sort: sortStub }); // returns an object with .sort()

    const courseModelStub = { find: findStub };
    const fakeDb = {
      model: sinon.stub().returns(courseModelStub),
    };

    const useDbStub = sinon.stub(mongoose.connection, 'useDb').returns(fakeDb as any);

    await getCoursesBySchool(req, res);

    // ✅ Assertions
    expect(useDbStub.calledWith('savaipublicschool')).to.be.true;
    expect(fakeDb.model.calledWith('Course')).to.be.true;
    expect(findStub.calledOnce).to.be.true;
    expect(sortStub.calledWith({ createdAt: -1 })).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ courses: fakeCourses })).to.be.true;

    // 🧹 Cleanup
    useDbStub.restore();
  });
});
describe('Unit: getCoursesBySchool Controller', () => {
  it('should return 200 with course data if schoolName is valid', async () => {
    const req: any = {
      params: { schoolName: 'gamersclub' },
    };

    const res: any = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    const fakeCourses = [
      { name: 'React Basics' },
      { name: 'Node.js Bootcamp' },
    ];

    // 🧪 Properly mock chained .find().sort().exec()
    const sortStub = sinon.stub().resolves(fakeCourses); // resolves courses
    const findStub = sinon.stub().returns({ sort: sortStub }); // returns an object with .sort()

    const courseModelStub = { find: findStub };
    const fakeDb = {
      model: sinon.stub().returns(courseModelStub),
    };

    const useDbStub = sinon.stub(mongoose.connection, 'useDb').returns(fakeDb as any);

    await getCoursesBySchool(req, res);

    // ✅ Assertions
    expect(useDbStub.calledWith('gamersclub')).to.be.true;
    expect(fakeDb.model.calledWith('Course')).to.be.true;
    expect(findStub.calledOnce).to.be.true;
    expect(sortStub.calledWith({ createdAt: -1 })).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ courses: fakeCourses })).to.be.true;

    // 🧹 Cleanup
    useDbStub.restore();
  });
});
