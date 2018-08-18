'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const { controller: statusController } = require('../../src/status');

const { expect } = chai;
chai.use(sinonChai);

function createResponse() {
  const res = {
    json: sinon.stub(),
    status: sinon.stub(),
  };
  res.status.returns(res);

  return res;
}

describe('Unit :: Status Route', () => {
  it('should set status to 200', () => {
    const res = createResponse();
    const next = sinon.stub();

    statusController.get({}, res, next);

    expect(res.status, 'status').to.have.been.calledOnce;
    expect(res.status, 'status').to.have.been.calledWith(200);
  });

  it('should set body to json', () => {
    const res = createResponse();
    const next = sinon.stub();

    statusController.get({}, res, next);

    expect(res.json, 'json').to.have.been.calledOnce;
    expect(res.json, 'json').to.have.been.calledWith({
      name: '@vanderlaan/cleachtadh',
      version: sinon.match.string,
      message: 'up and running',
    });
  });

  it('should not call next', () => {
    const res = createResponse();
    const next = sinon.stub();

    statusController.get({}, res, next);

    expect(next, 'next').to.have.not.been.called;
  });
});
