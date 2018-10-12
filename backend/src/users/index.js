'use strict';

const { getModel } = require('./user.model');
const controller = require('./users.controller');
const route = require('./users.route');

module.exports = passport => (
  {
    controller,
    route: passport ? route(passport) : undefined,
    get User() {
      return getModel();
    },
  }
);
