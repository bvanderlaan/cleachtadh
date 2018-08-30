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
});
