'use strict';

const controller = require('./katas.controller');
const route = require('./katas.route');
const { getModel } = require('./kata.model');

module.exports = passport => (
  {
    controller,
    route: passport ? route(passport) : undefined,
    get Kata() {
      return getModel();
    },
  }
);
