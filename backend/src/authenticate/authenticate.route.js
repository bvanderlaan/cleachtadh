'use strict';

const express = require('express');

const { login } = require('./authenticate.controller');

const router = express.Router();

module.exports = (passport) => {
  router.post('/authenticate', passport.authenticate('local-login'), login);

  return router;
};
