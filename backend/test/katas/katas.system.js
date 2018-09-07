'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const request = require('superagent');

const server = require('../');

const { expect } = chai;
chai.use(chaiAsPromised);

describe('System :: Katas Route', () => {
  describe('Find', () => {
    describe('when no kata\'s exist', () => {
      it('should return an empty collection', () => (
        expect(request.get(`${server.url}/v1/katas`))
          .to.eventually.be.fulfilled
          .then((response) => {
            expect(response).to.have.property('body');
            expect(response.body).to.deep.equals({
              katas: [],
            });
          })
      ));
    });

    describe('when succeed to fetch kata\'s', () => {
      let kata1Id;
      let kata2Id;

      before('populate database', () => {
        const kata1 = request.post(`${server.url}/v1/katas`)
          .send({
            name: 'my first system kata',
            description: 'this is how we do it',
          });

        const kata2 = request.post(`${server.url}/v1/katas`)
          .send({
            name: 'my second system kata',
            description: 'or you can do it that way I guess',
          });

        return Promise.all([kata1, kata2])
          .then(([response1, response2]) => {
            kata1Id = response1.body.id;
            kata2Id = response2.body.id;
          });
      });
      after('Clean up database', () => (
        Promise.all([
          kata1Id ? request.delete(`${server.url}/v1/katas/${kata1Id}`) : undefined,
          kata2Id ? request.delete(`${server.url}/v1/katas/${kata2Id}`) : undefined,
        ])
      ));

      it('should find all the katas', () => (
        expect(request.get(`${server.url}/v1/katas`))
          .to.eventually.be.fulfilled
          .then((response) => {
            expect(response).to.have.property('status', 200);
            expect(response).to.have.property('body');
            expect(response.body).to.have.property('katas')
              .which.is.an('array')
              .and.has.length(2);

            const kata1 = response.body.katas[0];
            expect(kata1, 'kata1').to.have.property('id');
            expect(kata1, 'kata1').to.have.property('name', 'my first system kata');
            expect(kata1, 'kata1').to.have.property('description', 'this is how we do it');
            expect(kata1, 'kata1').to.have.property('created_at');

            const kata2 = response.body.katas[1];
            expect(kata2, 'kata2').to.have.property('id');
            expect(kata2, 'kata2').to.have.property('name', 'my second system kata');
            expect(kata2, 'kata2')
              .to.have.property('description', 'or you can do it that way I guess');
            expect(kata2, 'kata2').to.have.property('created_at');
          })
      ));
    });
  });

  describe('FindOne', () => {
    let kataId;

    before('populate database', () => (
      request.post(`${server.url}/v1/katas`)
        .send({
          name: 'my system get kata',
          description: 'this is how we do it in a system test',
        })
        .then((response) => {
          kataId = response.body.id;
        })
    ));

    after('Clean up database', () => (
      kataId
        ? request.delete(`${server.url}/v1/katas/${kataId}`)
        : undefined
    ));

    describe('when the kata does not exist', () => {
      it('should return 404', () => (
        expect(request.get(`${server.url}/v1/katas/5b875a9797585d0029cb886d`))
          .to.eventually.be.rejectedWith('Not Found')
          .then((err) => {
            expect(err).to.have.property('response');
            expect(err.response).to.have.property('body');
            expect(err.response.body).to.deep.equals({
              message: 'Error: The Kata was not found',
              moreInfo: 'http://cleachtadh:8080/docs/#/katas/get_api_v1_katas__id_',
            });
          })
      ));
    });

    describe('when the kata ID is invalid', () => {
      it('should return 404', () => (
        expect(request.get(`${server.url}/v1/katas/not-valid-id`))
          .to.eventually.be.rejectedWith('Not Found')
          .then((err) => {
            expect(err).to.have.property('response');
            expect(err.response).to.have.property('body');
            expect(err.response.body).to.deep.equals({
              message: 'Error: The Kata was not found',
              moreInfo: 'http://cleachtadh:8080/docs/#/katas/get_api_v1_katas__id_',
            });
          })
      ));
    });

    describe('when Kata was found', () => {
      it('should set status to 200', () => (
        expect(request.get(`${server.url}/v1/katas/${kataId}`))
          .to.eventually.be.fulfilled
          .then((response) => {
            expect(response).to.have.property('status', 200);
            expect(response).to.have.property('body');
            expect(response.body).to.have.property('id', kataId);
            expect(response.body).to.have.property('name', 'my system get kata');
            expect(response.body)
              .to.have.property('description', 'this is how we do it in a system test');
            expect(response.body).to.have.property('created_at');
          })
      ));
    });
  });

  describe('Create', () => {
    describe('when missing name', () => {
      it('should return a 400', () => {
        const req = request.post(`${server.url}/v1/katas`)
          .send({
            description: 'this is how we do it in a system test',
          });

        return expect(req)
          .to.eventually.be.rejected
          .then((err) => {
            expect(err).to.have.property('status', 400);
            expect(err).to.have.property('response');
            expect(err.response).to.have.property('body');
            expect(err.response.body).to.deep.equals({
              message: 'Error: Missing the Kata Name',
              moreInfo: 'http://cleachtadh:8080/docs/#/katas/post_api_v1_katas',
            });
          });
      });
    });

    describe('when missing description', () => {
      it('should return a 400', () => {
        const req = request.post(`${server.url}/v1/katas`)
          .send({
            name: 'my system create kata',
          });

        return expect(req)
          .to.eventually.be.rejected
          .then((err) => {
            expect(err).to.have.property('status', 400);
            expect(err).to.have.property('response');
            expect(err.response).to.have.property('body');
            expect(err.response.body).to.deep.equals({
              message: 'Error: Missing the Kata Description',
              moreInfo: 'http://cleachtadh:8080/docs/#/katas/post_api_v1_katas',
            });
          });
      });
    });

    describe('when succeeded to save the kata', () => {
      let kataId;

      after(() => (
        kataId
          ? request.delete(`${server.url}/v1/katas/${kataId}`)
          : undefined
      ));

      it('should return the created Kata', () => {
        const req = request.post(`${server.url}/v1/katas`)
          .send({
            name: 'my system create kata',
            description: 'this is how we do it in a system test',
          });

        return expect(req)
          .to.eventually.be.fulfilled
          .then((response) => {
            expect(response).to.have.property('body');
            expect(response.body).to.have.property('id')
              .which.is.a('string');

            kataId = response.body.id;

            expect(response.body).to.have.property('name', 'my system create kata')
            expect(response.body).to.have.property('description', 'this is how we do it in a system test')
            expect(response.body).to.have.property('created_at')
              .which.is.a('string');
          });
      });

      it('should insert entry in the database', () => (
        expect(request.get(`${server.url}/v1/katas/${kataId}`))
          .to.eventually.be.fulfilled
          .then((response) => {
            expect(response).to.have.property('body');
            expect(response.body).to.have.property('id', kataId);
            expect(response.body).to.have.property('name', 'my system create kata');
            expect(response.body).to.have.property('description', 'this is how we do it in a system test');
          })
      ));
    });
  });

  describe('Destroy', () => {
    let kataId;

    before('populate database', () => (
      request.post(`${server.url}/v1/katas`)
        .send({
          name: 'my system delete kata',
          description: 'this is how we do it in a system test',
        })
        .then((response) => {
          kataId = response.body.id;
        })
    ));

    after('Clean up database', () => (
      kataId
        ? request.delete(`${server.url}/v1/katas/${kataId}`)
        : undefined
    ));

    describe('when Kata was found', () => {
      it('should return with 204', () => (
        expect(request.delete(`${server.url}/v1/katas/${kataId}`))
          .to.eventually.be.fulfilled
          .then((response) => {
            expect(response).to.have.property('status', 204);
          })
      ));

      it('should have removed the entry from the database', () => (
        expect(request.get(`${server.url}/v1/katas/${kataId}`))
          .to.eventually.be.rejectedWith('Not Found')
      ));
    });
  });
});