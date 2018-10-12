'use strict';

const express = require('express');

const { find } = require('./users.controller');
const { adminGuard } = require('./admin.guard');

const router = express.Router();

module.exports = (passport) => {
  router.get('/v1/users', passport.authenticate('jwt', { session: false }), adminGuard, find);

  return router;
};
