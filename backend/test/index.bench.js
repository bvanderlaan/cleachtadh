'use strict';

const { expect } = require('chai');

rootSuite(() => {
  let server;

  before((done) => {
    process.env.LOG_LEVEL = 'fatal';
    server = require('../src/server'); // eslint-disable-line global-require
    server.once('ready', () => {
      module.exports.url = `${server.url}/api`;
      console.log('Server is listening', server.url); // eslint-disable-line no-console
      done();
    });
  });
  after((done) => {
    server.close((err) => {
      expect(err, 'Error shutting down the server').to.not.exist;
      console.log('Server shutdown'); // eslint-disable-line no-console
      done();
    });
  });

  service('cleachtadh', () => `${server.url}/api/`);
});
