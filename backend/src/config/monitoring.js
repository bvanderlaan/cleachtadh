'use strict';

const nconf = require('nconf');

function enableHeapDump() {
  if (nconf.get('heapdump') === 'enable') {
    // eslint-disable-next-line global-require
    require('heapdump');
  }
}

module.exports = () => {
  enableHeapDump();
};
