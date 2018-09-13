'use strict';

const express = require('express');

const { login } = require('./authenticate.controller');

const router = express.Router();

module.exports = (passport) => {
  router.post('/v1/authenticate', passport.authenticate('local-login'), login);

  return router;
};
