'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');

const { Kata, controller: kataController } = require('../../src/katas')();

const { expect } = chai;
chai.use(sinonChai);
chai.use(chaiAsPromised);

const createRequest = () => {
  const req = {
    body: {},
    params: {},
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

describe('Unit :: Katas Route', () => {
  describe('Find', () => {
    describe('when no kata\'s exist', () => {
      it('should set status to 200', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        return expect(kataController.find(req, res, next))
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

        return expect(kataController.find(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              katas: [],
            });
          });
      });
    });

    describe('when failed to fetch kata\'s', () => {
      before(() => sinon.stub(Kata, 'find').rejects(new Error('boom')));
      after(() => Kata.find.restore());

      it('should set status to 500', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        return expect(kataController.find(req, res, next))
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

        return expect(kataController.find(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Failed to retrieve katas',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/katas\/get_api_v1_katas/),
            });
          });
      });
    });

    describe('when succeed to fetch kata\'s', () => {
      before(() => sinon.stub(Kata, 'find').resolves([{
        _id: '1',
        name: 'first kata',
        description: 'this is how we do it',
        created_at: 'today',
        updated_at: 'tomorrow',
      }, {
        _id: '2',
        name: 'second kata',
        description: 'or you can do it that way I guess',
        created_at: 'next thursday',
        updated_at: 'a week today',
      }]));
      after(() => Kata.find.restore());

      it('should set status to 200', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        return expect(kataController.find(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(200);
          });
      });

      it('should return katas in json body', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        return expect(kataController.find(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              katas: [{
                id: '1',
                name: 'first kata',
                description: 'this is how we do it',
                created_at: 'today',
              }, {
                id: '2',
                name: 'second kata',
                description: 'or you can do it that way I guess',
                created_at: 'next thursday',
              }],
            });
          });
      });
    });
  });

  describe('FindOne', () => {
    describe('when Kata ID is missing (some how)', () => {
      it('should set status to 400', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        return expect(kataController.findOne(req, res, next))
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

        return expect(kataController.findOne(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Missing the Kata ID',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/katas\/get_api_v1_katas__id_/),
            });
          });
      });
    });

    describe('when Kata ID is invalid', () => {
      it('should set status to 404', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = 'invalidID';

        return expect(kataController.findOne(req, res, next))
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

        return expect(kataController.findOne(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: The Kata was not found',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/katas\/get_api_v1_katas__id_/),
            });
          });
      });
    });

    describe('when the kata does not exist', () => {
      it('should set status to 404', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';

        return expect(kataController.findOne(req, res, next))
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

        return expect(kataController.findOne(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: The Kata was not found',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/katas\/get_api_v1_katas__id_/),
            });
          });
      });
    });

    describe('when failed to fetch the kata', () => {
      before(() => sinon.stub(Kata, 'findById').rejects(new Error('boom')));
      after(() => Kata.findById.restore());

      it('should set status to 500', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';

        return expect(kataController.findOne(req, res, next))
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

        return expect(kataController.findOne(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Failed to retrieve the kata',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/katas\/get_api_v1_katas__id_/),
            });
          });
      });
    });

    describe('when Kata was found', () => {
      before(() => sinon.stub(Kata, 'findById').resolves({
        _id: '5b875a9797585d0029cb886d',
        name: 'my cool kata',
        description: 'this is how we do it',
        created_at: 'today',
        updated_at: 'tomorrow',
      }));
      after(() => Kata.findById.restore());

      it('should set status to 200', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';

        return expect(kataController.findOne(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(200);
          });
      });

      it('should return kata in json body', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';

        return expect(kataController.findOne(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              id: '5b875a9797585d0029cb886d',
              name: 'my cool kata',
              description: 'this is how we do it',
              created_at: 'today',
            });
          });
      });
    });
  });

  describe('Create', () => {
    describe('when missing the name parameter', () => {
      it('should set status to 400', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.body.description = 'this is a kata description';

        return expect(kataController.create(req, res, next))
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

        req.body.description = 'this is a kata description';

        return expect(kataController.create(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Missing the Kata Name',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/katas\/post_api_v1_katas/),
            });
          });
      });
    });

    describe('when missing the description parameter', () => {
      it('should set status to 400', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.body.name = 'My Kata';

        return expect(kataController.create(req, res, next))
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

        req.body.name = 'My Kata';

        return expect(kataController.create(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Missing the Kata Description',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/katas\/post_api_v1_katas/),
            });
          });
      });
    });

    describe('when failed to save the kata', () => {
      before(() => sinon.stub(Kata.prototype, 'save').rejects(new Error('boom')));
      after(() => Kata.prototype.save.restore());

      it('should set status to 500', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.body.name = 'My Kata';
        req.body.description = 'this is a kata description';

        return expect(kataController.create(req, res, next))
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

        req.body.name = 'My Kata';
        req.body.description = 'this is a kata description';

        return expect(kataController.create(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Failed to add the kata',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/katas\/post_api_v1_katas/),
            });
          });
      });
    });

    describe('when succeeded to save the kata', () => {
      before(() => sinon.stub(Kata.prototype, 'save').resolves());
      after(() => Kata.prototype.save.restore());

      it('should set status to 201', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.body.name = 'My Kata';
        req.body.description = 'this is a kata description';

        return expect(kataController.create(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(201);
          });
      });

      it('should return kata in json body', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.body.name = 'My Kata';
        req.body.description = 'this is a kata description';

        return expect(kataController.create(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              id: sinon.match.string,
              name: 'My Kata',
              description: 'this is a kata description',
              created_at: sinon.match.any,
            });
          });
      });
    });
  });

  describe('Destroy', () => {
    describe('when Kata ID is missing (some how)', () => {
      it('should set status to 400', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        return expect(kataController.destroy(req, res, next))
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

        return expect(kataController.destroy(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Missing the Kata ID',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/katas\/delete_api_v1_katas__id_/),
            });
          });
      });
    });

    describe('when Kata ID is invalid', () => {
      it('should set status to 204', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = 'invalidID';

        return expect(kataController.destroy(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(204);
          });
      });
    });

    describe('when the kata does not exist', () => {
      it('should set status to 204', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';

        return expect(kataController.destroy(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(204);
          });
      });
    });

    describe('when failed to delete the kata', () => {
      before(() => sinon.stub(Kata, 'findByIdAndDelete').rejects(new Error('boom')));
      after(() => Kata.findByIdAndDelete.restore());

      it('should set status to 500', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';

        return expect(kataController.destroy(req, res, next))
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

        return expect(kataController.destroy(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              message: 'Error: Failed to delete the kata',
              moreInfo: sinon.match(/http(.+)\/docs\/#\/katas\/delete_api_v1_katas__id_/),
            });
          });
      });
    });

    describe('when Kata was found', () => {
      before(() => sinon.stub(Kata, 'findByIdAndDelete').resolves());
      after(() => Kata.findByIdAndDelete.restore());

      it('should set status to 204', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = '5b875a9797585d0029cb886d';

        return expect(kataController.destroy(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(204);
          });
      });
    });
  });
});
