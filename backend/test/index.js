'use strict';

const { expect } = require('chai');

let server;

module.exports = {};

before('Starting Server', function (done) {
  this.timeout(15000);
  server = require('../src/server'); // eslint-disable-line global-require
  server.once('ready', () => {
    module.exports.url = `${server.url}/api`;
    console.log('Server is listening', server.url); // eslint-disable-line no-console
    done();
  });
});

after('Closing Server', (done) => {
  if (!server) {
    done();
  }

  server.close((err) => {
    expect(err, 'Error shutting down the server').to.not.exist;
    console.log('Server shutdown'); // eslint-disable-line no-console
    done();
  });
});
