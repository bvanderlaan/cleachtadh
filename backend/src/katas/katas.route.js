'use strict';

const express = require('express');

const { find } = require('./katas.controller');

const router = express.Router();

module.exports = (passport) => {
  router.get('/v1/katas', find);

  return router;
};
