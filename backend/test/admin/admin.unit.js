'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');

const { User } = require('../../src/users')();
const { controller: adminController } = require('../../src/admin');

const { expect } = chai;
chai.use(sinonChai);
chai.use(chaiAsPromised);

const createRequest = () => {
  const req = {
    body: {},
    params: {},
    user: {
      _id: '1234',
      displayName: 'Peter Parker',
    },
    log: {
      info() {},
      warn() {},
      error() {},
    },
  };

  return req;
};

const createResponse = () => {
  const res = {
    end: sinon.stub(),
    json: sinon.stub(),
    status: sinon.stub(),
  };
  res.status.returns(res);

  return res;
};

class UserMock {
  constructor({ id, displayName, admin, state }) {
    this.id = id;
    this.displayName = displayName;
    this.admin = admin;
    this.state = state;
  }

  present() {
    return this;
  }
}

describe('Unit :: Admin Route', () => {
  describe('Create', () => {
    describe('when missing the display name parameter', () => {
      it('should set status to 400', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.body.email = 'i.am.groot@emai.com';
        req.body.password = 'iamgroot';

        return expect(adminController.create(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(400);
          });
      });

      it('should set body to json', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.body.email = 'i.am.groot@emai.com';
        req.body.password = 'iamgroot';

        return expect(adminController.create(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Missing admin display name',
            });
          });
      });
    });

    describe('when missing the email parameter', () => {
      it('should set status to 400', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.body.displayName = 'Groot';
        req.body.password = 'iamgroot';

        return expect(adminController.create(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(400);
          });
      });

      it('should set body to json', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.body.displayName = 'Groot';
        req.body.password = 'iamgroot';

        return expect(adminController.create(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Missing admin email address',
            });
          });
      });
    });

    describe('when missing the email parameter', () => {
      it('should set status to 400', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.body.displayName = 'Groot';
        req.body.email = 'i.am.groot@emai.com';

        return expect(adminController.create(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(400);
          });
      });

      it('should set body to json', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.body.displayName = 'Groot';
        req.body.email = 'i.am.groot@emai.com';

        return expect(adminController.create(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Missing admin password',
            });
          });
      });
    });

    describe('when failed to save the admin user', () => {
      before(() => sinon.stub(User.prototype, 'save').rejects(new Error('boom')));
      after(() => User.prototype.save.restore());

      it('should set status to 500', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.body.displayName = 'Groot';
        req.body.email = 'i.am.groot@emai.com';
        req.body.password = 'iamgroot';

        return expect(adminController.create(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(500);
          });
      });

      it('should return error message in json body', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.body.displayName = 'Groot';
        req.body.email = 'i.am.groot@emai.com';
        req.body.password = 'iamgroot';

        return expect(adminController.create(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Failed to create Admin',
            });
          });
      });
    });
  });
});
