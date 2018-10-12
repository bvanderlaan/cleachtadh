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
      _id: 'myUserId',
      displayName: 'Bruce Banner',
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

describe('Integration :: User Route', () => {
  describe('Find', () => {
    before('clear users', () => User.deleteMany({}));

    describe('when no user\'s exist', () => {
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

    describe('when succeed to fetch user\'s', () => {
      let user1Id;
      let user2Id;

      before('populate database', () => {
        const user1 = new User();
        user1.displayName = 'Peter Parker';
        user1.local.email = 'peter.parker@testMail.com';
        user1.local.password = 'password';

        const user2 = new User();
        user2.displayName = 'Bruce Banner';
        user2.local.email = 'the.hulk@testMail.com';
        user2.local.password = 'password';

        return user1.save()
          .then(() => user2.save())
          .then(() => {
            user1Id = user1._id;
            user2Id = user2._id;
          });
      });
      after('Clean up database', () => (
        Promise.all([
          user1Id ? User.findByIdAndDelete(user1Id) : undefined,
          user2Id ? User.findByIdAndDelete(user2Id) : undefined,
        ])
      ));

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
                id: user1Id.toString(),
                displayName: 'Peter Parker',
                admin: false,
              }, {
                id: user2Id.toString(),
                displayName: 'Bruce Banner',
                admin: false,
              }],
            });
          });
      });
    });
  });

  describe('FindOne', () => {
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

    describe('when User was found', () => {
      let user1Id;

      before('populate database', () => {
        const user1 = new User();
        user1.displayName = 'Peter Parker';
        user1.local.email = 'peter.parker@testMail.com';
        user1.local.password = 'password';

        return user1.save()
          .then(() => {
            user1Id = user1._id;
          });
      });
      after('Clean up database', () => (
        user1Id ? User.findByIdAndDelete(user1Id) : undefined
      ));

      it('should set status to 200', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = user1Id;

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

        req.params.id = user1Id;

        return expect(userController.findOne(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              id: user1Id.toString(),
              displayName: 'Peter Parker',
              admin: false,
            });
          });
      });
    });
  });
});
