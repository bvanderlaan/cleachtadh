'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const request = require('superagent');
const uuid = require('uuid/v4');

const server = require('../');

const { expect } = chai;
chai.use(chaiAsPromised);

const createUser = (...{ displayName = 'Groot', email = `i.am.groot+${uuid()}@email.com` }) => (
  request.post(`${server.url}/v1/signup`)
    .send({
      displayName,
      email,
      password: 'password',
    })
    .then(response => response.body)
);

describe('System :: Users Route', () => {
  let token;
  let userId;

  before('create user', () => (
    createUser()
      .then((user) => {
        token = user.token;
        userId = user.id;
      })
  ));

  describe('Find', () => {
    describe('when Not Authorized', () => {
      it('should return a 401', () => {
        const req = request.get(`${server.url}/v1/users`)
          .set('Authorization', 'Bearer not-my-token');

        return expect(req)
          .to.eventually.be.rejected
          .and.have.property('status', 401);
      });
    });

    describe('when not an admin user', () => {
      it('should return 401', () => {
        const req = request.get(`${server.url}/v1/users`)
          .set('Authorization', token);

        return expect(req)
          .to.eventually.be.rejected
          .and.have.property('status', 401);
      });
    });
  });

  describe('FindOne', () => {
    describe('when Not Authorized', () => {
      it('should return a 401', () => {
        const req = request.get(`${server.url}/v1/users/${userId}`)
          .set('Authorization', 'Bearer not-my-token');

        return expect(req)
          .to.eventually.be.rejected
          .and.have.property('status', 401);
      });
    });

    describe('when not an admin user', () => {
      it('should return 401', () => {
        const req = request.get(`${server.url}/v1/users/${userId}`)
          .set('Authorization', token);

        return expect(req)
          .to.eventually.be.rejected
          .and.have.property('status', 401);
      });
    });
  });

  describe('Destroy', () => {
    describe('when Not Authorized', () => {
      it('should return a 401', () => {
        const req = request.delete(`${server.url}/v1/users/${userId}`)
          .set('Authorization', 'Bearer not-my-token');

        return expect(req)
          .to.eventually.be.rejected
          .and.have.property('status', 401);
      });
    });

    describe('when not an admin user', () => {
      it('should return 401', () => {
        const req = request.delete(`${server.url}/v1/users/${userId}`)
          .set('Authorization', token);

        return expect(req)
          .to.eventually.be.rejected
          .and.have.property('status', 401);
      });
    });
  });

  describe('Update', () => {
    describe('when Not Authorized', () => {
      it('should return a 401', () => {
        const req = request.patch(`${server.url}/v1/users/${userId}`)
          .set('Authorization', 'Bearer not-my-token')
          .send({
            admin: true,
          });

        return expect(req)
          .to.eventually.be.rejected
          .and.have.property('status', 401);
      });
    });

    describe('when not an admin user', () => {
      it('should return 401', () => {
        const req = request.patch(`${server.url}/v1/users/${userId}`)
          .set('Authorization', token)
          .send({
            admin: true,
          });

        return expect(req)
          .to.eventually.be.rejected
          .and.have.property('status', 401);
      });
    });
  });
});
