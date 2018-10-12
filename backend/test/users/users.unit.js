'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');

const { User, controller: userController } = require('../../src/users')();

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

describe('Unit :: Users Route', () => {
  describe('Find', () => {
    describe('when no user\'s exist', () => {
      before(() => sinon.stub(User, 'find').resolves([]));
      after(() => User.find.restore());

      it('should set status to 200', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        return expect(userController.find(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(200);
          });
      });

      it('should set body to json', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        return expect(userController.find(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              users: [],
            });
          });
      });
    });

    describe('when failed to fetch user\'s', () => {
      before(() => sinon.stub(User, 'find').rejects(new Error('boom')));
      after(() => User.find.restore());

      it('should set status to 500', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        return expect(userController.find(req, res, next))
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

        return expect(userController.find(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Failed to retrieve users',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/users\/get_api_v1_users/),
            });
          });
      });
    });

    describe('when succeed to fetch user\'s', () => {
      before(() => sinon.stub(User, 'find').resolves([{
        _id: '1',
        displayName: 'Peter Parker',
        admin: false,
        created_at: 'today',
        updated_at: 'tomorrow',
      }, {
        _id: '2',
        displayName: 'Spider-man',
        admin: true,
        created_at: 'next thursday',
        updated_at: 'a week today',
      }]));
      after(() => User.find.restore());

      it('should set status to 200', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        return expect(userController.find(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(200);
          });
      });

      it('should return users in json body', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        return expect(userController.find(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              users: [{
                id: '1',
                displayName: 'Peter Parker',
                admin: false,
              }, {
                id: '2',
                displayName: 'Spider-man',
                admin: true,
              }],
            });
          });
      });
    });
  });

  describe('FindOne', () => {
    describe('when User ID is missing (some how)', () => {
      it('should set status to 400', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        return expect(userController.findOne(req, res, next))
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

        return expect(userController.findOne(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Missing the User ID',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/users\/get_api_v1_users__id_/),
            });
          });
      });
    });

    describe('when User ID is invalid', () => {
      it('should set status to 404', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = 'invalidID';

        return expect(userController.findOne(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(404);
          });
      });

      it('should set body to json', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = 'invalidId';

        return expect(userController.findOne(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: The User was not found',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/users\/get_api_v1_users__id_/),
            });
          });
      });
    });

    describe('when the user does not exist', () => {
      it('should set status to 404', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';

        return expect(userController.findOne(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(404);
          });
      });

      it('should set body to json', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';

        return expect(userController.findOne(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: The User was not found',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/users\/get_api_v1_users__id_/),
            });
          });
      });
    });

    describe('when failed to fetch the user', () => {
      before(() => sinon.stub(User, 'findById').rejects(new Error('boom')));
      after(() => User.findById.restore());

      it('should set status to 500', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';

        return expect(userController.findOne(req, res, next))
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

        req.params.id = '5b875a9797585d0029cb886d';

        return expect(userController.findOne(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Failed to retrieve the user',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/users\/get_api_v1_users__id_/),
            });
          });
      });
    });

    describe('when User was found', () => {
      before(() => sinon.stub(User, 'findById').resolves({
        _id: '5b875a9797585d0029cb886d',
        displayName: 'Peter Parker',
        admin: false,
      }));
      after(() => User.findById.restore());

      it('should set status to 200', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';

        return expect(userController.findOne(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(200);
          });
      });

      it('should return user in json body', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';

        return expect(userController.findOne(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              id: '5b875a9797585d0029cb886d',
              displayName: 'Peter Parker',
              admin: false,
            });
          });
      });
    });
  });
});
