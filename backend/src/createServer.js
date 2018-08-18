'use strict';

const fs = require('fs');
const http = require('http');
const https = require('https');
const nconf = require('nconf');

const { log } = require('./config/logger');

const certPath = nconf.get('https_certificate');
const keyPath = nconf.get('https_key');

module.exports = {
  create(app) {
    if (certPath) {
      if (!keyPath) {
        throw Error('MissingTLSKey');
      }

      const credentials = {
        cert: fs.readFileSync(certPath, 'utf8'),
        key: fs.readFileSync(keyPath, 'utf8'),
      };

      log.info('Creating TLS server');
      return https.createServer(credentials, app);
    }

    log.info('Creating non-TLS server');
    return http.createServer(app);
  },

  get protocol() {
    return certPath ? 'https' : 'http';
  },
};
