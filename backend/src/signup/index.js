'use strict';

const controller = require('./signup.controller');
const route = require('./signup.route');

module.exports = passport => (
  {
    controller,
    route: passport ? route(passport) : undefined,
  }
);
