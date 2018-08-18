'use strict';

const controller = require('./authenticate.controller');
const route = require('./authenticate.route');

module.exports = passport => (
  {
    controller,
    route: passport ? route(passport) : undefined,
  }
);
