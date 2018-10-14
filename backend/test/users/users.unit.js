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

describe('Unit :: Users Model', () => {
  describe('Present', () => {
    it('should change _id to id', () => {
      const user = new User();
      expect(user).to.have.property('_id');

      const payload = user.present();
      expect(payload).to.have.property('id')
        .which.is.a('string')
        .and.equals(user._id.toString());
      expect(payload).to.not.have.property('_id');
    });

    it('should not include email nor password', () => {
      const user = new User();
      user.local.email = 'my@email.com';
      user.local.password = 'password';

      const payload = user.present();
      expect(payload).to.not.have.property('local');
    });

    it('should include all other properties', () => {
      const user = new User();
      user.displayName = 'Hank Pym';
      user.state = 0;
      user.admin = true;

      const payload = user.present();
      expect(payload).to.have.property('displayName', 'Hank Pym');
      expect(payload).to.have.property('state', 0);
      expect(payload).to.have.property('admin', true);
    });
  });
});

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
      before(() => sinon.stub(User, 'find').resolves([
        new UserMock({
          id: '1',
          displayName: 'Peter Parker',
          admin: false,
          state: 0,
        }),
        new UserMock({
          id: '2',
          displayName: 'Spider-man',
          admin: true,
          state: 0,
        }),
      ]));
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
                state: 0,
              }, {
                id: '2',
                displayName: 'Spider-man',
                admin: true,
                state: 0,
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
      before(() => (
        sinon.stub(User, 'findById')
          .resolves(new UserMock({
            id: '5b875a9797585d0029cb886d',
            displayName: 'Peter Parker',
            admin: false,
            state: 0,
          }))
      ));
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
              state: 0,
            });
          });
      });
    });
  });

  describe('Destroy', () => {
    describe('when User ID is missing (some how)', () => {
      it('should set status to 400', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        return expect(userController.destroy(req, res, next))
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

        return expect(userController.destroy(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Missing the User ID',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/users\/delete_api_v1_users__id_/),
            });
          });
      });
    });

    describe('when User ID is invalid', () => {
      it('should set status to 204', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = 'invalidID';

        return expect(userController.destroy(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(204);
          });
      });
    });

    describe('when the user does not exist', () => {
      it('should set status to 204', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';

        return expect(userController.destroy(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(204);
          });
      });
    });

    describe('when failed to delete the user', () => {
      before(() => sinon.stub(User, 'findByIdAndDelete').rejects(new Error('boom')));
      after(() => User.findByIdAndDelete.restore());

      it('should set status to 500', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';

        return expect(userController.destroy(req, res, next))
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

        return expect(userController.destroy(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Failed to delete the user',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/users\/delete_api_v1_users__id_/),
            });
          });
      });
    });

    describe('when User was found', () => {
      before(() => sinon.stub(User, 'findByIdAndDelete').resolves());
      after(() => User.findByIdAndDelete.restore());

      it('should set status to 204', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';

        return expect(userController.destroy(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(204);
          });
      });
    });

    describe('when User to delete is self', () => {
      before(() => sinon.stub(User, 'findByIdAndDelete').resolves());
      after(() => User.findByIdAndDelete.restore());

      it('should set status to 400', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';
        req.user.id = '5b875a9797585d0029cb886d';

        return expect(userController.destroy(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(400);
          });
      });

      it('should return error message in json body', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';
        req.user.id = '5b875a9797585d0029cb886d';

        return expect(userController.destroy(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Can not delete your self',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/users\/delete_api_v1_users__id_/),
            });
          });
      });
    });
  });

  describe('Update', () => {
    describe('when User ID is missing (some how)', () => {
      it('should set status to 400', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        return expect(userController.update(req, res, next))
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

        return expect(userController.update(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Missing the User ID',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/users\/patch_api_v1_users__id_/),
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

        return expect(userController.update(req, res, next))
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

        req.params.id = 'invalidID';

        return expect(userController.update(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: User invalidID was not found',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/users\/patch_api_v1_users__id_/),
            });
          });
      });
    });

    describe('when no values to update are passed in', () => {
      it('should set status to 400', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';
        req.body = {};

        return expect(userController.update(req, res, next))
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

        req.params.id = '5b875a9797585d0029cb886d';
        req.body = {};

        return expect(userController.update(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: No values provided, nothing to update',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/users\/patch_api_v1_users__id_/),
            });
          });
      });
    });

    describe('when the user does not exist', () => {
      before(() => sinon.stub(User, 'findByIdAndUpdate').resolves(null));
      after(() => User.findByIdAndUpdate.restore());

      it('should set status to 404', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';
        req.body.displayName = 'David Banner';

        return expect(userController.update(req, res, next))
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
        req.body.displayName = 'David Banner';

        return expect(userController.update(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: User 5b875a9797585d0029cb886d was not found',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/users\/patch_api_v1_users__id_/),
            });
          });
      });
    });

    describe('when failed to update the user', () => {
      before(() => sinon.stub(User, 'findByIdAndUpdate').rejects(new Error('boom')));
      after(() => User.findByIdAndUpdate.restore());

      it('should set status to 500', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';
        req.body.displayName = 'David Banner';

        return expect(userController.update(req, res, next))
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
        req.body.displayName = 'David Banner';

        return expect(userController.update(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Failed to update the user',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/users\/patch_api_v1_users__id_/),
            });
          });
      });
    });

    describe('when succeed to update the user', () => {
      before(() => (
        sinon.stub(User, 'findByIdAndUpdate')
          .resolves(new UserMock({
            id: '5b875a9797585d0029cb886d',
            displayName: 'Peter Parker',
            admin: false,
            state: User.States().PENDING,
          }))
      ));
      after(() => User.findByIdAndUpdate.restore());

      it('should set status to 200', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';
        req.body.displayName = 'Peter Parker';

        return expect(userController.update(req, res, next))
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
        req.body.displayName = 'Peter Parker';

        return expect(userController.update(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              id: '5b875a9797585d0029cb886d',
              displayName: 'Peter Parker',
              admin: false,
              state: User.States().PENDING,
            });
          });
      });
    });

    describe('when invalid user state provided', () => {
      before(() => sinon.stub(User, 'findByIdAndUpdate').resolves(null));
      after(() => User.findByIdAndUpdate.restore());

      it('should set status to 400', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';
        req.body.state = 9990999;

        return expect(userController.update(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(400);
          });
      });

      it('should return error message in json body', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';
        req.body.state = 9990999;

        return expect(userController.update(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Invalid User state provided: 9990999',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/users\/patch_api_v1_users__id_/),
            });
          });
      });
    });

    describe('when succeed to activate user', () => {
      before(() => (
        sinon.stub(User, 'findByIdAndUpdate')
          .resolves(new UserMock({
            id: '5b875a9797585d0029cb886d',
            displayName: 'Peter Parker',
            admin: false,
            state: User.States().ACTIVE,
          }))
      ));
      after(() => User.findByIdAndUpdate.restore());

      it('should set status to 200', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';
        req.body.state = User.States().ACTIVE;

        return expect(userController.update(req, res, next))
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
        req.body.state = User.States().ACTIVE;

        return expect(userController.update(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              id: '5b875a9797585d0029cb886d',
              displayName: 'Peter Parker',
              admin: false,
              state: User.States().ACTIVE,
            });
          });
      });
    });

    describe('when succeed to de-activate user', () => {
      before(() => (
        sinon.stub(User, 'findByIdAndUpdate')
          .resolves(new UserMock({
            id: '5b875a9797585d0029cb886d',
            displayName: 'Peter Parker',
            admin: false,
            state: User.States().PENDING,
          }))
      ));
      after(() => User.findByIdAndUpdate.restore());

      it('should set status to 200', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';
        req.body.state = User.States().PENDING;

        return expect(userController.update(req, res, next))
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
        req.body.state = User.States().PENDING;

        return expect(userController.update(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              id: '5b875a9797585d0029cb886d',
              displayName: 'Peter Parker',
              admin: false,
              state: User.States().PENDING,
            });
          });
      });
    });

    describe('when trying to de-activate self', () => {
      before(() => (
        sinon.stub(User, 'findByIdAndUpdate')
          .resolves(new UserMock({
            id: '5b875a9797585d0029cb886d',
            displayName: 'Peter Parker',
            admin: false,
            state: User.States().ACTIVE,
          }))
      ));
      after(() => User.findByIdAndUpdate.restore());

      it('should set status to 400', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.user.id = '5b875a9797585d0029cb886d';
        req.params.id = '5b875a9797585d0029cb886d';
        req.body.state = User.States().PENDING;

        return expect(userController.update(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(400);
          });
      });

      it('should return error message in json body', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.user.id = '5b875a9797585d0029cb886d';
        req.params.id = '5b875a9797585d0029cb886d';
        req.body.state = User.States().PENDING;

        return expect(userController.update(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Can not deactivate ones self',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/users\/patch_api_v1_users__id_/),
            });
          });
      });
    });

    describe('when invalid admin value provided', () => {
      before(() => sinon.stub(User, 'findByIdAndUpdate').resolves(null));
      after(() => User.findByIdAndUpdate.restore());

      it('should set status to 400', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';
        req.body.admin = 'yup';

        return expect(userController.update(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(400);
          });
      });

      it('should return error message in json body', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';
        req.body.admin = 'yup';

        return expect(userController.update(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Invalid Admin Flag provided: yup',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/users\/patch_api_v1_users__id_/),
            });
          });
      });
    });

    describe('when succeed to promote user', () => {
      before(() => (
        sinon.stub(User, 'findByIdAndUpdate')
          .resolves(new UserMock({
            id: '5b875a9797585d0029cb886d',
            displayName: 'Peter Parker',
            admin: true,
            state: User.States().ACTIVE,
          }))
      ));
      after(() => User.findByIdAndUpdate.restore());

      it('should set status to 200', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';
        req.body.admin = true;

        return expect(userController.update(req, res, next))
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
        req.body.admin = true;

        return expect(userController.update(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              id: '5b875a9797585d0029cb886d',
              displayName: 'Peter Parker',
              admin: true,
              state: User.States().ACTIVE,
            });
          });
      });
    });

    describe('when succeed to de-promote user', () => {
      before(() => (
        sinon.stub(User, 'findByIdAndUpdate')
          .resolves(new UserMock({
            id: '5b875a9797585d0029cb886d',
            displayName: 'Peter Parker',
            admin: false,
            state: User.States().ACTIVE,
          }))
      ));
      after(() => User.findByIdAndUpdate.restore());

      it('should set status to 200', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';
        req.body.admin = false;

        return expect(userController.update(req, res, next))
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
        req.body.admin = false;

        return expect(userController.update(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              id: '5b875a9797585d0029cb886d',
              displayName: 'Peter Parker',
              admin: false,
              state: User.States().ACTIVE,
            });
          });
      });
    });
  });
});
