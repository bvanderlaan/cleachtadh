'use strict';

const nconf = require('../config');

module.exports = {
  get url() {
    return nconf.get('node_env') === 'test'
     ? 'mongodb://mongo_test:27017/cleachtadh'
     : 'mongodb://mongo:27017/cleachtadh';
  },
};
