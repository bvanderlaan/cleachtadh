'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiJson = require('chai-json-schema');
const request = require('superagent');

const server = require('../../test');

const { expect } = chai;

chai.use(chaiAsPromised);
chai.use(chaiJson);

describe('System :: Status Route', () => {
  it('should respond with 200', () => (
    expect(request.get(`${server.url}/status`))
      .to.eventually.be.fulfilled
      .and.have.property('status', 200)
  ));

  it('should respond with json', () => {
    const statusJsonSchema = {
      type: 'object',
      required: ['version', 'name', 'message'],
      properties: {
        name: {
          type: 'string',
        },
        version: {
          type: 'string',
        },
        message: {
          type: 'string',
        },
      },
    };
    return expect(request.get(`${server.url}/status`))
      .to.eventually.be.fulfilled
      .and.have.property('body')
      .then(body => expect(body).to.be.jsonSchema(statusJsonSchema));
  });
});
