// test/controllers/admin.controller.test.ts
import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response, NextFunction } from 'express';
import { AdminController } from '../../src/controllers/admin.controller';
import { AdminService } from '../../src/services/admin.service';

describe('Unit: AdminController', () => {
  let controller: AdminController;
  let adminServiceMock: sinon.SinonStubbedInstance<AdminService>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;

  beforeEach(() => {
    // mock AdminService
    adminServiceMock = sinon.createStubInstance(AdminService);
    controller = new AdminController(adminServiceMock as unknown as AdminService);

    req = { body: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('registerAdmin', () => {
    it('should register an admin and return 201', async () => {
      const fakeAdmin = { id: '1', email: 'admin@test.com' };
      req.body = { email: 'admin@test.com', password: 'password' };

      adminServiceMock.registerAdmin.resolves(fakeAdmin);

      await controller.registerAdmin(req as Request, res as Response, next as NextFunction);

      expect(adminServiceMock.registerAdmin.calledOnceWith('admin@test.com', 'password')).to.be.true;
      expect(res.status?.calledWith(201)).to.be.true;
      expect(res.json?.calledWith({ msg: 'Admin registered', admin: fakeAdmin })).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should call next with error if registration fails', async () => {
      const error = new Error('Registration failed');
      req.body = { email: 'admin@test.com', password: 'password' };
      adminServiceMock.registerAdmin.rejects(error);

      await controller.registerAdmin(req as Request, res as Response, next as NextFunction);

      expect(next.calledOnceWith(error)).to.be.true;
      expect(res.status?.called).to.be.false;
    });
  });

  describe('loginAdmin', () => {
    it('should login an admin and return 200 with tokens', async () => {
      const fakeAdmin = { id: '1', email: 'admin@test.com' };
      req.body = { email: 'admin@test.com', password: 'password' };

      adminServiceMock.loginAdmin.resolves({
        admin: fakeAdmin,
        accessToken: 'access123',
        refreshToken: 'refresh123',
      });

      await controller.loginAdmin(req as Request, res as Response, next as NextFunction);

      expect(adminServiceMock.loginAdmin.calledOnceWith('admin@test.com', 'password')).to.be.true;
      expect(res.status?.calledWith(200)).to.be.true;
      expect(res.json?.calledWithMatch({
        msg: '✅ Admin logged in',
        admin: fakeAdmin,
        accessToken: 'access123',
        refreshToken: 'refresh123',
      })).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should call next with error if login fails', async () => {
      const error = new Error('Login failed');
      req.body = { email: 'admin@test.com', password: 'wrong' };
      adminServiceMock.loginAdmin.rejects(error);

      await controller.loginAdmin(req as Request, res as Response, next as NextFunction);

      expect(next.calledOnceWith(error)).to.be.true;
      expect(res.status?.called).to.be.false;
    });
  });
});
