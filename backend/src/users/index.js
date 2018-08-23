'use strict';

const { getModel } = require('./user.model');

module.exports = () => (
  {
    get User() {
      return getModel();
    },
  }
);
