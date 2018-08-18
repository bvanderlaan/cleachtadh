'use strict';

const nconf = require('nconf');

module.exports = nconf.use('memory')
  .env({
    separator: '__',
    lowerCase: true,
    parseValues: true,
  })
  .defaults({
    app_public_path: 'http://cleachtadh:8080',
    app_port: 8080,
    heapdump: 'enable',
    log_level: 'warn',
  });
