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
    query: {},
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
              total: undefined,
            });
          });
      });
    });

    describe('Pagination', () => {
      describe('when limit is set', () => {
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

          req.query.limit = 1;

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

          req.query.limit = 1;

          return expect(userController.find(req, res, next))
            .to.eventually.be.fulfilled
            .then(() => {
              expect(res.json, 'json').to.have.been.calledOnce;
              expect(res.json, 'json').to.have.been.calledWith({
                users: [{
                  id: user1Id.toString(),
                  displayName: 'Peter Parker',
                  admin: false,
                  state: User.States().PENDING,
                }],
                total: 2,
              });
            });
        });
      });

      describe('when page is set', () => {
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

          req.query.page = 2;
          req.query.limit = 1;

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

          req.query.page = 2;
          req.query.limit = 1;

          return expect(userController.find(req, res, next))
            .to.eventually.be.fulfilled
            .then(() => {
              expect(res.json, 'json').to.have.been.calledOnce;
              expect(res.json, 'json').to.have.been.calledWith({
                users: [{
                  id: user2Id.toString(),
                  displayName: 'Bruce Banner',
                  admin: false,
                  state: User.States().PENDING,
                }],
                total: 2,
              });
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
                state: User.States().PENDING,
              }, {
                id: user2Id.toString(),
                displayName: 'Bruce Banner',
                admin: false,
                state: User.States().PENDING,
              }],
              total: undefined,
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
              state: User.States().PENDING,
            });
          });
      });
    });
  });

  describe('Destroy', () => {
    let userId;

    before('populate database', () => {
      const user = new User();
      user.displayName = 'Bruce Banner';
      user.local.email = 'bruce.banner@testMail.com';
      user.local.password = 'password';

      return user.save()
        .then(() => {
          userId = user._id;
        });
    });
    after('Clean up database', () => (userId ? User.findByIdAndDelete(userId) : undefined));

    describe('when User was found', () => {
      it('should set status to 204', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = userId;

        return expect(userController.destroy(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(204);
          });
      });

      it('should have removed the entry from the database', () => (
        expect(User.findById(userId))
          .to.eventually.be.fulfilled
          .then((entry) => {
            expect(entry).to.be.null;
            userId = null;
          })
      ));
    });
  });

  describe('Update', () => {
    let userId;

    before('populate database', () => {
      const user = new User();
      user.displayName = 'David Banner';
      user.local.email = 'bruce.banner@testMail.com';
      user.local.password = 'password';

      return user.save()
        .then(() => {
          userId = user._id;
        });
    });
    after('Clean up database', () => (userId ? User.findByIdAndDelete(userId) : undefined));

    describe('when updating display name', () => {
      it('should set status to 200', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = userId;
        req.body.displayName = 'Bruce Banner';

        return expect(userController.update(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(200);
          });
      });

      it('should have updated the entry in the database', () => (
        expect(User.findById(userId))
          .to.eventually.be.fulfilled
          .then((entry) => {
            expect(entry).to.have.property('displayName', 'Bruce Banner');
          })
      ));
    });

    describe('when promoting to admin', () => {
      it('should set status to 200', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = userId;
        req.body.admin = true;

        return expect(userController.update(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(200);
          });
      });

      it('should have updated the entry in the database', () => (
        expect(User.findById(userId))
          .to.eventually.be.fulfilled
          .then((entry) => {
            expect(entry).to.have.property('admin', true);
          })
      ));
    });

    describe('when approving the user account', () => {
      it('should set status to 200', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = userId;
        req.body.state = User.States().ACTIVE;

        return expect(userController.update(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(200);
          });
      });

      it('should have updated the entry in the database', () => (
        expect(User.findById(userId))
          .to.eventually.be.fulfilled
          .then((entry) => {
            expect(entry).to.have.property('state', User.States().ACTIVE);
          })
      ));
    });
  });
});
