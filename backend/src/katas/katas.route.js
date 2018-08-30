'use strict';

const express = require('express');

const { create, find } = require('./katas.controller');

const router = express.Router();

module.exports = (passport) => {
  router.get('/v1/katas', find);
  router.post('/v1/katas', create);

  return router;
};
