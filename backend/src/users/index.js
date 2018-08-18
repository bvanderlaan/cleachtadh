'use strict';

const { getModel, createModel } = require('./user.model');

module.exports = () => (
  {
    createModel,
    get User() {
      return getModel();
    },
  }
);
