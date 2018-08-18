'use strict';

const bunyan = require('bunyan');
const nconf = require('nconf');

const { name, version } = require('../../package.json');

module.exports.log = {};
module.exports.init = (options = {}) => {
  const log = module.exports.log;

  // Don't init twice
  if (Object.keys(log).length === 0) {
    const level = nconf.get('log_level');
    const loggingOptions = {
      level,
      name,
      version,
    };

    const logger = bunyan.createLogger(loggingOptions);
    Object.assign(log, logger);
    Object.setPrototypeOf(log, Object.getPrototypeOf(logger));
  }

  return log;
};
