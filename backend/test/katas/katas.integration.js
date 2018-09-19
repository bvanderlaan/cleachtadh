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

describe('Integration :: Katas Route', () => {
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

    describe('when succeed to fetch kata\'s', () => {
      let kata1Id;
      let kata2Id;

      before('populate database', () => {
        const kata1 = new Kata();
        kata1.name = 'first kata';
        kata1.description = 'this is how we do it';
        kata1.addedById = 'myUserId';
        kata1.addedByName = 'Bruce Banner';

        const kata2 = new Kata();
        kata2.name = 'second kata';
        kata2.description = 'or you can do it that way I guess';
        kata2.addedById = 'myOtherUserId';
        kata2.addedByName = 'Hulk, The';

        return kata1.save()
          .then(() => kata2.save())
          .then(() => {
            kata1Id = kata1._id;
            kata2Id = kata2._id;
          });
      });
      after('Clean up database', () => (
        Promise.all([
          kata1Id ? Kata.findByIdAndDelete(kata1Id) : undefined,
          kata2Id ? Kata.findByIdAndDelete(kata2Id) : undefined,
        ])
      ));

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
                id: kata1Id.toString(),
                name: 'first kata',
                description: 'this is how we do it',
                addedBy: {
                  id: 'myUserId',
                  name: 'Bruce Banner',
                },
                created_at: sinon.match.date,
              }, {
                id: kata2Id.toString(),
                name: 'second kata',
                description: 'or you can do it that way I guess',
                addedBy: {
                  id: 'myOtherUserId',
                  name: 'Hulk, The',
                },
                created_at: sinon.match.date,
              }],
            });
          });
      });
    });
  });

  describe('FindOne', () => {
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

    describe('when Kata was found', () => {
      let kata1Id;

      before('populate database', () => {
        const kata1 = new Kata();
        kata1.name = 'first kata';
        kata1.description = 'this is how we do it';
        kata1.addedById = 'myUserId';
        kata1.addedByName = 'Bruce Banner';

        return kata1.save()
          .then(() => {
            kata1Id = kata1._id;
          });
      });
      after('Clean up database', () => (
        kata1Id ? Kata.findByIdAndDelete(kata1Id) : undefined
      ));

      it('should set status to 200', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = kata1Id;

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

        req.params.id = kata1Id;

        return expect(kataController.findOne(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              id: kata1Id.toString(),
              name: 'first kata',
              description: 'this is how we do it',
              addedBy: {
                id: 'myUserId',
                name: 'Bruce Banner',
              },
              created_at: sinon.match.date,
            });
          });
      });
    });
  });

  describe('Create', () => {
    describe('when succeeded to save the kata', () => {
      let kataId;

      after(() => (kataId ? Kata.findByIdAndDelete(kataId) : undefined));

      it('should set status to 201 and return the kata in the body', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.body.name = 'My New (create) Kata';
        req.body.description = 'this is a kata description';

        return expect(kataController.create(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(201);
            expect(res.json, 'json').to.have.been.calledOnce;
            expect(res.json, 'json').to.have.been.calledWith({
              id: sinon.match.string,
              name: 'My New (create) Kata',
              description: 'this is a kata description',
              addedBy: {
                id: 'myUserId',
                name: 'Bruce Banner',
              },
              created_at: sinon.match.any,
            });
          });
      });

      it('should insert entry in the database', () => (
        expect(Kata.findOne({ name: 'My New (create) Kata' }))
          .to.eventually.be.fulfilled
          .then((entry) => {
            expect(entry).to.have.property('_id');
            expect(entry).to.have.property('name', 'My New (create) Kata');
            expect(entry).to.have.property('description', 'this is a kata description');
            kataId = entry._id;
          })
      ));
    });
  });

  describe('Destroy', () => {
    let kataId;

    before('populate database', () => {
      const kata = new Kata();
      kata.name = 'delete this kata';
      kata.description = 'this is how we do it';
      kata.addedById = 'myUserId';
      kata.addedByName = 'Bruce Banner';

      return kata.save()
        .then(() => {
          kataId = kata._id;
        });
    });
    after('Clean up database', () => (kataId ? Kata.findByIdAndDelete(kataId) : undefined));

    describe('when Kata was found', () => {
      it('should set status to 204', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = kataId;

        return expect(kataController.destroy(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(204);
          });
      });

      it('should have removed the entry from the database', () => (
        expect(Kata.findById(kataId))
          .to.eventually.be.fulfilled
          .then((entry) => {
            expect(entry).to.be.null;
            kataId = null;
          })
      ));
    });
  });

  describe('Update', () => {
    let kataId;

    before('populate database', () => {
      const kata = new Kata();
      kata.name = 'update this kata';
      kata.description = 'this is how we do it';
      kata.addedById = 'myUserId';
      kata.addedByName = 'Bruce Banner';

      return kata.save()
        .then(() => {
          kataId = kata._id;
        });
    });
    after('Clean up database', () => (kataId ? Kata.findByIdAndDelete(kataId) : undefined));

    describe('when updating description', () => {
      it('should set status to 200', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = kataId;
        req.body.description = 'no this is how we do it';

        return expect(kataController.update(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(200);
          });
      });

      it('should have updated the entry in the database', () => (
        expect(Kata.findById(kataId))
          .to.eventually.be.fulfilled
          .then((entry) => {
            expect(entry).to.have.property('description', 'no this is how we do it');
          })
      ));
    });

    describe('when updating name', () => {
      it('should set status to 200', () => {
        const req = createRequest();
        const res = createResponse();
        const next = sinon.stub();

        req.params.id = kataId;
        req.body.name = 'updated';

        return expect(kataController.update(req, res, next))
          .to.eventually.be.fulfilled
          .then(() => {
            expect(res.status, 'status').to.have.been.calledOnce;
            expect(res.status, 'status').to.have.been.calledWith(200);
          });
      });

      it('should have updated the entry in the database', () => (
        expect(Kata.findById(kataId))
          .to.eventually.be.fulfilled
          .then((entry) => {
            expect(entry).to.have.property('name', 'updated');
          })
      ));
    });
  });
});
