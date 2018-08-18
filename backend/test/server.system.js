'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiJson = require('chai-json-schema');
const request = require('superagent');

const server = require('../test');
const { description, version } = require('../package.json');

const { expect } = chai;

chai.use(chaiAsPromised);
chai.use(chaiJson);

describe('System ::', () => {
  let token;
  // TODO: generate a token

  describe('Invalid Route', () => {
    describe('Non-Existing GET route', () => {
      it('should respond with 404', () => {
        const req = request.get(`${server.url}/v1/hello`)
          .set('Authorization', `Bearer ${token}`);

        return expect(req)
          .to.eventually.be.rejected
          .and.have.property('status', 404);
      });

      it('should respond with body with error object', () => {
        const req = request.get(`${server.url}/v1/hello`)
          .set('Authorization', `Bearer ${token}`);

        return expect(req)
          .to.eventually.be.rejected
          .and.have.property('response')
          .which.has.property('body')
          .that.deep.equals({
            moreInfo: 'http://cleachtadh:8080/docs/',
            message: 'Not Found: Cannot GET /api/v1/hello',
          });
      });
    });

    describe('Non-Existing DELETE route', () => {
      it('should respond with 404', () => {
        const req = request.delete(`${server.url}/v1/hello`)
          .set('Authorization', `Bearer ${token}`);

        return expect(req)
          .to.eventually.be.rejected
          .and.have.property('status', 404);
      });

      it('should respond with body with error object', () => {
        const req = request.delete(`${server.url}/v1/hello`)
          .set('Authorization', `Bearer ${token}`);

        return expect(req)
          .to.eventually.be.rejected
          .and.have.property('response')
          .which.has.property('body')
          .that.deep.equals({
            moreInfo: 'http://cleachtadh:8080/docs/',
            message: 'Not Found: Cannot DELETE /api/v1/hello',
          });
      });
    });

    describe('Non-Existing non-versioned GET route', () => {
      it('should respond with 404', () => {
        const req = request.get(`${server.url}/hello`)
          .set('Authorization', `Bearer ${token}`);

        return expect(req)
          .to.eventually.be.rejected
          .and.have.property('status', 404);
      });

      it('should respond with body with error object', () => {
        const req = request.get(`${server.url}/hello`)
          .set('Authorization', `Bearer ${token}`);

        return expect(req)
          .to.eventually.be.rejected
          .and.have.property('response')
          .which.has.property('body')
          .that.deep.equals({
            moreInfo: 'http://cleachtadh:8080/docs/',
            message: 'Not Found: Cannot GET /api/hello',
          });
      });
    });
  });

  describe('OAS', () => {
    describe('Fetch JSON OAS', () => {
      it('should respond with 200', () => {
        const req = request.get(`${server.url.replace('/api', '')}/docs.json`);

        return expect(req)
          .to.eventually.be.fulfilled
          .and.have.property('status', 200);
      });

      it('should respond with JSON OAS in body', () => {
        const req = request.get(`${server.url.replace('/api', '')}/docs.json`);

        return expect(req)
          .to.eventually.be.fulfilled
          .and.have.property('body')
          .which.has.property('info')
          .that.deep.equals({
            description,
            version,
            title: 'cleachtadh',
          });
      });
    });

    describe('Fetch YAML OAS', () => {
      it('should respond with 200', () => {
        const req = request.get(`${server.url.replace('/api', '')}/docs.yaml`);

        return expect(req)
          .to.eventually.be.fulfilled
          .and.have.property('status', 200);
      });

      it('should respond with YAML OAS in body', () => {
        const req = request.get(`${server.url.replace('/api', '')}/docs.yaml`);

        const pattern = `(?:description: ${description}\\n\\s+version: ${version}\\n\\s+title: cleachtadh)`;
        const regex = new RegExp(pattern);

        return expect(req)
          .to.eventually.be.fulfilled
          .and.have.property('text')
          .which.match(regex);
      });
    });
  });
});
