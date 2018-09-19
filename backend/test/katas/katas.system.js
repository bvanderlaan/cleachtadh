'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const request = require('superagent');
const uuid = require('uuid/v4');

const server = require('../');

const { expect } = chai;
chai.use(chaiAsPromised);

const createUser = (...{ displayName = 'Rocket Racoon', email = `rocket+${uuid()}@gmail.com` }) => (
  request.post(`${server.url}/v1/signup`)
    .send({
      displayName,
      email,
      password: 'password',
    })
    .then(response => response.body.token)
);

describe('System :: Katas Route', () => {
  let token;

  const createKata = kata => (
    request.post(`${server.url}/v1/katas`)
      .set('Authorization', `Bearer ${token}`)
      .send(kata)
  );

  const deleteKata = kataId => (
    request.delete(`${server.url}/v1/katas/${kataId}`)
      .set('Authorization', `Bearer ${token}`)
  );

  before('create user', () => (
    createUser()
      .then(userToken => (token = userToken))
  ));

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
        const kata1 = createKata({
          name: 'my first system kata',
          description: 'this is how we do it',
        });

        const kata2 = createKata({
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
          kata1Id ? deleteKata(kata1Id) : undefined,
          kata2Id ? deleteKata(kata2Id) : undefined,
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
            expect(kata1, 'kata1').to.have.property('addedBy');
            expect(kata1.addedBy, 'kata1').to.have.property('id');
            expect(kata1.addedBy, 'kata1').to.have.property('name', 'Rocket Racoon');

            const kata2 = response.body.katas[1];
            expect(kata2, 'kata2').to.have.property('id');
            expect(kata2, 'kata2').to.have.property('name', 'my second system kata');
            expect(kata2, 'kata2')
              .to.have.property('description', 'or you can do it that way I guess');
            expect(kata2, 'kata2').to.have.property('created_at');
            expect(kata2, 'kata2').to.have.property('addedBy');
            expect(kata2.addedBy, 'kata2').to.have.property('id');
            expect(kata2.addedBy, 'kata2').to.have.property('name', 'Rocket Racoon');
          })
      ));
    });
  });

  describe('FindOne', () => {
    let kataId;

    before('populate database', () => (
      createKata({
        name: 'my system get kata',
        description: 'this is how we do it in a system test',
      })
        .then((response) => {
          kataId = response.body.id;
        })
    ));

    after('Clean up database', () => (
      kataId
        ? deleteKata(kataId)
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
            expect(response.body).to.have.property('addedBy');
            expect(response.body.addedBy).to.have.property('id');
            expect(response.body.addedBy).to.have.property('name', 'Rocket Racoon');
          })
      ));
    });
  });

  describe('Create', () => {
    describe('when Not Authorized', () => {
      it('should return a 401', () => {
        const req = request.post(`${server.url}/v1/katas`)
          .set('Authorization', 'Bearer not-my-token')
          .send({
            description: 'this is how we do it in a system test',
          });

        return expect(req)
          .to.eventually.be.rejected
          .and.have.property('status', 401);
      });
    });

    describe('when missing name', () => {
      it('should return a 400', () => {
        const req = request.post(`${server.url}/v1/katas`)
          .set('Authorization', `Bearer ${token}`)
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
          .set('Authorization', `Bearer ${token}`)
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
          ? deleteKata(kataId)
          : undefined
      ));

      it('should return the created Kata', () => {
        const req = request.post(`${server.url}/v1/katas`)
          .set('Authorization', `Bearer ${token}`)
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

            expect(response.body).to.have.property('name', 'my system create kata');
            expect(response.body).to.have.property('description', 'this is how we do it in a system test');
            expect(response.body).to.have.property('created_at')
              .which.is.a('string');
            expect(response.body).to.have.property('addedBy');
            expect(response.body.addedBy).to.have.property('id');
            expect(response.body.addedBy).to.have.property('name', 'Rocket Racoon');
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
            expect(response.body).to.have.property('addedBy');
            expect(response.body.addedBy).to.have.property('id');
            expect(response.body.addedBy).to.have.property('name', 'Rocket Racoon');
          })
      ));
    });
  });

  describe('Destroy', () => {
    let kataId;

    before('populate database', () => (
      createKata({
        name: 'my system delete kata',
        description: 'this is how we do it in a system test',
      })
        .then((response) => {
          kataId = response.body.id;
        })
    ));

    after('Clean up database', () => (
      kataId
        ? deleteKata(kataId)
        : undefined
    ));

    describe('when not authorized', () => {
      it('should return with 401', () => (
        expect(request.delete(`${server.url}/v1/katas/${kataId}`))
          .to.eventually.be.rejected
          .and.have.property('status', 401)
      ));

      it('should not remove the entry from the database', () => (
        expect(request.get(`${server.url}/v1/katas/${kataId}`))
          .to.eventually.be.fulfilled
          .and.have.property('body')
          .which.has.property('id', kataId.toString())
      ));
    });

    describe('when Kata was found', () => {
      it('should return with 204', () => {
        const req = request.delete(`${server.url}/v1/katas/${kataId}`)
          .set('Authorization', `Bearer ${token}`);

        return expect(req)
          .to.eventually.be.fulfilled
          .and.have.property('status', 204);
      });

      it('should have removed the entry from the database', () => (
        expect(request.get(`${server.url}/v1/katas/${kataId}`))
          .to.eventually.be.rejectedWith('Not Found')
      ));
    });
  });

  describe('Update', () => {
    let kataId;

    before('populate database', () => (
      createKata({
        name: 'my system update kata',
        description: 'this is how we do it in a system test',
      })
        .then((response) => {
          kataId = response.body.id;
        })
    ));

    after('Clean up database', () => (
      kataId
        ? deleteKata(kataId)
        : undefined
    ));

    describe('when not Authorized', () => {
      it('should return with 401', () => {
        const data = {
          description: 'now that is the ticket',
        };
        return expect(request.patch(`${server.url}/v1/katas/${kataId}`, data))
          .to.eventually.be.rejected
          .and.have.property('status', 401);
      });

      it('should not have updated the entry in the database', () => (
        expect(request.get(`${server.url}/v1/katas/${kataId}`))
          .to.eventually.be.fulfilled
          .and.have.property('body')
          .which.has.property('description', 'this is how we do it in a system test')
      ));
    });

    describe('when updating description', () => {
      it('should return with 200', () => {
        const data = {
          description: 'now that is the ticket',
        };
        const req = request.patch(`${server.url}/v1/katas/${kataId}`, data)
          .set('Authorization', `Bearer ${token}`);

        return expect(req)
          .to.eventually.be.fulfilled
          .then((response) => {
            expect(response).to.have.property('status', 200);
          });
      });

      it('should have updated the entry in the database', () => (
        expect(request.get(`${server.url}/v1/katas/${kataId}`))
          .to.eventually.be.fulfilled
          .and.have.property('body')
          .which.has.property('description', 'now that is the ticket')
      ));
    });

    describe('when updating name', () => {
      it('should return with 200', () => {
        const data = {
          name: 'updated name',
        };
        const req = request.patch(`${server.url}/v1/katas/${kataId}`, data)
          .set('Authorization', `Bearer ${token}`);

        return expect(req)
          .to.eventually.be.fulfilled
          .then((response) => {
            expect(response).to.have.property('status', 200);
          });
      });

      it('should have updated the entry in the database', () => (
        expect(request.get(`${server.url}/v1/katas/${kataId}`))
          .to.eventually.be.fulfilled
          .and.have.property('body')
          .which.has.property('name', 'updated name')
      ));
    });

    describe('when updating both name and description', () => {
      it('should return with 200', () => {
        const data = {
          name: 'gilligan',
          description: 'and the rest',
        };
        const req = request.patch(`${server.url}/v1/katas/${kataId}`, data)
          .set('Authorization', `Bearer ${token}`);

        return expect(req)
          .to.eventually.be.fulfilled
          .then((response) => {
            expect(response).to.have.property('status', 200);
          });
      });

      it('should have updated the entry in the database', () => (
        expect(request.get(`${server.url}/v1/katas/${kataId}`))
          .to.eventually.be.fulfilled
          .then((response) => {
            expect(response.body).to.have.property('name', 'gilligan');
            expect(response.body).to.have.property('description', 'and the rest');
          })
      ));
    });

    describe('when using PUT to update both name and description', () => {
      it('should return with 200', () => {
        const data = {
          name: 'professor',
          description: 'and marry-ann',
        };
        const req = request.put(`${server.url}/v1/katas/${kataId}`, data)
          .set('Authorization', `Bearer ${token}`);

        return expect(req)
          .to.eventually.be.fulfilled
          .then((response) => {
            expect(response).to.have.property('status', 200);
          });
      });

      it('should have updated the entry in the database', () => (
        expect(request.get(`${server.url}/v1/katas/${kataId}`))
          .to.eventually.be.fulfilled
          .then((response) => {
            expect(response.body).to.have.property('name', 'professor');
            expect(response.body).to.have.property('description', 'and marry-ann');
          })
      ));
    });
  });
});
